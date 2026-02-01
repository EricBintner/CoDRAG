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


class HealthResponse(BaseModel):
    """Health check response."""
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


@app.get("/health", response_model=HealthResponse)
async def health() -> HealthResponse:
    """Health check endpoint."""
    return HealthResponse(status="ok", version=__version__)


@app.get("/")
async def root() -> dict:
    """Root endpoint with API info."""
    return {
        "name": "CoDRAG",
        "version": __version__,
        "description": "Code Documentation and RAG",
        "docs": "/docs",
        "health": "/health",
    }


# =============================================================================
# Projects API
# =============================================================================

@app.get("/projects")
async def list_projects() -> dict:
    """List all registered projects."""
    # TODO: Implement with registry
    return {
        "success": True,
        "data": {
            "projects": [],
            "total": 0,
        }
    }


@app.post("/projects")
async def add_project(request: dict) -> dict:
    """Add a new project."""
    # TODO: Implement with registry
    return {
        "success": True,
        "data": {
            "id": "placeholder",
            "name": request.get("name"),
            "path": request.get("path"),
        }
    }


@app.get("/projects/{project_id}")
async def get_project(project_id: str) -> dict:
    """Get project details."""
    # TODO: Implement with registry
    return {
        "success": False,
        "error": {"code": "NOT_IMPLEMENTED", "message": "Not implemented yet"}
    }


@app.delete("/projects/{project_id}")
async def remove_project(project_id: str, purge: bool = False) -> dict:
    """Remove a project."""
    # TODO: Implement with registry
    return {
        "success": False,
        "error": {"code": "NOT_IMPLEMENTED", "message": "Not implemented yet"}
    }


# =============================================================================
# Index API
# =============================================================================

@app.get("/projects/{project_id}/status")
async def get_project_status(project_id: str) -> dict:
    """Get project index status."""
    # TODO: Implement with index manager
    return {
        "success": False,
        "error": {"code": "NOT_IMPLEMENTED", "message": "Not implemented yet"}
    }


@app.post("/projects/{project_id}/build")
async def build_project(project_id: str, full: bool = False) -> dict:
    """Trigger project index build."""
    # TODO: Implement with index manager
    return {
        "success": False,
        "error": {"code": "NOT_IMPLEMENTED", "message": "Not implemented yet"}
    }


@app.post("/projects/{project_id}/search")
async def search_project(project_id: str, request: dict) -> dict:
    """Semantic search in project."""
    query = request.get("query", "")
    k = request.get("k", 10)
    
    # TODO: Implement with index manager
    return {
        "success": False,
        "error": {"code": "NOT_IMPLEMENTED", "message": "Not implemented yet"}
    }


@app.post("/projects/{project_id}/context")
async def get_context(project_id: str, request: dict) -> dict:
    """Assemble context for LLM prompt."""
    query = request.get("query", "")
    max_chars = request.get("max_chars", 8000)
    
    # TODO: Implement with index manager
    return {
        "success": False,
        "error": {"code": "NOT_IMPLEMENTED", "message": "Not implemented yet"}
    }


# =============================================================================
# Trace API
# =============================================================================

@app.get("/projects/{project_id}/trace/status")
async def get_trace_status(project_id: str) -> dict:
    """Get trace index status."""
    # TODO: Implement with trace manager
    return {
        "success": False,
        "error": {"code": "NOT_IMPLEMENTED", "message": "Not implemented yet"}
    }


@app.post("/projects/{project_id}/trace/search")
async def search_trace(project_id: str, request: dict) -> dict:
    """Search trace nodes by name."""
    # TODO: Implement with trace manager
    return {
        "success": False,
        "error": {"code": "NOT_IMPLEMENTED", "message": "Not implemented yet"}
    }


@app.get("/projects/{project_id}/trace/node/{node_id}")
async def get_trace_node(project_id: str, node_id: str) -> dict:
    """Get trace node details."""
    # TODO: Implement with trace manager
    return {
        "success": False,
        "error": {"code": "NOT_IMPLEMENTED", "message": "Not implemented yet"}
    }


@app.get("/projects/{project_id}/trace/neighbors/{node_id}")
async def get_trace_neighbors(project_id: str, node_id: str) -> dict:
    """Get trace node neighbors (graph traversal)."""
    # TODO: Implement with trace manager
    return {
        "success": False,
        "error": {"code": "NOT_IMPLEMENTED", "message": "Not implemented yet"}
    }


# =============================================================================
# LLM API
# =============================================================================

@app.get("/llm/status")
async def get_llm_status() -> dict:
    """Get LLM service connection status."""
    # TODO: Implement with LLM coordinator
    return {
        "success": True,
        "data": {
            "ollama": {
                "url": "http://localhost:11434",
                "connected": False,
                "models": [],
            },
            "clara": {
                "url": "http://localhost:8765",
                "enabled": False,
                "connected": False,
            }
        }
    }


@app.post("/llm/test")
async def test_llm_connections() -> dict:
    """Test LLM service connections."""
    # TODO: Implement with LLM coordinator
    return {
        "success": False,
        "error": {"code": "NOT_IMPLEMENTED", "message": "Not implemented yet"}
    }
