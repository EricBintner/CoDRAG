# Transition Plan: LinuxBrain Phase69

## Purpose
CoDRAG is now the standalone product/repo that owns the CodeRAG/GraphRAG roadmap.

This document captures a **thorough, actionable migration plan** to:

- Extract and preserve all Phase69 planning knowledge from:
  - `LinuxBrain/Docs_Halley/Phase69_CodeRAG/`
- Extract and preserve the implementation knowledge from:
  - `LinuxBrain/code_index/`
  - `LinuxBrain/halley_core/self_rag/`
- Reframe that work into CoDRAG phases and prepare to deprecate the older LinuxBrain-specific code paths.

This is **not** a research task. It is a migration + reframing task.

## Scope

### In scope
- Documentation migration and re-organization into `CoDRAG/docs/`
- Code migration planning (what moves where, what is rewritten, what is deprecated)
- Deprecation strategy for older LinuxBrain locations

### Out of scope (for this transition)
- New competitor research or market analysis
- New business-plan research
- Large code refactors inside LinuxBrain (beyond placing deprecation notices later)

## Source of truth locations (moving forward)

### Documentation
- **New authoritative location:** `CoDRAG/docs/`
- **Imported historical reference:** `CoDRAG/docs/Phase00_Initial-Concept/`

### Code
- **New authoritative location:** `CoDRAG/src/codrag/`
- Legacy reference:
  - `LinuxBrain/code_index/`
  - `LinuxBrain/halley_core/self_rag/`

## Inventory of Phase69 artifacts (to preserve)
- `IMPLEMENTATION.md` (API + system plan)
- `TRACE_INDEX_RESEARCH.md` (trace/graph roadmap)
- `AI_INFRASTRUCTURE_RESEARCH.md` (Ollama/CLaRa/augmentation integration)
- `MCP.md` (IDE integration surface)
- `STAGE2_CLARA_QUERYTIME.md` (compression integration)
- `STANDALONE_APP_FEASIBILITY.md` (standalone vs embedded)
- `PUBLIC_RELEASE.md` (public/submodule packaging thinking)
- `COMPETITORS_AND_CUTTING_EDGE.md` (landscape + technical implications)
- `CODRAG_PIVOT.md` (explicit pivot notes)

## Code lineage mapping (what becomes what)

### `LinuxBrain/code_index/`
Becomes the basis of CoDRAG core engine modules:

- `code_index/index.py` -> `src/codrag/core/index/` (EmbeddingIndex, persistence, search)
- `code_index/embedder.py` -> `src/codrag/core/llm/ollama.py` (or `core/embeddings.py`)
- `code_index/chunking.py` -> `src/codrag/core/chunking/`
- `code_index/server.py` -> `src/codrag/server.py` (FastAPI routes, but multi-project)
- `code_index/mcp_codrag*` -> `src/codrag/mcp/` (CoDRAG-native MCP)
- `code_index/dashboard/` -> `CoDRAG/website/` (or `CoDRAG/dashboard/`) depending on repo structure

### `LinuxBrain/halley_core/self_rag/`
Self-RAG is a Halley consumer. In CoDRAG it becomes:

- a reference integration (example project + compatibility adapter), not the core engine
- a set of requirements for preserving behavior:
  - hybrid retrieval improvements (keyword + FTS boosts)
  - XREF-aware metadata enrichment (optional plugin/adapter)

## Deprecation strategy (LinuxBrain)
We should deprecate without breaking users:

- Phase A: Documentation-only
  - CoDRAG docs become source of truth
  - LinuxBrain Phase69 docs may be updated later to reference CoDRAG

- Phase B: Compatibility layer
  - Provide a compatibility import or adapter in LinuxBrain so existing Halley endpoints can call CoDRAG engine (or a vendored version)

- Phase C: Deprecate legacy implementations
  - Mark `LinuxBrain/code_index` as deprecated (with a pointer to CoDRAG)
  - Mark `halley_core/self_rag/index.py` as deprecated (already superseded by adapter in Halley)

- Phase D: Remove (only after a migration window)
  - After CoDRAG is stable and Halley is fully migrated, remove legacy code or replace with thin wrappers.

## Migration TODO list (steps ahead)

### 1) Documentation migration (immediate)
- [ ] Create `CoDRAG/docs/Phase01_*` ... phased folder system
- [ ] Copy Phase69 docs into `CoDRAG/docs/Phase00_Initial-Concept/` verbatim
- [ ] Create a CoDRAG phase index file linking phases and imported reference docs

### 2) Technical reframing (docs)
- [ ] Map Phase69 docs to CoDRAG phases (what is now Phase 0/1/2/3...)
- [ ] Define a CoDRAG-specific API contract (multi-project; keep the stable primitives: build/search/context)
- [ ] Define trace index milestones (MVP -> traversal -> UI)

### 3) Code migration planning
- [ ] Identify the minimal set of `LinuxBrain/code_index` modules to transplant first
- [ ] Define target module layout in `CoDRAG/src/codrag/` (core, api, cli, dashboard, mcp)
- [ ] Decide what becomes a plugin vs core:
  - trace analyzers (python, ts)
  - XREF ingest (Halley-specific)
  - CLaRa compression (optional)

### 4) Implementation migration (CoDRAG)
- [ ] Port embedding index build/search/context into `codrag/core`
- [ ] Port MCP server (or re-implement tools over CoDRAG HTTP API)
- [ ] Rebuild/replace the dashboard against CoDRAG multi-project API

### 5) Deprecation execution (LinuxBrain)
- [ ] Add explicit deprecation notes in LinuxBrain docs pointing to CoDRAG
- [ ] Add explicit deprecation notes in `LinuxBrain/code_index/README.md`
- [ ] Add explicit deprecation notes in `LinuxBrain/halley_core/self_rag/` docs (or module docstrings)

## Future research placeholders (do not execute now)
- Business plan: pricing, packaging, go-to-market, enterprise deployment model
- Competitive research: continued monitoring of developer GraphRAG systems and IDE agents

## Definition of done for this transition phase
- CoDRAG/docs contains:
  - an explicit phased folder framework
  - verbatim imported Phase69 docs
  - a clear transition plan + TODO list
- CoDRAG roadmap phases can be navigated without reading LinuxBrain docs
