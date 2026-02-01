# Opportunities — Phase 04 (Trace Index)

## Purpose
Track opportunities to make trace builds incremental, resilient, and useful for real-world repos.

## Opportunities
- **Incremental trace rebuild**: reuse Phase 03’s changed-path set; re-parse only changed files; keep stable node IDs.
- **Trigger scheduling**: separate trace cadence from embedding cadence (trace is heavier). Options include:
  - debounced on-save (dev mode)
  - periodic (e.g., every 10 minutes *while stale*)
  - git-hook driven (post-commit/post-merge) for repo-level events
- **Failure-tolerant trace**: partial builds allowed; per-file errors recorded in `trace_manifest.json`; UI shows “trace incomplete”.
- **Language expansion path**: consider Tree-sitter based symbol extraction for broader language coverage, or plugin analyzers.
- **Trace-to-chunk mapping cache**: build a lookup to map file/span → chunk IDs for fast trace-aware context.

## Opportunities (dashboard tools + settings)
- **Trace health card**: surface trace status alongside embedding status:
  - enabled, exists
  - last build time
  - counts (nodes/edges/files_parsed/files_failed)
  - “trace incomplete” warning when failures occurred
- **Bounded neighbors controls**: make traversal caps explicit and user-controlled (within hard limits):
  - hops (1–2)
  - direction (in/out/both)
  - edge kinds
  - max nodes/edges
- **Trace-aware context budget UI**: treat trace expansion as a separate budget inside context assembly:
  - max additional chunks
  - max additional chars
  - show which chunks came from trace expansion (citations)
- **Analyzer coverage tools**:
  - show which languages are trace-enabled
  - show top failure reasons and “exclude pattern” suggestions
  - a “Rebuild trace only” action (when embeddings are already fresh)

## Opportunities (meaningful visualization)
- **Graph size and health over time**:
  - nodes/edges counts by build
  - files_failed over time (trace reliability trend)
- **Hub/entrypoint hints (bounded)**: show a small list of “high-degree” nodes (top N) as navigation shortcuts.
- **Neighborhood preview**: a compact adjacency list view (grouped by edge kind) instead of an interactive graph.

## Hazards
- **Over-promising correctness**: trace will be partial and language-limited early; the UI must avoid implying full call-graph correctness.
- **Runaway expansion**: unbounded traversal can explode response size and context budgets; strict caps are mandatory.
- **Performance costs**: AST parsing and symbol extraction can be expensive on large repos; incremental rebuild and per-file timeouts are required.
- **ID instability**: if IDs shift too frequently (e.g., start_line changes), saved references and incremental diffs become unreliable.
- **UX complexity**: trace features can overwhelm users unless gated behind clear “basic vs advanced” controls.

## References
- `docs/DECISIONS.md` ADR-011 (JSONL nodes/edges)
- ChunkHound multi-language approach (Tree-sitter)
- `docs/Phase04_TraceIndex/README.md`
- `docs/Phase03_AutoRebuild/README.md`
- `docs/WORKFLOW_RESEARCH.md` (A1-J5)
