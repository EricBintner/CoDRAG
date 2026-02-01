# Opportunities — Phase 07 (Polish & Testing)

## Purpose
Capture reliability and test-harness opportunities discovered from competitor learnings and anticipated real-world failures.

## Opportunities
- **Non-TTY resilience**: ensure progress/terminal rendering cannot break embedding generation (avoid the class of failures seen in ChunkHound issue #168).
- **Failure injection tests**:
  - embedding provider timeouts
  - transient provider outages (Ollama down mid-build)
  - disk full mid-build
  - permission denied on individual files
- **“Gold queries” regression suite**: maintain a small set of representative repos + queries to validate retrieval quality and freshness behavior over time.
- **Auto-rebuild storm tests**:
  - rapid-save patterns (created+modified bursts)
  - atomic write patterns (temp → rename)
  - missed watcher events + reconciliation sweep
- **Cross-platform watcher matrix**: explicit test coverage for macOS/Windows/Linux, plus network filesystem scenarios where polling fallback is needed.

## References
- ChunkHound issue #168 (non-TTY progress failure)
- `docs/Phase03_AutoRebuild/README.md`
