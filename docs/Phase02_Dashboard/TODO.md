# Phase 02 — Dashboard TODO

## Links
- Spec: `README.md`
- Opportunities: `opportunities.md`
- Settings backlog: `SETTINGS_TODO.md`
- Master orchestrator: `../MASTER_TODO.md`
- Research backlog: `../RESEARCH_BACKLOG.md`
- API contract: `../API.md`
- Workflow backbone: `../WORKFLOW_RESEARCH.md`

## Research completion checklist (P02-R*)
- [ ] P02-R1 Finalize dashboard information architecture (pages, navigation, empty/error states)
- [ ] P02-R2 Finalize UI-facing API contract shapes for:
  - projects list/add/remove
  - build/status
  - search
  - context
- [ ] P02-R3 Decide minimum build progress granularity required for MVP

## Implementation backlog (P02-I*)
### App shell + navigation
- [ ] P02-I1 Project list (sidebar) + add/remove flows
- [ ] P02-I2 Project tabs (open/close, persist)
- [ ] P02-I3 Global settings modal (provider URLs, defaults)
  - ollama URL
  - default embedding model
  - optional: CLaRa URL + enable toggle

### Status/build
- [ ] P02-I4 Status page “trust console” card(s):
  - right project identity (name + path)
  - index exists / last successful build
  - building / pending
  - last error (code/message/hint)
  - [ ] P02-I4a Provider connectivity tests: “Test Ollama” / “Test CLaRa” buttons with clear pass/fail + hint (uses `GET /llm/status` + `POST /llm/test`)
- [ ] P02-I5 Build actions:
  - incremental build (default)
  - full rebuild (confirm)

### Search + inspection
- [ ] P02-I6 Search page:
  - query input
  - results list with previews
  - chunk viewer panel/drawer
- [ ] P02-I7 Search result inspectability:
  - show path + span
  - copy chunk
  - optional score display behind toggle

### Context assembly
- [ ] P02-I8 Context page:
  - query input
  - bounded settings UI (`k`, `max_chars`, `min_score`)
  - output viewer with citations
  - copy-to-clipboard

### Settings
- [ ] P02-I9 Per-project settings:
  - core/working roots selection
  - include/exclude globs
  - max file bytes
  - trace enabled
  - auto-rebuild enabled
  - auto-rebuild tuning (debounce, min gap)

### Error + loading states
- [ ] P02-I10 Standardize UX states: loading / empty / ready / error
- [ ] P02-I11 Standard error component that renders `error.code`, message, and hint consistently

## Testing & validation (P02-T*)
- [ ] P02-T1 E2E smoke: add project → build → search → open chunk → context
- [ ] P02-T2 Error-state tests:
  - project not found
  - Ollama unavailable
  - build failed

## Cross-phase strategy alignment
Relevant entries in `../MASTER_TODO.md`:
- [ ] STR-01 API envelope + error codes: UI component must assume stable shapes
- [ ] STR-05 Budgets: UI defaults must match daemon/MCP conservative defaults
- [ ] STR-04 Atomic build: UI must communicate “last known-good snapshot” behavior

## Notes / blockers
- [ ] Decide where “project path” is shown vs hidden (future remote mode redaction requirements)
- [ ] Decide whether the dashboard needs a “diagnostics” panel in MVP (Phase07 suggests it)
