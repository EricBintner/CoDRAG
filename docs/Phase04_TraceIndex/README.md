# Phase 04 — Trace Index
 
 ## Problem statement
 Embedding-only retrieval is content-first and struggles with structural questions like “what calls what?”, “where is the entry point?”, or “what symbols implement this behavior?”. A trace index (codebase graph) provides structural grounding and enables GraphRAG-style traversal.

 ## Goal
 Add a structural index (codebase graph) to complement embedding search.

 ## Scope
 ### In scope
 - Minimal trace storage per project (`trace_nodes.jsonl`, `trace_edges.jsonl`, `trace_manifest.json`)
 - Python symbol extraction MVP (functions/classes + import edges)
 - Query-time trace expansion option for `/context` assembly (bounded traversal)
 - **Feature Gating:**
   - **Free Tier:** Trace build and expansion are **disabled** (Standard RAG only).
   - **Starter/Pro/Team:** Trace features are **enabled**.

 ### Out of scope
 - Full cross-language call graph correctness
 - Graph database dependency
 - Full interactive graph visualization (basic node browsing can come later)
 
 ## Derived from (Phase69 sources)
 - `../Phase00_Initial-Concept/TRACE_INDEX_RESEARCH.md`
 - `../Phase00_Initial-Concept/COMPETITORS_AND_CUTTING_EDGE.md` (GraphRAG implications)
 
 ## Related (optional)
 - `./CURATED_TRACEABILITY_FRAMEWORK.md` (curated traceability layer: plans/decisions/research ↔ code)
 - `./TRACEABILITY_AUTOMATION_STRATEGY.md` (automation options: deterministic + IR + hybrid local/remote LLM)
 - `./REPO_DISCOVERY_AND_POLICY.md` (repo discovery: pick roots + include/exclude + retrieval weighting without assuming folder structure)
 - `./DETERMINISTIC_TRACE_BUILD_PLAN.md` (detailed, edge-case driven plan for deterministic trace builds)
 
 ## Deliverables
 - Trace data model (nodes/edges/manifest) persisted per project
 - Python symbol extraction MVP
 - Trace-aware expansion option for context assembly

 ## Functional specification

 ### Storage layout

 Trace index files live alongside the embedding index under the project’s `index_dir`:

 - `trace_manifest.json`
 - `trace_nodes.jsonl`
 - `trace_edges.jsonl`

 Progressive enhancement:
 - Additional acceleration files (e.g., name lookup tables) are allowed later, but the authoritative format must remain transparent and rebuildable from the repo.

 ### Data model

 The trace index is a lightweight graph:

 - **Nodes** represent concrete entities (files, symbols, etc.).
 - **Edges** represent relationships (contains/defines, imports, calls later).

 #### `trace_manifest.json`

 Minimum fields:
 - `format_version`
 - `built_at`
 - `project_id`
 - `project_root`
 - `config_snapshot` (include/exclude globs; enabled languages)
 - `counts`: `{nodes, edges, files_parsed, files_failed}`
 - `last_error` (nullable)

 #### Nodes (`trace_nodes.jsonl`)

 Required fields:
 - `id` (stable within a build, stable across builds when possible)
 - `kind`
 - `name`
 - `file_path` (project-relative)
 - `span` (line range when applicable)
 - `language` (nullable)
 - `metadata` (object)

 Node kinds (MVP):
 - `file`
 - `symbol`
 - `external_module` (optional; only if we keep unresolved imports)

 Example:

 ```json
 {
   "id": "node-abc123",
   "kind": "symbol",
   "name": "generate_image",
   "file_path": "src/codrag/server.py",
   "span": {"start_line": 142, "end_line": 175},
   "language": "python",
   "metadata": {
     "symbol_type": "function",
     "qualname": "codrag.server.build_project",
     "docstring": "Trigger project index build.",
     "decorators": ["app.post"],
     "is_async": true
   }
 }
 ```

 #### Edges (`trace_edges.jsonl`)

 Required fields:
 - `id`
 - `kind`
 - `source`
 - `target`
 - `metadata`

 Edge kinds (MVP):
 - `contains` (file → symbol)
 - `imports` (file → file or file → external_module)

 Example:

 ```json
 {
   "id": "edge-def456",
   "kind": "imports",
   "source": "node-file-123",
   "target": "node-file-999",
   "metadata": {
     "confidence": 1.0,
     "import": "from fastapi import FastAPI"
   }
 }
 ```

 ### Stable ID strategy

 CoDRAG should use deterministic IDs so references are stable across rebuilds when the entity identity is stable.

 Recommended keys:
 - File node stable key: `file:{file_path}`
 - Symbol node stable key: `symbol:{file_path}:{qualname}:{symbol_type}:{start_line}`
   - `start_line` is included as a practical disambiguator.
   - It is acceptable that IDs change when symbols move significantly.

 Recommended encoding:
 - `id = "node-" + sha1(stable_key)` for nodes
 - `id = "edge-" + sha1(kind + ":" + source + ":" + target + ":" + optional_disambiguator)` for edges

 ### Analyzer behavior (Python MVP)

 Input set:
 - Only files matched by project include/exclude and size constraints.
 - Python MVP focuses on `**/*.py`.

 Extraction:
 - Create a `file` node per parsed file.
 - Extract:
   - top-level `function` and `class` symbols
   - `method` symbols within classes
 - Create `contains` edges: file → symbol.
 - Extract import statements:
   - `import x`
   - `from x import y`
 - Resolve imports best-effort:
   - If the imported module can be mapped to a project file, create `imports` edge to that file node.
   - Otherwise either:
     - create an `external_module` node and edge, or
     - skip unresolved imports (preferred if noise is too high).

 Error behavior:
 - Syntax errors or parse failures must not fail the whole build.
 - For failed files:
   - increment `files_failed`
   - record a per-file error list in `trace_manifest.json` (bounded in size)
 - The dashboard must show “trace incomplete” when failures occurred.

 ### Build integration

 Trace build should be integrated into the project build flow:
 - If `trace.enabled=false`, do not build trace.
 - If `trace.enabled=true`, build trace during `POST /projects/{project_id}/build`.

 Build phases (for progress reporting):
 - `trace_scan` (enumerate files)
 - `trace_parse` (AST parse and extraction)
 - `trace_write` (write JSONL + manifest)

 Incremental trace rebuild:
 - Prefer to reuse Phase 03’s changed-path set to avoid re-parsing unchanged files.
 - If change detection is uncertain (e.g., recovery mode), fall back to full trace rebuild.

 Atomicity:
 - Write trace outputs to a temp directory then swap into place.
 - Never leave partially-written JSONL as the “active” trace index.

 ### Query operations (daemon API)

 The trace API is project-scoped:

 - `GET /projects/{project_id}/trace/status`
   - Returns: `{enabled, exists, building, counts, last_build_at, last_error}`

 - `POST /projects/{project_id}/trace/search`
   - Request: `{query, kinds?, limit?}`
   - Response: `{nodes:[{id, kind, name, file_path, span, language, preview?}]}`
   - Ranking (MVP): exact match > prefix match > substring match.

 - `GET /projects/{project_id}/trace/node/{node_id}`
   - Response: `{node, in_degree, out_degree}`

 - `GET /projects/{project_id}/trace/neighbors/{node_id}`
   - Query params (or request body later):
     - `direction` (`in|out|both`)
     - `edge_kinds` (repeatable)
     - `hops` (default 1)
     - `max_nodes` (default 25)
     - `max_edges` (default 50)
   - Response: `{nodes:[...], edges:[...]}`

 ### Trace-aware context expansion

 Context assembly can optionally include trace traversal.

 UI control:
 - Context page toggle: “Include trace expansion”
 - Optional advanced controls:
   - hops (1–2)
   - edge kinds (imports now; calls later)

 API extension (recommended):
 - `POST /projects/{project_id}/context`
   - Add optional field:

 ```json
 {
   "trace_expand": {
     "enabled": true,
     "hops": 1,
     "direction": "both",
     "edge_kinds": ["imports"],
     "max_nodes": 20,
     "max_additional_chunks": 10,
     "max_additional_chars": 2000
   }
 }
 ```

 Expansion strategy (MVP):
 - Seed selection: use embedding search top-k chunks.
 - Seed mapping: map chunks to trace nodes by `file_path` + span overlap when available.
 - Traverse: bounded BFS by hops and caps.
 - Convert nodes → additional chunks:
   - for `symbol` nodes, prefer the chunk that overlaps the symbol span
   - for `file` nodes, prefer representative chunks near the top of the file
 - Packing: respect the overall `max_chars` budget and a separate trace budget.

 ### Dashboard UX (Trace page)

 The trace page is a “symbol browser”, not a full graph visualization.

 Minimum UI:
 - Symbol search input
 - Results list (name, kind, file_path)
 - Node detail panel:
   - symbol metadata (kind, span, docstring preview)
   - inbound/outbound edges grouped by kind
   - click neighbor to navigate
   - “Copy reference” action (copies a stable node link/id)

 ### Limits and defaults

 - Default neighbors query:
   - `hops=1`
   - `max_nodes=25`
   - `max_edges=50`
 - Default context trace expansion:
   - `hops=1`
   - `max_nodes=20`
   - `max_additional_chars=2000`
 - Hard caps (server-enforced) should exist to prevent runaway responses.

 ## Success criteria
 - Trace build produces a consistent node/edge set for a project.
 - Trace search can locate symbols by name and link back to file/span.
 - Context assembly can optionally include trace-related neighbors without exploding context size.

 ## Research deliverables
 - Node/edge schema definition + stable ID strategy
 - Analyzer plan (python first; TS later) and error behavior for unsupported files
 - Traversal strategy for query-time expansion (hops, limits, ranking integration)

 ## Dependencies
 - Phase 01 (core persistence and project layout)
 - (Optional) Phase 03 incremental build primitives for efficient trace rebuilds

 ## Open questions
 - Stable IDs: span-based vs symbol-name-based vs hash-based
 - Where trace lives in embedded mode and how to avoid watch loops
 - How to integrate `_MASTER_CROSSREFERENCE`-style curated data as an optional input

 ## Risks
 - Over-promising graph correctness early
 - Performance costs on large repos (AST parse time)

 ## Testing / evaluation plan
 - Unit test: python analyzer extracts expected symbols/imports from fixtures
 - Integration test: build trace + build embeddings + context with trace expansion

 ## Research completion criteria
 - Phase README satisfies `../PHASE_RESEARCH_GATES.md` (global checklist + Phase 04 gates)
 
 ## Notes
 Start lightweight; do not require a graph database.
