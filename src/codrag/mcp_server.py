"""
CoDRAG MCP Server - Model Context Protocol integration.

Provides MCP tools for IDE integration (Cursor, VS Code, Windsurf, JetBrains, etc.)

Transport: stdio (primary), Streamable HTTP (planned)
Spec version: 2025-11-25

Tools:
- codrag_status: Get index status and daemon health
- codrag_build: Trigger index build (async)
- codrag_search: Search the index
- codrag_context: Get assembled context for LLM injection
"""

from __future__ import annotations

import asyncio
import json
import logging
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional

import httpx

# Configure logging to stderr (stdout reserved for MCP JSON-RPC)
logging.basicConfig(
    level=logging.WARNING,
    format="%(levelname)s: %(message)s",
    stream=sys.stderr,
)
logger = logging.getLogger(__name__)


# =============================================================================
# MCP Protocol Constants (spec 2025-11-25)
# =============================================================================

MCP_PROTOCOL_VERSION = "2025-11-25"
JSONRPC_VERSION = "2.0"

# Error codes
PARSE_ERROR = -32700
INVALID_REQUEST = -32600
METHOD_NOT_FOUND = -32601
INVALID_PARAMS = -32602
INTERNAL_ERROR = -32603

# CoDRAG-specific error codes
DAEMON_UNAVAILABLE = -32000
INDEX_NOT_READY = -32001
BUILD_IN_PROGRESS = -32002
PROJECT_NOT_FOUND = -32003


# =============================================================================
# Tool Definitions
# =============================================================================

TOOLS = [
    {
        "name": "codrag_status",
        "description": "Get CoDRAG index status and daemon health. Returns index stats, build state, and configuration.",
        "inputSchema": {
            "type": "object",
            "properties": {},
            "required": [],
        },
    },
    {
        "name": "codrag_build",
        "description": "Trigger an index build. Returns immediately; build runs async in background. Use codrag_status to check progress.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "full": {
                    "type": "boolean",
                    "description": "Force full rebuild (ignore cache). Default: false (incremental).",
                    "default": False,
                },
            },
            "required": [],
        },
    },
    {
        "name": "codrag_search",
        "description": "Search the CoDRAG index with a semantic query. Returns ranked code/doc chunks.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": "Natural language search query.",
                },
                "k": {
                    "type": "integer",
                    "description": "Number of results to return. Default: 8.",
                    "default": 8,
                },
                "min_score": {
                    "type": "number",
                    "description": "Minimum similarity score (0-1). Default: 0.15.",
                    "default": 0.15,
                },
            },
            "required": ["query"],
        },
    },
    {
        "name": "codrag_context",
        "description": "Get assembled context for LLM prompt injection. Returns formatted chunks optimized for token efficiency.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": "Natural language query describing what context you need.",
                },
                "k": {
                    "type": "integer",
                    "description": "Number of chunks to include. Default: 5.",
                    "default": 5,
                },
                "max_chars": {
                    "type": "integer",
                    "description": "Maximum characters in assembled context. Default: 6000.",
                    "default": 6000,
                },
            },
            "required": ["query"],
        },
    },
]


# =============================================================================
# MCP Server Implementation
# =============================================================================

class MCPServer:
    """
    CoDRAG MCP Server.
    
    Communicates with the CoDRAG daemon via HTTP API.
    """

    def __init__(
        self,
        daemon_url: str = "http://127.0.0.1:8400",
        project_id: Optional[str] = None,
        auto_detect: bool = False,
    ):
        self.daemon_url = daemon_url.rstrip("/")
        self.project_id = project_id
        self.auto_detect = auto_detect
        self._client: Optional[httpx.AsyncClient] = None

    async def _get_client(self) -> httpx.AsyncClient:
        if self._client is None:
            self._client = httpx.AsyncClient(timeout=30.0)
        return self._client

    async def close(self) -> None:
        if self._client is not None:
            await self._client.aclose()
            self._client = None

    async def _api_get(self, path: str) -> Dict[str, Any]:
        """GET request to daemon API."""
        client = await self._get_client()
        url = f"{self.daemon_url}/api/code-index{path}"
        try:
            resp = await client.get(url)
            resp.raise_for_status()
            return resp.json()
        except httpx.ConnectError:
            raise DaemonUnavailableError(f"Cannot connect to CoDRAG daemon at {self.daemon_url}")
        except httpx.HTTPStatusError as e:
            raise DaemonError(f"Daemon returned {e.response.status_code}: {e.response.text}")

    async def _api_post(self, path: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        """POST request to daemon API."""
        client = await self._get_client()
        url = f"{self.daemon_url}/api/code-index{path}"
        try:
            resp = await client.post(url, json=payload)
            resp.raise_for_status()
            return resp.json()
        except httpx.ConnectError:
            raise DaemonUnavailableError(f"Cannot connect to CoDRAG daemon at {self.daemon_url}")
        except httpx.HTTPStatusError as e:
            raise DaemonError(f"Daemon returned {e.response.status_code}: {e.response.text}")

    # -------------------------------------------------------------------------
    # Tool Implementations
    # -------------------------------------------------------------------------

    async def tool_status(self) -> Dict[str, Any]:
        """Get index status."""
        data = await self._api_get("/status")
        
        # Lean output for token efficiency
        index = data.get("index", {})
        return {
            "daemon": "running",
            "index_loaded": index.get("loaded", False),
            "total_documents": index.get("total_documents", 0),
            "model": index.get("model", "unknown"),
            "built_at": index.get("built_at"),
            "building": data.get("building", False),
            "watch_enabled": (data.get("watch") or {}).get("enabled", False),
        }

    async def tool_build(self, full: bool = False) -> Dict[str, Any]:
        """Trigger index build."""
        # Note: full rebuild would clear cache - not yet implemented in daemon
        data = await self._api_post("/build", {})
        
        if data.get("started"):
            return {"status": "started", "message": "Index build started. Use codrag_status to check progress."}
        elif data.get("building"):
            return {"status": "already_building", "message": "A build is already in progress."}
        else:
            return {"status": "unknown", "data": data}

    async def tool_search(
        self,
        query: str,
        k: int = 8,
        min_score: float = 0.15,
    ) -> Dict[str, Any]:
        """Search the index."""
        if not query.strip():
            raise InvalidParamsError("query is required")

        data = await self._api_post("/search", {
            "query": query,
            "k": k,
            "min_score": min_score,
        })

        # Format results for token efficiency
        results = data.get("results", [])
        formatted = []
        for r in results:
            doc = r.get("doc", {})
            formatted.append({
                "path": doc.get("source_path", ""),
                "section": doc.get("section", ""),
                "score": round(r.get("score", 0), 3),
                "content": doc.get("content", "")[:500],  # Truncate for listing
            })

        return {
            "query": query,
            "count": len(formatted),
            "results": formatted,
        }

    async def tool_context(
        self,
        query: str,
        k: int = 5,
        max_chars: int = 6000,
    ) -> Dict[str, Any]:
        """Get assembled context."""
        if not query.strip():
            raise InvalidParamsError("query is required")

        data = await self._api_post("/context", {
            "query": query,
            "k": k,
            "max_chars": max_chars,
            "include_sources": True,
            "include_scores": False,
            "structured": True,
        })

        return {
            "context": data.get("context", ""),
            "chunks_used": len(data.get("chunks", [])),
            "total_chars": data.get("total_chars", 0),
            "estimated_tokens": data.get("estimated_tokens", 0),
        }

    # -------------------------------------------------------------------------
    # MCP Protocol Handlers
    # -------------------------------------------------------------------------

    async def handle_initialize(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Handle initialize request."""
        return {
            "protocolVersion": MCP_PROTOCOL_VERSION,
            "capabilities": {
                "tools": {"listChanged": False},
            },
            "serverInfo": {
                "name": "codrag",
                "version": "0.1.0",
            },
        }

    async def handle_tools_list(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Handle tools/list request."""
        return {"tools": TOOLS}

    async def handle_tools_call(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Handle tools/call request."""
        name = params.get("name", "")
        args = params.get("arguments", {})

        try:
            if name == "codrag_status":
                result = await self.tool_status()
            elif name == "codrag_build":
                result = await self.tool_build(full=args.get("full", False))
            elif name == "codrag_search":
                result = await self.tool_search(
                    query=args.get("query", ""),
                    k=args.get("k", 8),
                    min_score=args.get("min_score", 0.15),
                )
            elif name == "codrag_context":
                result = await self.tool_context(
                    query=args.get("query", ""),
                    k=args.get("k", 5),
                    max_chars=args.get("max_chars", 6000),
                )
            else:
                raise MethodNotFoundError(f"Unknown tool: {name}")

            return {
                "content": [
                    {"type": "text", "text": json.dumps(result, indent=2)}
                ],
                "isError": False,
            }

        except (DaemonUnavailableError, DaemonError, InvalidParamsError) as e:
            return {
                "content": [
                    {"type": "text", "text": str(e)}
                ],
                "isError": True,
            }

    async def handle_request(self, request: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Handle a JSON-RPC request."""
        method = request.get("method", "")
        params = request.get("params", {})
        req_id = request.get("id")

        # Notifications (no id) don't get responses
        if req_id is None:
            if method == "notifications/initialized":
                pass  # Client confirmed initialization
            return None

        try:
            if method == "initialize":
                result = await self.handle_initialize(params)
            elif method == "tools/list":
                result = await self.handle_tools_list(params)
            elif method == "tools/call":
                result = await self.handle_tools_call(params)
            elif method == "ping":
                result = {}
            else:
                raise MethodNotFoundError(f"Unknown method: {method}")

            return {
                "jsonrpc": JSONRPC_VERSION,
                "id": req_id,
                "result": result,
            }

        except MCPError as e:
            return {
                "jsonrpc": JSONRPC_VERSION,
                "id": req_id,
                "error": {"code": e.code, "message": str(e)},
            }
        except Exception as e:
            logger.exception("Internal error handling request")
            return {
                "jsonrpc": JSONRPC_VERSION,
                "id": req_id,
                "error": {"code": INTERNAL_ERROR, "message": str(e)},
            }


# =============================================================================
# Errors
# =============================================================================

class MCPError(Exception):
    """Base MCP error."""
    code = INTERNAL_ERROR


class MethodNotFoundError(MCPError):
    code = METHOD_NOT_FOUND


class InvalidParamsError(MCPError):
    code = INVALID_PARAMS


class DaemonUnavailableError(MCPError):
    code = DAEMON_UNAVAILABLE


class DaemonError(MCPError):
    code = INTERNAL_ERROR


# =============================================================================
# stdio Transport
# =============================================================================

async def run_stdio(server: MCPServer) -> None:
    """
    Run the MCP server over stdio transport.
    
    Reads JSON-RPC messages from stdin, writes responses to stdout.
    Messages are newline-delimited.
    """
    reader = asyncio.StreamReader()
    protocol = asyncio.StreamReaderProtocol(reader)
    await asyncio.get_event_loop().connect_read_pipe(lambda: protocol, sys.stdin)

    writer_transport, writer_protocol = await asyncio.get_event_loop().connect_write_pipe(
        asyncio.streams.FlowControlMixin, sys.stdout
    )
    writer = asyncio.StreamWriter(writer_transport, writer_protocol, None, asyncio.get_event_loop())

    try:
        while True:
            line = await reader.readline()
            if not line:
                break

            line = line.decode("utf-8").strip()
            if not line:
                continue

            try:
                request = json.loads(line)
            except json.JSONDecodeError as e:
                error_response = {
                    "jsonrpc": JSONRPC_VERSION,
                    "id": None,
                    "error": {"code": PARSE_ERROR, "message": f"Parse error: {e}"},
                }
                writer.write((json.dumps(error_response) + "\n").encode("utf-8"))
                await writer.drain()
                continue

            response = await server.handle_request(request)
            if response is not None:
                writer.write((json.dumps(response) + "\n").encode("utf-8"))
                await writer.drain()

    except Exception as e:
        logger.exception("Error in stdio loop")
    finally:
        await server.close()


# =============================================================================
# Entry Point
# =============================================================================

def main(
    daemon_url: str = "http://127.0.0.1:8400",
    project_id: Optional[str] = None,
    auto_detect: bool = False,
) -> None:
    """Run the MCP server."""
    server = MCPServer(
        daemon_url=daemon_url,
        project_id=project_id,
        auto_detect=auto_detect,
    )
    asyncio.run(run_stdio(server))


if __name__ == "__main__":
    main()
