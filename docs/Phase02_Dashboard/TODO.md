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

## Current progress (dashboard wiring)
- [x] Identified the immediate regression: `src/codrag/dashboard/src/App.tsx` was truncated and references missing state/handlers, especially around `AIModelsSettings`.
- [x] Verified the relevant backend surfaces exist:
  - legacy UI config: `GET/PUT /api/code-index/config`
  - LLM proxy: `GET /api/llm/proxy/models`, `POST /api/llm/proxy/test-model`
  - provider status: `GET /llm/status`
- [x] Verified `@codrag/ui` has the required settings UI components and stories (reference implementations):
  - `AIModelsSettings`, `EndpointManager`
  - `ProjectSettingsPanel`

## Next steps (to restore compile + functionality)
- [ ] Repair `App.tsx` to compile:
  - restore missing `useState` state for LLM config (endpoints + model slots)
  - restore missing handlers and API wiring for model fetch + test
  - ensure settings round-trip persistence via `/api/code-index/config`
- [ ] Smoke test flows:
  - load config on mount
  - update endpoint/model slot → save config
  - fetch models for an endpoint
  - run “test model” and surface results

## Notes / blockers
- [ ] Decide where “project path” is shown vs hidden (future remote mode redaction requirements)
- [ ] Decide whether the dashboard needs a “diagnostics” panel in MVP (Phase07 suggests it)

## Pinned Files feature (dashboard panels) — status, research, plan

### Completed
- [x] UI: added new dashboard panel category `projects` and default layout entries for:
  - `file-tree` (hidden by default)
  - `pinned-files` (hidden by default)
- [x] UI: registered panel definitions in `packages/ui/src/config/panelRegistry.ts`:
  - `file-tree`
  - `pinned-files`
- [x] UI: `FolderTree` now propagates `onNodeClick` down the entire tree (nested items).
- [x] Backend: added canonical endpoint for file content (project-scoped):
  - `GET /projects/{project_id}/file?path=<repo-root-relative-path>`
  - Guards:
    - path traversal prevention (`..`, absolute paths)
    - repo-root containment checks
    - `max_file_bytes` limit
    - include/exclude policy checks

### Remaining TODOs
- [ ] Frontend: add `usePinnedFiles` hook
  - localStorage persistence (paths + ordering)
  - fetch content for pinned paths via backend endpoint
  - error + loading states per file
- [ ] Frontend: wire panels into `src/codrag/dashboard/src/App.tsx`
  - replace/augment existing `roots` sidebar/tree usage with `FolderTreePanel`
  - add `PinnedTextFilesPanel` into `panelContent`
  - ensure panel registry/layout picker shows the new `projects` category
- [ ] Storybook: update `packages/ui/src/stories/dashboard/FullDashboard.stories.tsx`
  - include `FolderTreePanel` and `PinnedTextFilesPanel`
  - demonstrate pin/unpin interaction
- [ ] UI package polish:
  - add missing `.hide-scrollbar` and `.custom-scrollbar` utilities to `packages/ui/src/styles/index.css`
  - export `FolderTreePanel` and `PinnedTextFilesPanel` from UI barrels (and update package exports if needed)

### Research notes (backend file content)
- There was no existing endpoint to fetch arbitrary file content by repo-root-relative path; existing endpoints were chunk-oriented.
- The file content endpoint must be **project-scoped** under `/projects/{project_id}` (canonical API surface).
- Path and policy safety:
  - We prevent traversal via `..` parts and absolute paths.
  - We ensure the resolved absolute path is inside `repo_root`.
  - We enforce `max_file_bytes`.
  - We enforce include/exclude globs.

### Important implementation note (glob matching)
- Python `Path.match()` has surprising semantics with patterns like `**/*.md` and `**/.git/**` for root-level paths (e.g. `README.md` and `.git/...`).
- The endpoint currently uses `fnmatch` + a small normalization rule: if a pattern starts with `**/`, also test the same pattern with that prefix stripped.
  - This allows root-level `README.md` to match `**/*.md`.
  - This also allows root-level `node_modules/...` or `.git/...` to match the equivalent without `**/`.

### Next integration plan
- Add `getProjectFileContent(projectId, path)` to `packages/ui/src/api/client.ts` + TS types.
- Implement `usePinnedFiles({ projectId })` in the dashboard app:
  - source of truth: `Set<string>` of pinned paths + ordered array
  - derive `PinnedTextFile[]` by fetching content
  - map `path -> id` (e.g. stable `id = path`)
- Wire:
  - `FolderTreePanel` gets `pinnedPaths` + `onTogglePin`.
  - `PinnedTextFilesPanel` gets `files` + `onUnpin`.
