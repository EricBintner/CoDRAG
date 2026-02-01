# Opportunities — Phase 01 (Foundation)

## Purpose
Capture core-engine opportunities that improve correctness, incremental rebuild efficiency, and failure isolation.

## Opportunities
- **Chunk-level incremental updates**: detect added/modified/deleted chunks within a changed file and preserve embeddings for unchanged chunks (“smart diffs”).
- **Hashing + IDs**: consider faster checksums (xxHash/BLAKE3) plus stable `chunk_id` strategy (`path + span + chunk_hash`) to support true incremental rebuild.
- **Failure isolation**: ensure progress/TTY UI cannot break embedding generation (avoid the class of failures seen in ChunkHound issue #168).

## Opportunities (UI + control surfaces)
- **Deterministic “scan preview”**: a dry-run endpoint/UI that shows:
  - total files discovered
  - top include/exclude matches
  - skipped reasons (too large, binary, parse timeout)
  - a sample of included paths (bounded)
- **Index transparency tools**: expose lightweight index metadata in the dashboard:
  - `format_version`, embedding model, embedding dim
  - last build stats (files/chunks/embeddings)
  - last error code + remediation
- **Quarantine workflow**: persist a bounded list of “failed files” with:
  - last failure reason
  - “Exclude this path/pattern” suggestion
  - “Retry parse” action

## Opportunities (meaningful visualization)
- **Build history and throughput**:
  - build duration over time
  - embeddings/sec and chunks/sec (best-effort)
- **Index growth**:
  - total chunks and total vectors over time
  - disk usage of index directory

## Hazards
- **Non-determinism breaks trust**: unstable `chunk_id` or non-reproducible chunking makes incremental rebuild and citations unreliable.
- **Partial writes / corruption**: if builds are not atomic, search can read an inconsistent snapshot.
- **Scaling ceiling**: NumPy vector store may degrade on very large repos; ensure the abstraction allows a later FAISS swap.
- **Provider fragility**: embedding/LLM outages must not crash the daemon; errors must be actionable.
- **Path inconsistencies**: path normalization issues (symlinks, macOS path aliasing) can cause duplicate entries or missed change detection.

## References
- `src/codrag/core/index.py` (documents.json + manifest.json)
- ChunkHound changelog: xxHash change detection, timeouts, smart diffs
- `docs/ARCHITECTURE.md` (atomicity and persistence)
- `docs/Phase07_Polish_Testing/README.md` (error taxonomy + recovery)
