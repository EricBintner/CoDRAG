# QA (Open Questions)

## Purpose
Single place to collect open questions discovered during autonomous planning/implementation so execution can continue without interruptions.

## Open questions
- **QA-01: API envelope single source of truth**
  - We currently have both `src/codrag/api/envelope.py` and the older `src/codrag/api/responses.py` implementing envelope helpers.
  - Decide: should `responses.py` be deleted, or turned into a thin compatibility wrapper around `envelope.py`?
- **QA-02: Manifest schema completeness for Phase03 incremental rebuild**
  - Phase03 README describes per-file fields in `manifest.json` (`path`, `content_hash`, `size_bytes`, `chunk_ids`, etc.).
  - Current `CodeIndex` manifest is high-level (build stats + config) and does not track per-file chunk membership.
  - Decide: extend `manifest.json` now (format bump) vs introduce a `manifest_v2.json` / `format_version` and a migration/rebuild policy.
- **QA-03: Span/line-range semantics**
  - `docs/API.md` expects search/context results to optionally include `span`.
  - Current `/projects/{project_id}/search` and `/projects/{project_id}/context` return placeholder spans.
  - Decide: treat span as required for code chunks only, optional for markdown, or always optional.
- **QA-04: Atomic build + last-known-good snapshot contract**
  - Phase01/Phase07 require atomic swap and “last known-good” behavior during rebuilds.
  - Current build writes `documents.json`/`embeddings.npy` in-place.
  - Decide: implement temp-dir + rename swap (and what to do on startup if a temp build dir exists).
- **QA-05: Staleness semantics**
  - UI types include `ProjectStatus.stale`.
  - `AutoRebuildWatcher.status()` currently always returns `stale: False` (placeholder).
  - Decide: what is authoritative for staleness (hash scan vs watcher events), and what minimum fields should be exposed in `GET /projects/{project_id}/status`.
- **QA-06: Test/runtime environment alignment**
  - `pyproject.toml` pytest `addopts` assumes coverage + asyncio plugins, but the active interpreter may not have them installed.
  - Decide: either add the missing dev dependencies, or reduce default pytest config so `pytest` works out-of-the-box.
