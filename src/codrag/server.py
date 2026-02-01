"""
CoDRAG FastAPI server.

Main HTTP API for the CoDRAG daemon.

Usage:
    python -m codrag.server --repo-root /path/to/repo --index-dir ./codrag_data --port 8400
"""

from __future__ import annotations

import argparse
import hashlib
import json
import logging
import threading
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

import requests
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from codrag import __version__
from codrag.api.envelope import ApiException, install_api_exception_handlers, ok
from codrag.core import CodeIndex, OllamaEmbedder
from codrag.core.repo_policy import ensure_repo_policy
from codrag.core.repo_profile import profile_repo
from codrag.core.trace import TraceBuilder, TraceIndex
from codrag.core.watcher import AutoRebuildWatcher
from codrag.mcp_config import generate_mcp_configs

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="CoDRAG",
    description="Code Documentation and RAG - Multi-project semantic search platform",
    version=__version__,
)
install_api_exception_handlers(app)

# CORS for dashboard
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global state
_index: Optional[CodeIndex] = None
_trace_index: Optional[TraceIndex] = None
_config: Dict[str, Any] = {}
_build_lock = threading.Lock()
_build_thread: Optional[threading.Thread] = None
_trace_build_thread: Optional[threading.Thread] = None
_last_build_result: Optional[Dict[str, Any]] = None
_last_build_error: Optional[str] = None
_watcher: Optional[AutoRebuildWatcher] = None
_SERVER_STARTED_AT = datetime.now(timezone.utc).isoformat()


_DEFAULT_UI_CONFIG: Dict[str, Any] = {
    "repo_root": "",
    "core_roots": [],
    "working_roots": [],
    "include_globs": ["**/*.md", "**/*.py", "**/*.ts", "**/*.tsx", "**/*.js", "**/*.json"],
    "exclude_globs": [
        "**/.git/**",
        "**/.venv/**",
        "**/__pycache__/**",
        "**/node_modules/**",
        "**/dist/**",
        "**/build/**",
        "**/.next/**",
        "**/*.map",
        "**/*.lock",
    ],
    "max_file_bytes": 400_000,
}


def _ui_config_path() -> Path:
    index_dir = Path(_config.get("index_dir", "./codrag_data"))
    return index_dir / "ui_config.json"


def _default_ui_config() -> Dict[str, Any]:
    repo_root = str(_config.get("repo_root") or "")

    cfg: Dict[str, Any] = dict(_DEFAULT_UI_CONFIG)
    cfg["repo_root"] = repo_root

    if repo_root:
        rr = Path(repo_root)
        core: List[str] = []
        for cand in ["Docs_Halley/_MASTER_CROSSREFERENCE", "halley_core", "code_index"]:
            if (rr / cand).exists():
                core.append(cand)
        cfg["core_roots"] = core

    return cfg


def _load_ui_config() -> Dict[str, Any]:
    path = _ui_config_path()
    data: Optional[Dict[str, Any]] = None
    if path.exists():
        try:
            raw = json.loads(path.read_text())
            if isinstance(raw, dict):
                data = raw
        except Exception:
            data = None

    cfg = _default_ui_config()
    if data:
        for key in [
            "repo_root",
            "core_roots",
            "working_roots",
            "include_globs",
            "exclude_globs",
            "max_file_bytes",
        ]:
            if key in data:
                cfg[key] = data[key]
    return cfg


def _save_ui_config(cfg: Dict[str, Any]) -> None:
    path = _ui_config_path()
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(cfg, indent=2))


def _project_id_for_root(root: str) -> str:
    h = hashlib.sha256(root.encode("utf-8")).hexdigest()[:8]
    return f"proj_{h}"


def _current_project() -> Dict[str, Any] | None:
    ui_cfg = _load_ui_config()
    root = str(ui_cfg.get("repo_root") or "") or str(_config.get("repo_root") or "")
    root = root.strip()
    if not root:
        return None

    abs_root = str(Path(root).resolve())
    project_id = _project_id_for_root(abs_root)
    watch = _watcher.status() if _watcher is not None else None

    config: Dict[str, Any] = {
        "include_globs": list(ui_cfg.get("include_globs") or []),
        "exclude_globs": list(ui_cfg.get("exclude_globs") or []),
        "max_file_bytes": int(ui_cfg.get("max_file_bytes") or 500_000),
        "trace": {"enabled": False},
        "auto_rebuild": {"enabled": bool((watch or {}).get("enabled", False))},
    }
    if watch is not None and watch.get("debounce_ms") is not None:
        config["auto_rebuild"]["debounce_ms"] = watch.get("debounce_ms")

    return {
        "id": project_id,
        "name": Path(abs_root).name or project_id,
        "path": abs_root,
        "mode": "standalone",
        "config": config,
        "created_at": _SERVER_STARTED_AT,
        "updated_at": _SERVER_STARTED_AT,
    }


def _require_project(project_id: str) -> Dict[str, Any]:
    proj = _current_project()
    if proj is None or str(proj.get("id")) != project_id:
        raise ApiException(
            status_code=404,
            code="PROJECT_NOT_FOUND",
            message=f"Project with ID '{project_id}' not found",
            hint="Add the project first or select an existing project.",
        )
    return proj


def _project_index_status(idx: CodeIndex) -> Dict[str, Any]:
    st = idx.stats()
    last_error = None
    if _last_build_error:
        last_error = {"code": "BUILD_FAILED", "message": str(_last_build_error)}

    return {
        "exists": bool(st.get("loaded", False)),
        "total_chunks": int(st.get("total_documents") or 0),
        "embedding_dim": int(st.get("embedding_dim") or 0) if st.get("embedding_dim") is not None else None,
        "embedding_model": st.get("model"),
        "last_build_at": st.get("built_at"),
        "last_error": last_error,
    }


def _project_trace_status() -> Dict[str, Any]:
    global _trace_index, _trace_build_thread
    
    building = _trace_build_thread is not None and _trace_build_thread.is_alive()
    
    if _trace_index is None:
        index_dir = Path(_config.get("index_dir") or "./codrag_data")
        _trace_index = TraceIndex(index_dir)
    
    status = _trace_index.status()
    status["building"] = building
    return status


def _get_trace_index() -> TraceIndex:
    global _trace_index
    if _trace_index is None:
        index_dir = Path(_config.get("index_dir") or "./codrag_data")
        _trace_index = TraceIndex(index_dir)
    return _trace_index


def _is_trace_building() -> bool:
    global _trace_build_thread
    return _trace_build_thread is not None and _trace_build_thread.is_alive()


def _start_trace_build(repo_root: str, include_globs: Optional[List[str]] = None, exclude_globs: Optional[List[str]] = None) -> bool:
    global _trace_build_thread, _trace_index
    
    if _is_trace_building():
        return False
    
    index_dir = Path(_config.get("index_dir") or "./codrag_data")
    
    def build_task():
        global _trace_index
        try:
            builder = TraceBuilder(
                repo_root=Path(repo_root),
                index_dir=index_dir,
                include_globs=include_globs,
                exclude_globs=exclude_globs,
            )
            builder.build()
            _trace_index = TraceIndex(index_dir)
            _trace_index.load()
            logger.info("Trace build completed successfully")
        except Exception as e:
            logger.error(f"Trace build failed: {e}")
    
    _trace_build_thread = threading.Thread(target=build_task, daemon=True)
    _trace_build_thread.start()
    return True


# =============================================================================
# Pydantic Models
# =============================================================================

class HealthResponse(BaseModel):
    status: str
    version: str


class BuildRequest(BaseModel):
    project_root: Optional[str] = None
    repo_root: Optional[str] = None
    roots: Optional[List[str]] = None
    include_globs: Optional[List[str]] = None
    exclude_globs: Optional[List[str]] = None
    max_file_bytes: Optional[int] = None


class PolicyRequest(BaseModel):
    repo_root: Optional[str] = None
    force: bool = False


class WatchRequest(BaseModel):
    repo_root: Optional[str] = None
    debounce_ms: Optional[int] = None
    min_rebuild_gap_ms: Optional[int] = None


class SearchRequest(BaseModel):
    query: str
    k: int = 8
    min_score: float = 0.15


class ContextRequest(BaseModel):
    query: str
    k: int = 5
    max_chars: int = 6000
    include_sources: bool = True
    include_scores: bool = False
    min_score: float = 0.15
    structured: bool = False


class ChunkRequest(BaseModel):
    chunk_id: str


class AddProjectRequest(BaseModel):
    path: str
    name: Optional[str] = None
    mode: str = "standalone"


# =============================================================================
# Index Helpers
# =============================================================================

def _get_index() -> CodeIndex:
    global _index
    if _index is None:
        index_dir = Path(_config.get("index_dir", "./codrag_data"))
        ollama_url = _config.get("ollama_url", "http://localhost:11434")
        model = _config.get("model", "nomic-embed-text")
        embedder = OllamaEmbedder(model=model, base_url=ollama_url)
        _index = CodeIndex(index_dir=index_dir, embedder=embedder)
    return _index


def _is_building() -> bool:
    return _build_thread is not None and _build_thread.is_alive()


def _start_build(
    repo_root: str,
    roots: Optional[List[str]],
    include_globs: Optional[List[str]],
    exclude_globs: Optional[List[str]],
    max_file_bytes: int,
) -> bool:
    global _build_thread

    with _build_lock:
        if _is_building():
            return False

        _build_thread = threading.Thread(
            target=_build_worker,
            args=(repo_root, roots, include_globs, exclude_globs, max_file_bytes),
            daemon=True,
        )
        _build_thread.start()

    return True


def _build_worker(
    repo_root: str,
    roots: Optional[List[str]],
    include_globs: Optional[List[str]],
    exclude_globs: Optional[List[str]],
    max_file_bytes: int,
):
    global _last_build_result, _last_build_error, _build_thread

    try:
        idx = _get_index()
        meta = idx.build(
            repo_root=Path(repo_root),
            roots=roots,
            include_globs=include_globs,
            exclude_globs=exclude_globs,
            max_file_bytes=max_file_bytes,
        )
        _last_build_result = meta
        _last_build_error = None
    except Exception as e:
        logger.exception("Build failed")
        _last_build_error = str(e)
    finally:
        _build_thread = None


# =============================================================================
# Health & Info Endpoints
# =============================================================================

@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    """Health check endpoint."""
    return HealthResponse(status="ok", version=__version__)


@app.get("/")
def root() -> dict:
    """Root endpoint with API info."""
    return {
        "name": "CoDRAG",
        "version": __version__,
        "description": "Code Documentation and RAG",
        "docs": "/docs",
        "health": "/health",
        "api": "/api/code-index/status",
    }


@app.get("/projects")
def list_projects() -> Dict[str, Any]:
    proj = _current_project()
    projects: List[Dict[str, Any]] = []
    if proj is not None:
        projects.append(
            {
                "id": proj.get("id"),
                "name": proj.get("name"),
                "path": proj.get("path"),
                "mode": proj.get("mode"),
                "created_at": proj.get("created_at"),
                "updated_at": proj.get("updated_at"),
                "config": proj.get("config"),
            }
        )
    return ok({"projects": projects, "total": len(projects)})


@app.post("/projects")
def add_project(req: AddProjectRequest) -> Dict[str, Any]:
    if req.mode not in ("standalone", "embedded"):
        raise ApiException(status_code=400, code="VALIDATION_ERROR", message="Invalid mode")

    if _is_building():
        raise ApiException(status_code=409, code="BUILD_ALREADY_RUNNING", message="Build already running")

    p = Path(str(req.path)).expanduser().resolve()
    if not p.exists() or not p.is_dir():
        raise ApiException(
            status_code=400,
            code="VALIDATION_ERROR",
            message=f"Path does not exist: {p}",
        )

    cfg = _load_ui_config()
    cfg["repo_root"] = str(p)
    _save_ui_config(cfg)

    configure(
        repo_root=str(p),
        index_dir=str(_config.get("index_dir") or "./codrag_data"),
        ollama_url=str(_config.get("ollama_url") or "http://localhost:11434"),
        model=str(_config.get("model") or "nomic-embed-text"),
    )

    proj = _current_project()
    if proj is None:
        raise ApiException(status_code=500, code="INTERNAL_ERROR", message="Failed to create project")
    return ok({"project": proj})


@app.get("/projects/{project_id}/status")
def get_project_status(project_id: str) -> Dict[str, Any]:
    _require_project(project_id)
    idx = _get_index()

    watch = _watcher.status() if _watcher is not None else {"enabled": False, "state": "disabled"}
    data = {
        "building": _is_building(),
        "stale": bool(watch.get("stale", False)),
        "index": _project_index_status(idx),
        "trace": _project_trace_status(),
        "watch": watch,
    }
    return ok(data)


@app.post("/projects/{project_id}/build")
def build_project(project_id: str, full: bool = False) -> Dict[str, Any]:
    _require_project(project_id)

    ui_cfg = _load_ui_config()
    repo_root = str(ui_cfg.get("repo_root") or "") or _config.get("repo_root")
    if not repo_root:
        raise ApiException(status_code=400, code="VALIDATION_ERROR", message="repo_root is required")

    roots = list(ui_cfg.get("core_roots") or []) + list(ui_cfg.get("working_roots") or [])
    roots = roots or None
    include_globs = ui_cfg.get("include_globs") or None
    exclude_globs = ui_cfg.get("exclude_globs") or None
    max_file_bytes = int(ui_cfg.get("max_file_bytes") or 500_000)

    started = _start_build(str(repo_root), roots, include_globs, exclude_globs, max_file_bytes)
    if not started:
        raise ApiException(status_code=409, code="BUILD_ALREADY_RUNNING", message="Build already running")
    return ok({"started": True, "building": True, "build_id": None})


@app.post("/projects/{project_id}/search")
def search_project(project_id: str, req: SearchRequest) -> Dict[str, Any]:
    _require_project(project_id)
    if not req.query.strip():
        raise ApiException(status_code=400, code="VALIDATION_ERROR", message="query is required")

    idx = _get_index()
    if not idx.is_loaded():
        raise ApiException(
            status_code=409,
            code="INDEX_NOT_BUILT",
            message="Index has not been built yet",
            hint="Run a build first.",
        )

    results = idx.search(req.query, k=req.k, min_score=req.min_score)
    out: List[Dict[str, Any]] = []
    for r in results:
        d = r.doc
        content = str(d.get("content") or "")
        out.append(
            {
                "chunk_id": str(d.get("id") or ""),
                "source_path": str(d.get("source_path") or ""),
                "span": {"start_line": 1, "end_line": 1},
                "preview": content[:200],
                "score": float(r.score),
            }
        )
    return ok({"results": out})


@app.post("/projects/{project_id}/context")
def context_project(project_id: str, req: ContextRequest) -> Dict[str, Any]:
    _require_project(project_id)
    if not req.query.strip():
        raise ApiException(status_code=400, code="VALIDATION_ERROR", message="query is required")

    idx = _get_index()
    if not idx.is_loaded():
        raise ApiException(
            status_code=409,
            code="INDEX_NOT_BUILT",
            message="Index has not been built yet",
            hint="Run a build first.",
        )

    if not req.structured:
        ctx = idx.get_context(
            req.query,
            k=req.k,
            max_chars=req.max_chars,
            include_sources=req.include_sources,
            include_scores=req.include_scores,
            min_score=req.min_score,
        )
        return ok({"context": ctx})

    results = idx.search(req.query, k=req.k, min_score=req.min_score)
    parts: List[str] = []
    chunks: List[Dict[str, Any]] = []
    total = 0

    for r in results:
        d = r.doc
        chunk_id = str(d.get("id") or "")
        source_path = str(d.get("source_path") or "")
        section = str(d.get("section") or "")

        header_bits: List[str] = []
        if section:
            header_bits.append(section)
        if source_path:
            header_bits.append(f"@{source_path}")
        header = " | ".join(header_bits) if header_bits else source_path

        sep = "\n\n---\n\n" if parts else ""
        remaining = int(req.max_chars) - total
        if remaining <= 0 or len(sep) >= remaining:
            break

        prefix = f"[{header}]\n" if header else ""
        allowed = remaining - len(sep)
        if len(prefix) >= allowed:
            break

        text = str(d.get("content") or "")
        if len(prefix) + len(text) > allowed:
            text_allowed = allowed - len(prefix)
            if text_allowed > 200:
                text = text[: max(0, text_allowed - 3)] + "..."
            else:
                break

        block = prefix + text
        parts.append(sep + block)
        total += len(sep) + len(block)
        chunks.append(
            {
                "chunk_id": chunk_id,
                "source_path": source_path,
                "span": {"start_line": 1, "end_line": 1},
                "score": float(r.score),
                "text": text,
            }
        )
        if text.endswith("..."):
            break

    context_str = "".join(parts)
    return ok(
        {
            "context": context_str,
            "chunks": chunks,
            "total_chars": total,
            "estimated_tokens": total // 4,
        }
    )


@app.get("/projects/{project_id}/trace/status")
def trace_status_project(project_id: str) -> Dict[str, Any]:
    _require_project(project_id)
    return ok(_project_trace_status())


@app.post("/projects/{project_id}/trace/build")
def build_trace_project(project_id: str) -> Dict[str, Any]:
    _require_project(project_id)
    
    if _is_trace_building():
        raise ApiException(status_code=409, code="TRACE_BUILD_ALREADY_RUNNING", message="Trace build already running")
    
    ui_cfg = _load_ui_config()
    repo_root = str(ui_cfg.get("repo_root") or "") or _config.get("repo_root")
    if not repo_root:
        raise ApiException(status_code=400, code="VALIDATION_ERROR", message="repo_root is required")
    
    include_globs = ui_cfg.get("include_globs") or None
    exclude_globs = ui_cfg.get("exclude_globs") or None
    
    started = _start_trace_build(repo_root, include_globs, exclude_globs)
    if not started:
        raise ApiException(status_code=409, code="TRACE_BUILD_ALREADY_RUNNING", message="Trace build already running")
    
    return ok({"started": True, "building": True})


@app.get("/projects/{project_id}/trace/search")
def search_trace_project(project_id: str, query: str, kind: Optional[str] = None, limit: int = 50) -> Dict[str, Any]:
    _require_project(project_id)
    
    if not query.strip():
        raise ApiException(status_code=400, code="VALIDATION_ERROR", message="query is required")
    
    trace_idx = _get_trace_index()
    if not trace_idx.exists():
        raise ApiException(
            status_code=409,
            code="TRACE_NOT_BUILT",
            message="Trace index has not been built yet",
            hint="Run a trace build first.",
        )
    
    if not trace_idx.is_loaded():
        trace_idx.load()
    
    results = trace_idx.search_nodes(query, kind=kind, limit=min(limit, 100))
    return ok({"results": results, "total": len(results)})


@app.get("/projects/{project_id}/trace/nodes/{node_id}")
def get_trace_node(project_id: str, node_id: str) -> Dict[str, Any]:
    _require_project(project_id)
    
    trace_idx = _get_trace_index()
    if not trace_idx.exists():
        raise ApiException(status_code=409, code="TRACE_NOT_BUILT", message="Trace index has not been built yet")
    
    if not trace_idx.is_loaded():
        trace_idx.load()
    
    node = trace_idx.get_node(node_id)
    if node is None:
        raise ApiException(status_code=404, code="NODE_NOT_FOUND", message=f"Node not found: {node_id}")
    
    return ok({"node": node})


@app.get("/projects/{project_id}/trace/nodes/{node_id}/neighbors")
def get_trace_node_neighbors(
    project_id: str,
    node_id: str,
    direction: str = "both",
    edge_kinds: Optional[str] = None,
    max_nodes: int = 50,
) -> Dict[str, Any]:
    _require_project(project_id)
    
    trace_idx = _get_trace_index()
    if not trace_idx.exists():
        raise ApiException(status_code=409, code="TRACE_NOT_BUILT", message="Trace index has not been built yet")
    
    if not trace_idx.is_loaded():
        trace_idx.load()
    
    node = trace_idx.get_node(node_id)
    if node is None:
        raise ApiException(status_code=404, code="NODE_NOT_FOUND", message=f"Node not found: {node_id}")
    
    edge_kinds_list = edge_kinds.split(",") if edge_kinds else None
    neighbors = trace_idx.get_neighbors(node_id, direction=direction, edge_kinds=edge_kinds_list, max_nodes=min(max_nodes, 100))
    
    return ok(neighbors)


@app.get("/llm/status")
def get_llm_status() -> Dict[str, Any]:
    ollama_url = str(_config.get("ollama_url") or "http://localhost:11434").rstrip("/")
    connected = False
    models: List[str] = []
    try:
        r = requests.get(f"{ollama_url}/api/tags", timeout=2)
        if r.status_code == 200:
            payload = r.json()
            raw_models = payload.get("models") if isinstance(payload, dict) else None
            if isinstance(raw_models, list):
                for m in raw_models:
                    if isinstance(m, dict) and m.get("name"):
                        models.append(str(m.get("name")))
            connected = True
    except Exception:
        connected = False
        models = []

    return ok(
        {
            "ollama": {"url": ollama_url, "connected": connected, "models": models},
            "clara": {"url": "http://localhost:8765", "enabled": False, "connected": False},
        }
    )


@app.post("/llm/test")
def test_llm() -> Dict[str, Any]:
    ollama_url = str(_config.get("ollama_url") or "http://localhost:11434").rstrip("/")
    ollama_connected = False
    try:
        r = requests.get(f"{ollama_url}/api/tags", timeout=2)
        if r.status_code == 200:
            ollama_connected = True
    except Exception:
        ollama_connected = False

    return ok(
        {
            "ollama": {"connected": ollama_connected},
            "clara": {"connected": False},
        }
    )


@app.get("/api/code-index/config")
def get_ui_config():
    return _load_ui_config()


@app.put("/api/code-index/config")
def put_ui_config(data: Dict[str, Any]):
    cfg = _load_ui_config()
    for key in [
        "repo_root",
        "core_roots",
        "working_roots",
        "include_globs",
        "exclude_globs",
        "max_file_bytes",
    ]:
        if key in data:
            cfg[key] = data[key]
    _save_ui_config(cfg)
    return cfg


@app.get("/api/code-index/mcp-config")
def mcp_config(
    request: Request,
    ide: str = "cursor",
    mode: str = "auto",
    project_id: Optional[str] = None,
    daemon_url: Optional[str] = None,
):
    resolved_daemon_url = daemon_url or str(request.base_url).rstrip("/")
    try:
        configs = generate_mcp_configs(
            ide=ide,
            daemon_url=resolved_daemon_url,
            codrag_command="codrag",
            mode=mode,
            project_id=project_id,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    if ide == "all":
        return {"daemon_url": resolved_daemon_url, "configs": configs}

    key = next(iter(configs))
    return {"daemon_url": resolved_daemon_url, **configs[key]}


@app.get("/api/code-index/available-roots")
def available_roots(repo_root: Optional[str] = None):
    cfg = _load_ui_config()
    root = repo_root or str(cfg.get("repo_root") or "") or _config.get("repo_root")
    if not root:
        raise HTTPException(status_code=400, detail="repo_root is required")

    project_root = Path(root).resolve()
    if not project_root.exists() or not project_root.is_dir():
        raise HTTPException(status_code=400, detail=f"repo_root not found: {project_root}")

    roots: List[str] = []

    docs_halley = project_root / "Docs_Halley"
    if docs_halley.exists():
        for item in sorted(docs_halley.iterdir()):
            if item.is_dir() and item.name.startswith("Phase"):
                roots.append(f"Docs_Halley/{item.name}")

    known = [
        "Docs_Halley/_MASTER_CROSSREFERENCE",
        "halley_core",
        "halley_core/frontend/src",
        "code_index",
        "config",
    ]
    for k in known:
        if (project_root / k).exists() and k not in roots:
            roots.append(k)

    ignore = {".git", ".venv", "node_modules", "__pycache__", ".next", "dist", "build"}
    try:
        for item in sorted(project_root.iterdir()):
            if not item.is_dir():
                continue
            if item.name.startswith("."):
                continue
            if item.name in ignore:
                continue
            if item.name not in roots:
                roots.append(item.name)
    except Exception:
        pass

    return {"roots": roots}


# =============================================================================
# Code Index API (Working Endpoints)
# =============================================================================

@app.get("/api/code-index/status")
def status():
    """Get index status and build state."""
    idx = _get_index()
    return {
        "index": idx.stats(),
        "building": _is_building(),
        "last_build": _last_build_result,
        "last_error": _last_build_error,
        "watch": _watcher.status() if _watcher is not None else {"enabled": False, "state": "disabled"},
        "context_defaults": {
            "k": 5,
            "max_chars": 6000,
        },
        "config": {
            "repo_root": _config.get("repo_root"),
            "index_dir": _config.get("index_dir"),
            "ollama_url": _config.get("ollama_url"),
            "model": _config.get("model"),
        },
    }


@app.post("/api/code-index/build")
def build(req: BuildRequest):
    """Start an async index build."""

    ui_cfg = _load_ui_config()
    repo_root = req.repo_root or req.project_root or str(ui_cfg.get("repo_root") or "") or _config.get("repo_root")
    if not repo_root:
        raise HTTPException(status_code=400, detail="repo_root is required")

    roots = req.roots
    if roots is None:
        combined = list(ui_cfg.get("core_roots") or []) + list(ui_cfg.get("working_roots") or [])
        roots = combined or None

    include_globs = req.include_globs if req.include_globs is not None else (ui_cfg.get("include_globs") or None)
    exclude_globs = req.exclude_globs if req.exclude_globs is not None else (ui_cfg.get("exclude_globs") or None)
    max_file_bytes = int(req.max_file_bytes) if req.max_file_bytes is not None else int(ui_cfg.get("max_file_bytes") or 500_000)

    started = _start_build(repo_root, roots, include_globs, exclude_globs, max_file_bytes)
    if not started:
        return {"started": False, "building": True}
    return {"started": True}


@app.get("/api/code-index/profile")
def profile(repo_root: Optional[str] = None):
    """Profile a repo to recommend include/exclude patterns and retrieval roles."""
    root = repo_root or _config.get("repo_root")
    if not root:
        raise HTTPException(status_code=400, detail="repo_root is required")

    return profile_repo(Path(root))


@app.post("/api/code-index/policy")
def policy(req: PolicyRequest):
    """Get (and optionally regenerate) the persisted repo policy for this index."""
    root = req.repo_root or _config.get("repo_root")
    if not root:
        raise HTTPException(status_code=400, detail="repo_root is required")

    idx = _get_index()
    pol = ensure_repo_policy(idx.index_dir, Path(root), force=req.force)
    return {"policy": pol}


def _ensure_watcher(repo_root: str, debounce_ms: Optional[int], min_gap_ms: Optional[int]) -> AutoRebuildWatcher:
    global _watcher

    idx = _get_index()
    root_path = Path(repo_root)

    def _trigger(_paths: List[str]) -> bool:
        ui_cfg = _load_ui_config()
        combined = list(ui_cfg.get("core_roots") or []) + list(ui_cfg.get("working_roots") or [])
        roots = combined or None

        include_globs = ui_cfg.get("include_globs") or None
        exclude_globs = ui_cfg.get("exclude_globs") or None
        max_file_bytes = int(ui_cfg.get("max_file_bytes") or 500_000)

        return _start_build(repo_root, roots, include_globs, exclude_globs, max_file_bytes)

    if _watcher is None:
        _watcher = AutoRebuildWatcher(
            repo_root=root_path,
            index_dir=idx.index_dir,
            on_trigger_build=_trigger,
            is_building=_is_building,
            debounce_ms=int(debounce_ms) if debounce_ms is not None else 5000,
            min_rebuild_gap_ms=int(min_gap_ms) if min_gap_ms is not None else 2000,
        )
        return _watcher

    return _watcher


@app.get("/api/code-index/watch/status")
def watch_status(repo_root: Optional[str] = None):
    root = repo_root or _config.get("repo_root")
    if not root:
        raise HTTPException(status_code=400, detail="repo_root is required")

    if _watcher is None:
        return {"watch": {"enabled": False, "state": "disabled"}}
    return {"watch": _watcher.status()}


@app.post("/api/code-index/watch/start")
def watch_start(req: WatchRequest):
    root = req.repo_root or _config.get("repo_root")
    if not root:
        raise HTTPException(status_code=400, detail="repo_root is required")

    w = _ensure_watcher(root, req.debounce_ms, req.min_rebuild_gap_ms)
    w.start()
    return {"watch": w.status()}


@app.post("/api/code-index/watch/stop")
def watch_stop():
    global _watcher

    if _watcher is None:
        return {"watch": {"enabled": False, "state": "disabled"}}
    _watcher.stop()
    return {"watch": _watcher.status()}


@app.post("/api/code-index/search")
def search(req: SearchRequest):
    """Search the index."""
    if not req.query.strip():
        raise HTTPException(status_code=400, detail="query is required")

    idx = _get_index()
    policy = idx.query_policy(req.query)
    results = idx.search(req.query, k=req.k, min_score=req.min_score)

    return {
        "results": [
            {"doc": r.doc, "score": r.score}
            for r in results
        ],
        "meta": {"query": req.query, "policy": policy},
    }


@app.post("/api/code-index/context")
def context(req: ContextRequest):
    """Get assembled context for LLM injection."""
    if not req.query.strip():
        raise HTTPException(status_code=400, detail="query is required")

    idx = _get_index()
    if req.structured:
        return idx.get_context_structured(
            req.query,
            k=req.k,
            max_chars=req.max_chars,
            min_score=req.min_score,
        )

    policy = idx.query_policy(req.query)
    ctx = idx.get_context(
        req.query,
        k=req.k,
        max_chars=req.max_chars,
        include_sources=req.include_sources,
        include_scores=req.include_scores,
        min_score=req.min_score,
    )
    return {"context": ctx, "meta": {"query": req.query, "policy": policy}}


@app.post("/api/code-index/chunk")
def chunk(req: ChunkRequest):
    """Get a specific chunk by ID."""
    idx = _get_index()
    doc = idx.get_chunk(req.chunk_id)
    if doc is None:
        raise HTTPException(status_code=404, detail="Chunk not found")
    return {"chunk": doc}


# =============================================================================
# Server Configuration & Main
# =============================================================================

def configure(
    repo_root: Optional[str] = None,
    index_dir: str = "./codrag_data",
    ollama_url: str = "http://localhost:11434",
    model: str = "nomic-embed-text",
):
    """Configure the server before starting."""
    global _config, _index, _watcher
    if _watcher is not None:
        try:
            _watcher.stop()
        except Exception:
            pass
        _watcher = None
    _config = {
        "repo_root": repo_root,
        "index_dir": index_dir,
        "ollama_url": ollama_url,
        "model": model,
    }
    _index = None


def mount_dashboard():
    """Mount the static dashboard if available."""
    dashboard_dir = Path(__file__).parent / "dashboard" / "dist"
    if dashboard_dir.exists():
        app.mount("/ui", StaticFiles(directory=str(dashboard_dir), html=True), name="dashboard")
        logger.info(f"Dashboard mounted at /ui from {dashboard_dir}")
    else:
        logger.warning(f"Dashboard not found at {dashboard_dir} - run 'npm run build' in dashboard/")


def main():
    parser = argparse.ArgumentParser(description="CoDRAG Server")
    parser.add_argument("--repo-root", help="Default repository root to index")
    parser.add_argument("--index-dir", default="./codrag_data", help="Directory to store index")
    parser.add_argument("--ollama-url", default="http://localhost:11434", help="Ollama API URL")
    parser.add_argument("--model", default="nomic-embed-text", help="Embedding model name")
    parser.add_argument("--host", default="127.0.0.1", help="Host to bind to")
    parser.add_argument("--port", type=int, default=8400, help="Port to bind to")
    args = parser.parse_args()

    configure(
        repo_root=args.repo_root,
        index_dir=args.index_dir,
        ollama_url=args.ollama_url,
        model=args.model,
    )

    mount_dashboard()

    import uvicorn
    logger.info(f"Starting CoDRAG server on {args.host}:{args.port}")
    uvicorn.run(app, host=args.host, port=args.port)


if __name__ == "__main__":
    main()
