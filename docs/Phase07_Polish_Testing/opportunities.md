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

## Opportunities (dashboard tools + settings)
- **First-class logs UI**:
  - per-project build log viewer (rotated)
  - global daemon log viewer
  - “Copy diagnostics” bundle (version, OS, project id, last error code)
- **Error taxonomy enforcement**:
  - a single UI component for `error.code`, `message`, and `hint`
  - a “show details” affordance with redaction rules (future remote mode)
- **Failure playbook routing**: when a build fails, offer targeted actions:
  - reduce batch size
  - increase per-file timeout
  - exclude suggested path/pattern
  - retry build (incremental vs full)
- **Test harness hooks**: expose a “Run self-check” action that validates:
  - provider connectivity
  - index readability
  - manifest/documents consistency

## Opportunities (meaningful visualization)
- **Reliability dashboard** (local-only):
  - build success rate over time
  - top error codes (count)
  - average build duration + p95
- **Recovery indicators**:
  - “recovery needed” state with last partial build timestamp
  - corrupted index detection count

## Hazards
- **False confidence**: passing unit tests without end-to-end “gold query” checks can still regress retrieval quality.
- **Flaky integration tests**: provider-dependent tests (Ollama) can become unreliable unless mocked or clearly separated.
- **Log leakage**: logs and diagnostic bundles can accidentally include sensitive file paths or content; redaction rules must be explicit.
- **Over-instrumentation**: too much logging can degrade performance or overwhelm users; prioritize actionable signals.
- **Recovery complexity**: partial builds and corrupted indexes must have a single clear remediation path (usually full rebuild).

## References
- ChunkHound issue #168 (non-TTY progress failure)
- `docs/Phase03_AutoRebuild/README.md`
- `docs/Phase07_Polish_Testing/README.md`
- `docs/API.md` (error envelope)
- `docs/WORKFLOW_RESEARCH.md` (trust invariants)
