# Phase 07 — Polish & Testing TODO

## Links
- Spec: `README.md`
- Opportunities: `opportunities.md`
- Master orchestrator: `../MASTER_TODO.md`
- Research backlog: `../RESEARCH_BACKLOG.md`

## Research completion checklist (P07-R*)
- [ ] P07-R1 Define minimum automated test suite for MVP confidence
- [ ] P07-R2 Define performance targets and repeatable measurement method
- [ ] P07-R3 Decide how to test provider-dependent flows (mocking vs local runtime)

## Implementation backlog (P07-I*)
### Error taxonomy + actionable messaging
- [ ] P07-I1 Finalize stable `error.code` taxonomy across daemon/UI/MCP
- [ ] P07-I2 Ensure errors always provide recommended `hint`
- [ ] P07-I3 Redaction rules for future remote mode (paths/logs/diagnostics)

### Recovery behaviors
- [ ] P07-I4 Interrupted build detection → “recovery needed” state
- [ ] P07-I5 Corruption detection (manifest/documents inconsistency) → hard fail with “Full rebuild” remediation
- [ ] P07-I6 Disk pressure detection → fail early with `DISK_FULL`/`INSUFFICIENT_SPACE`

### Observability + troubleshooting
- [ ] P07-I7 Logging plan:
  - per-project rotated build logs
  - global daemon log
- [ ] P07-I8 Diagnostics bundle plan (“Copy diagnostics”): versions, status, last error code

### Test harness
- [ ] P07-I9 Fixture repo strategy under `tests/fixtures/` (or generated)
- [ ] P07-I10 Integration tests:
  - add project → build → search → context
  - incremental rebuild does not re-embed unchanged files
  - trace build produces trace files when enabled
- [ ] P07-I11 Failure injection tests:
  - provider timeout/outage
  - permission denied
  - disk full
- [ ] P07-I12 “Gold queries” regression suite (manual acceptable initially)

### Performance
- [ ] P07-I13 Define benchmark harness (build throughput, search latency, context latency)
- [ ] P07-I14 Identify top perf levers:
  - lazy index loading
  - caching
  - embedding batch sizing

## Cross-phase strategy alignment
Relevant entries in `../MASTER_TODO.md`:
- [ ] STR-01 API envelope + error model
- [ ] STR-04 Atomic build + last-known-good snapshot
- [ ] STR-05 Output budgets + backpressure

## Notes / blockers
- [ ] Decide CI matrix minimum (macOS/Linux now; Windows before Phase08)
- [ ] Decide which tests are “CI required” vs “local integration only”
