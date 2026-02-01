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

## References
- `docs/DECISIONS.md` ADR-011 (JSONL nodes/edges)
- ChunkHound multi-language approach (Tree-sitter)
