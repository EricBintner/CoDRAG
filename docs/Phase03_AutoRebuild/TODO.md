# Phase 03 — Auto-Rebuild TODO

## Links
- Spec: `README.md`
- Opportunities: `opportunities.md`
- Master orchestrator: `../MASTER_TODO.md`
- Research backlog: `../RESEARCH_BACKLOG.md`

## Research completion checklist (P03-R*)
- [ ] P03-R1 Decide watcher strategy (OS events vs polling) + default debounce policy
- [ ] P03-R2 Specify incremental indexing rules (changed detection, hash strategy, stable IDs)
- [ ] P03-R3 Specify loop avoidance in embedded mode (watch exclusions, `.codrag/**`)
- [ ] P03-R4 Specify restart behavior:
  - how staleness is determined on startup
  - whether “pending changes” are persisted

## Implementation backlog (P03-I*)
### Watch service
- [ ] P03-I1 Per-project watcher service controlled by `auto_rebuild.enabled`
- [ ] P03-I2 Include/exclude + size constraints enforced at watcher boundary
- [ ] P03-I3 Storm control layers:
  - event dedup window
  - debounce window
  - min gap / throttled state when changes never settle
- [ ] P03-I4 Polling fallback mode when OS watching is unavailable/unreliable

### Incremental rebuild
- [ ] P03-I5 Hash-based change detection authoritative (watcher is advisory)
- [ ] P03-I6 Skip unchanged files/chunks; remove deleted file chunks
- [ ] P03-I7 Atomic rebuild commit (temp output + swap)

### Status + UX surface
- [ ] P03-I8 Project status adds `watch` block fields required for UI:
  - enabled/state
  - debounce_ms
  - stale/pending
  - pending_paths_count
  - next_rebuild_at
  - last_event_at
  - last_rebuild_at
- [ ] P03-I9 “What changed?” bounded list (optional) for dashboard

## Testing & validation (P03-T*)
- [ ] P03-T1 Integration: modify file → stale flips → rebuild triggers after debounce
- [ ] P03-T2 Regression: rebuild does not re-embed unchanged files/chunks
- [ ] P03-T3 Storm test: rapid-save patterns do not cause rebuild storms
- [ ] P03-T4 Loop-avoidance test: embedded mode ignores `.codrag/**` reliably

## Cross-phase strategy alignment
Relevant entries in `../MASTER_TODO.md`:
- [ ] STR-02 Stable IDs: incremental rebuild depends on stable chunk IDs
- [ ] STR-03 Manifest schema: must record enough to decide “changed” deterministically
- [ ] STR-06 Watcher strategy: pick library + fallback rules

## Notes / blockers
- [ ] Decide whether reconciliation sweep (periodic hash scan) is MVP or post-MVP
- [ ] Decide how much “pending paths” detail is safe to surface in UI/MCP (future remote mode)
