# Opportunities — Phase 03 (Auto-Rebuild)

## Purpose
Track robustness opportunities for keeping indexes fresh without rebuild storms.

## Opportunities (robustness)
- **3-layer storm control**:
  - event dedup window (e.g., suppress duplicate save events within 1–2s)
  - debounce window (e.g., 5s)
  - minimum gap / throttled state when changes never settle
- **Atomic-write handling**: treat rename/move events as “final write”; ignore temp files; avoid indexing partial files.
- **Watcher fallback modes**: OS events first; if watcher setup fails/slow (large repos, network FS), fall back to polling with adaptive interval.
- **Periodic reconciliation sweep**: optional per-project background sweep every N minutes to catch missed file events by re-checking hashes.
- **Two-phase rebuild pipeline**: parse/store quickly; run embeddings as a separate queued phase with backpressure so search stays responsive.
- **Chunk-level diffs**: within changed files, preserve embeddings for unchanged chunks; only re-embed modified/new chunks.
- **Git-aware triggers (optional)**: detect branch switching via `.git/HEAD` changes or offer opt-in git hooks (post-checkout/post-merge/post-commit) to trigger rebuild.
- **Per-file timeout + quarantine list**: skip pathological files, record failures, and propose excludes.
- **Path normalization**: canonicalize paths to avoid macOS `/var` vs `/private/var` mismatch.

## References
- ChunkHound real-time indexing service:
  - https://raw.githubusercontent.com/chunkhound/chunkhound/main/chunkhound/services/realtime_indexing_service.py
- ChunkHound issue #168 (non-TTY progress failure)
