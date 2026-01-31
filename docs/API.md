# CoDRAG API Specification

This document is the **authoritative** HTTP API contract for the CoDRAG daemon.

## Conventions

- **Base URL (default):** `http://127.0.0.1:8400`
- **Content-Type:** `application/json`
- **Local-first:** in default local mode the daemon binds to loopback and requires no auth.
- **Project-scoped API:** most endpoints are under `/projects/{project_id}/...`.

## Authentication (Phase 06)

Local-only mode (default):
- Authentication is optional.

Network/team mode:
- Authentication is required for all endpoints except `GET /health`.
- Recommended header:
  - `Authorization: Bearer <api_key>`

## Response envelope

All JSON endpoints return a stable envelope.

### Success

```json
{
  "success": true,
  "data": {"...": "..."},
  "error": null
}
```

### Error

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "PROJECT_NOT_FOUND",
    "message": "Project with ID 'xyz' not found",
    "hint": "Add the project first or select an existing project.",
    "details": {}
  }
}
```

Notes:
- `hint` and `details` are optional but recommended.
- In remote mode, error details must not leak sensitive filesystem paths.

## HTTP status codes

- `200` for successful reads/actions.
- `400` for validation errors.
- `401` for auth failures (network mode).
- `404` for missing resources.
- `409` for conflicts (already exists, build already running).
- `500` for internal errors.

The envelope is returned even when non-200 status codes are used.

## Error codes

Minimum stable set:

- `VALIDATION_ERROR`
- `PROJECT_NOT_FOUND`
- `PROJECT_ALREADY_EXISTS`
- `INDEX_NOT_BUILT`
- `BUILD_ALREADY_RUNNING`
- `BUILD_FAILED`
- `OLLAMA_UNAVAILABLE`
- `OLLAMA_MODEL_NOT_FOUND`
- `PERMISSION_DENIED`
- `IO_ERROR`
- `NOT_IMPLEMENTED`
- `INTERNAL_ERROR`

Phase 05 (MCP) adds:
- `DAEMON_UNAVAILABLE`
- `PROJECT_SELECTION_AMBIGUOUS`

## Pagination

List endpoints that can grow should support offset/limit.

Recommended envelope payload shape:

```json
{
  "success": true,
  "data": {
    "items": [],
    "total": 0,
    "offset": 0,
    "limit": 50
  },
  "error": null
}
```

## Endpoints

### Health

#### `GET /health`

Purpose:
- Liveness/readiness probe.

Response (no envelope; stable for external probes):

```json
{
  "status": "ok",
  "version": "0.1.0"
}
```

### Root

#### `GET /`

Purpose:
- Human-friendly API info.

Response:

```json
{
  "name": "CoDRAG",
  "version": "0.1.0",
  "description": "Code Documentation and RAG",
  "docs": "/docs",
  "health": "/health"
}
```

### Projects

#### `GET /projects`

Purpose:
- List registered projects.

Response `data`:

```json
{
  "projects": [
    {
      "id": "proj_123",
      "name": "LinuxBrain",
      "path": "/abs/path/to/repo",
      "mode": "standalone",
      "created_at": "2026-01-01T00:00:00Z",
      "updated_at": "2026-01-01T00:00:00Z"
    }
  ],
  "total": 1
}
```

#### `POST /projects`

Purpose:
- Register a new project.

Request:

```json
{
  "path": "/abs/path/to/repo",
  "name": "optional name",
  "mode": "standalone"
}
```

Notes:
- `mode` is `standalone` by default.
- `embedded` becomes first-class in Phase 06.

Response `data`:

```json
{
  "project": {
    "id": "proj_123",
    "name": "LinuxBrain",
    "path": "/abs/path/to/repo",
    "mode": "standalone",
    "config": {}
  }
}
```

#### `GET /projects/{project_id}`

Purpose:
- Fetch project details.

Response `data`:

```json
{
  "project": {
    "id": "proj_123",
    "name": "LinuxBrain",
    "path": "/abs/path/to/repo",
    "mode": "standalone",
    "config": {}
  }
}
```

#### `PUT /projects/{project_id}`

Purpose:
- Update project metadata/config.

Request:

```json
{
  "name": "optional new name",
  "config": {
    "include_globs": ["**/*.py", "**/*.md"],
    "exclude_globs": ["**/node_modules/**"],
    "max_file_bytes": 200000,
    "trace": {"enabled": false},
    "auto_rebuild": {"enabled": false}
  }
}
```

Response `data`:

```json
{
  "project": {"id": "proj_123", "name": "...", "path": "...", "mode": "standalone", "config": {}}
}
```

#### `DELETE /projects/{project_id}?purge=false`

Purpose:
- Remove a project from the registry.

Query params:
- `purge`:
  - `false` (default): unregister only
  - `true`: also delete project index files

Response `data`:

```json
{
  "removed": true,
  "purged": false
}
```

### Project status and build

#### `GET /projects/{project_id}/status`

Purpose:
- Provide a stable “truth” view for UI/CLI/MCP.

Response `data`:

```json
{
  "building": false,
  "stale": false,
  "index": {
    "exists": true,
    "total_chunks": 1234,
    "embedding_dim": 768,
    "embedding_model": "nomic-embed-text",
    "last_build_at": "2026-01-01T00:00:00Z",
    "last_error": null
  },
  "trace": {
    "enabled": false,
    "exists": false,
    "last_build_at": null,
    "last_error": null
  },
  "watch": {
    "enabled": false,
    "state": "disabled"
  }
}
```

#### `POST /projects/{project_id}/build?full=false`

Purpose:
- Trigger a build.

Query params:
- `full`:
  - `false` (default): incremental build
  - `true`: full rebuild

Response `data`:

```json
{
  "started": true,
  "building": true,
  "build_id": "build_abc"
}
```

Progress reporting (recommended):
- Expose the current phase and coarse counters in `GET /projects/{project_id}/status`.

### Search

#### `POST /projects/{project_id}/search`

Request:

```json
{
  "query": "how does auth work?",
  "k": 10,
  "min_score": 0.15
}
```

Response `data`:

```json
{
  "results": [
    {
      "chunk_id": "chunk_...",
      "source_path": "src/codrag/server.py",
      "span": {"start_line": 142, "end_line": 175},
      "preview": "Trigger project index build...",
      "score": 0.83
    }
  ]
}
```

### Context assembly

#### `POST /projects/{project_id}/context`

Request:

```json
{
  "query": "how does auth work?",
  "k": 5,
  "max_chars": 8000,
  "min_score": 0.15,
  "include_sources": true,
  "include_scores": false,
  "structured": false,
  "trace_expand": {
    "enabled": false,
    "hops": 1,
    "direction": "both",
    "edge_kinds": ["imports"],
    "max_nodes": 20,
    "max_additional_chunks": 10,
    "max_additional_chars": 2000
  }
}
```

Response `data` when `structured=false`:

```json
{
  "context": "..."
}
```

Response `data` when `structured=true`:

```json
{
  "context": "...",
  "chunks": [
    {
      "chunk_id": "chunk_...",
      "source_path": "...",
      "span": {"start_line": 1, "end_line": 10},
      "score": 0.83,
      "text": "..."
    }
  ],
  "total_chars": 7123,
  "estimated_tokens": 1800
}
```

### Trace (Phase 04)

#### `GET /projects/{project_id}/trace/status`

Response `data`:

```json
{
  "enabled": false,
  "exists": false,
  "building": false,
  "counts": {"nodes": 0, "edges": 0},
  "last_build_at": null,
  "last_error": null
}
```

#### `POST /projects/{project_id}/trace/search`

Request:

```json
{
  "query": "build_project",
  "kinds": ["symbol"],
  "limit": 20
}
```

Response `data`:

```json
{
  "nodes": [
    {
      "id": "node-...",
      "kind": "symbol",
      "name": "build_project",
      "file_path": "src/codrag/server.py",
      "span": {"start_line": 142, "end_line": 175},
      "language": "python",
      "preview": "Trigger project index build..."
    }
  ]
}
```

#### `GET /projects/{project_id}/trace/node/{node_id}`

Response `data`:

```json
{
  "node": {"id": "node-...", "kind": "symbol", "name": "..."},
  "in_degree": 0,
  "out_degree": 2
}
```

#### `GET /projects/{project_id}/trace/neighbors/{node_id}`

Query params:
- `direction`: `in|out|both` (default `both`)
- `edge_kinds`: repeatable (default `imports`)
- `hops`: default 1
- `max_nodes`: default 25
- `max_edges`: default 50

Response `data`:

```json
{
  "nodes": [{"id": "node-...", "kind": "file", "name": "..."}],
  "edges": [{"id": "edge-...", "kind": "imports", "source": "node-...", "target": "node-..."}]
}
```

### LLM status

#### `GET /llm/status`

Response `data`:

```json
{
  "ollama": {"url": "http://localhost:11434", "connected": true, "models": ["nomic-embed-text"]},
  "clara": {"url": "http://localhost:8765", "enabled": false, "connected": false}
}
```

#### `POST /llm/test`

Purpose:
- Force a connectivity check.

Response `data`:

```json
{
  "ollama": {"connected": true},
  "clara": {"connected": false}
}
```
