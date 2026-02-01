"""
CoDRAG FastAPI server.

Main HTTP API for the CoDRAG daemon.

Usage:
    python -m codrag.server --repo-root /path/to/repo --index-dir ./codrag_data --port 8400
"""

from __future__ import annotations

import argparse
import logging
import threading
from pathlib import Path
from typing import Any, Dict, List, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from codrag import __version__
from codrag.core import CodeIndex, OllamaEmbedder

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="CoDRAG",
    description="Code Documentation and RAG - Multi-project semantic search platform",
    version=__version__,
)

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
_config: Dict[str, Any] = {}
_build_lock = threading.Lock()
_build_thread: Optional[threading.Thread] = None
_last_build_result: Optional[Dict[str, Any]] = None
_last_build_error: Optional[str] = None


# =============================================================================
# Pydantic Models
# =============================================================================

class HealthResponse(BaseModel):
    status: str
    version: str


class BuildRequest(BaseModel):
    repo_root: Optional[str] = None
    include_globs: Optional[List[str]] = None
    exclude_globs: Optional[List[str]] = None
    max_file_bytes: Optional[int] = None


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


def _build_worker(repo_root: str, include_globs: Optional[List[str]], exclude_globs: Optional[List[str]], max_file_bytes: int):
    global _last_build_result, _last_build_error, _build_thread

    try:
        idx = _get_index()
        meta = idx.build(
            repo_root=Path(repo_root),
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
    global _build_thread

    repo_root = req.repo_root or _config.get("repo_root")
    if not repo_root:
        raise HTTPException(status_code=400, detail="repo_root is required")

    include_globs = req.include_globs
    exclude_globs = req.exclude_globs
    max_file_bytes = req.max_file_bytes or 500_000

    with _build_lock:
        if _is_building():
            return {"started": False, "building": True}

        _build_thread = threading.Thread(
            target=_build_worker,
            args=(repo_root, include_globs, exclude_globs, max_file_bytes),
            daemon=True,
        )
        _build_thread.start()

    return {"started": True}


@app.post("/api/code-index/search")
def search(req: SearchRequest):
    """Search the index."""
    if not req.query.strip():
        raise HTTPException(status_code=400, detail="query is required")

    idx = _get_index()
    results = idx.search(req.query, k=req.k, min_score=req.min_score)

    return {
        "results": [
            {"doc": r.doc, "score": r.score}
            for r in results
        ]
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

    ctx = idx.get_context(
        req.query,
        k=req.k,
        max_chars=req.max_chars,
        include_sources=req.include_sources,
        include_scores=req.include_scores,
        min_score=req.min_score,
    )
    return {"context": ctx}


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
    global _config, _index
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
