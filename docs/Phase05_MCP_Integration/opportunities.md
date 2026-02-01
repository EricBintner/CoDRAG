# Opportunities — Phase 05 (MCP Integration)

## Purpose
Capture MCP-facing robustness and token-efficiency opportunities.

## Opportunities
- **Never corrupt JSON-RPC**: ensure MCP server never writes to stdout/stderr; route logs to a file when debugging is enabled.
- **Lean outputs by default**: consider emitting markdown for search results (paths + spans + snippets) to reduce token waste; keep `structured=true` for programmatic consumers.
- **Capability-aware schemas**: hide tool options when unavailable (e.g., semantic search if embeddings aren’t configured).
- **Output budgets**: enforce hard caps and dynamically return fewer results when near token limits.
- **Debug mode plumbing**: opt-in debug log file to diagnose indexing/rebuild without breaking MCP.

## References
- ChunkHound stdio MCP server disables logging to protect JSON-RPC:
  - https://raw.githubusercontent.com/chunkhound/chunkhound/main/chunkhound/mcp_server/stdio.py
- ChunkHound issue #173 (JSON → lean markdown for MCP search)
