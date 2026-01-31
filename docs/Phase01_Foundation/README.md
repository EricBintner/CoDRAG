# Phase 01 — Foundation

## Problem statement
CoDRAG’s later phases (dashboard, auto-rebuild, trace, MCP, team mode) all depend on a correct, stable core index with a documented on-disk format and predictable error behavior.

## Goal
Establish CoDRAG’s core engine and data model end-to-end (single-project first, but designed for multi-project).

## Scope
### In scope
- Core index build/search/context primitives
- On-disk persistence format (manifest/documents/embeddings + optional FTS)
- Multi-project foundations (project config shape and storage layout; registry integration)
- “No Ollama” and “build failed” error behavior

### Out of scope
- Full dashboard UX polish
- Trace index extraction and traversal
- Team/network mode

## Derived from (Phase69 sources)
- `../Phase00_Initial-Concept/IMPLEMENTATION.md`
- `../Phase00_Initial-Concept/AI_INFRASTRUCTURE_RESEARCH.md`

## Deliverables
- Core index build/search/context primitives stabilized in `src/codrag/core/`
- On-disk format verified (manifest/documents/embeddings + optional FTS)
- Clean error handling for missing Ollama / failed builds

## Success criteria
- A single project can be indexed end-to-end (build → status → search → context) using CoDRAG’s core engine.
- The on-disk format is stable enough that other components can depend on it.
- Failure modes are predictable and surfaced as user-actionable errors.

## Deep research notes (Phase01 + Phase02)

### User archetypes (Phase01 perspective)

- **Solo developer (local-first default)**
  - Needs: correctness, fast incremental rebuilds, predictable output.
  - Primary fear: silent corruption or silent staleness.

- **Staff engineer / tech lead**
  - Needs: reproducible builds, stable formats for team adoption.
  - Primary fear: format churn breaks downstream tooling (dashboard/MCP).

- **IDE agent user (MCP consumer)**
  - Needs: stable chunk IDs/citations and bounded outputs.
  - Primary fear: non-determinism causes agent loops to degrade.

### Core workflows

The foundation layer must make these workflows reliable:

- **Workflow A: Build lifecycle**
  - scan files
  - chunk
  - embed
  - write index atomically
  - update `manifest.json`

- **Workflow B: Retrieval lifecycle**
  - embed query
  - vector search
  - return ranked chunks
  - assemble context with citations

- **Workflow C: Failure and recovery**
  - dependency down (Ollama unavailable)
  - partial write / interrupted build
  - permission denied / IO failures

### Scope tightening and invariants

Phase01 should explicitly guarantee:

- **Atomic index updates**
  - Search/context always operate on the last known-good snapshot.

- **Stable, inspectable persistence**
  - `manifest.json`, `documents.json`, `embeddings.npy` remain transparent and rebuildable.

- **Deterministic chunk identity**
  - Chunk IDs must be stable across rebuilds when file path + span + content are unchanged.

- **Bounded resource usage**
  - Enforce `max_file_bytes` and caps on request sizes (k, max_chars).

- **Actionable errors**
  - Every failure has a stable `error.code` and a recommended `hint`.

## Research deliverables
- A minimal “core contract” doc (what the engine guarantees to API/CLI/UI)
- A persistence format spec (what files exist and what they contain)
- A baseline performance envelope (what repo sizes are acceptable for MVP targets)

## Dependencies
- `docs/ARCHITECTURE.md` (storage layout + component boundaries)
- `docs/DECISIONS.md` (MVP constraints and technology choices)

## Open questions
- Which fields are mandatory in `manifest.json` for incremental builds and reproducibility
- How optional FTS should be detected and reported (capabilities and fallbacks)
- How much to optimize for large repos in MVP vs post-MVP

## Risks
- Persistence format churn (breaking downstream UI/MCP compatibility)
- Index corruption or partial writes during interrupted builds

## Testing / evaluation plan
- Integration test: build → search → context on a known repo
- Corruption resilience: interrupted build leaves index in a recoverable state

## Research completion criteria
- Phase README satisfies `../PHASE_RESEARCH_GATES.md` (global checklist + Phase 01 gates)

## Notes
This phase should prioritize correctness + persistence format over UI features.
