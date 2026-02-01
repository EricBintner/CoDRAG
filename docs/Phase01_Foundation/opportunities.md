# Opportunities — Phase 01 (Foundation)

## Purpose
Capture core-engine opportunities that improve correctness, incremental rebuild efficiency, and failure isolation.

## Opportunities
- **Chunk-level incremental updates**: detect added/modified/deleted chunks within a changed file and preserve embeddings for unchanged chunks (“smart diffs”).
- **Hashing + IDs**: consider faster checksums (xxHash/BLAKE3) plus stable `chunk_id` strategy (`path + span + chunk_hash`) to support true incremental rebuild.
- **Failure isolation**: ensure progress/TTY UI cannot break embedding generation (avoid the class of failures seen in ChunkHound issue #168).

## References
- `src/codrag/core/index.py` (documents.json + manifest.json)
- ChunkHound changelog: xxHash change detection, timeouts, smart diffs
