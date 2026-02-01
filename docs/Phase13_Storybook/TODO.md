# Phase 13 — Design System + Storybook TODO

## Links
- Spec: `README.md`
- Opportunities: `opportunities.md`
- Master orchestrator: `../MASTER_TODO.md`
- Dashboard spec (surfaces): `../Phase02_Dashboard/README.md`
- Website/docs spec: `../Phase12_Marketing-Documentation-Website/README.md`

## Research completion checklist (P13-R*)
- [x] P13-R1 Define visual direction exploration plan (multiple prototypes)
- [x] P13-R2 Define token strategy compatible with Tailwind + Tremor
- [x] P13-R3 Define initial component inventory + Storybook expectations

## Implementation backlog (P13-I*)
### Visual directions
- [ ] P13-I1 Produce 3–4 coherent UI directions (shell + status + search + context + settings)
- [ ] P13-I2 Define selection rubric and record chosen direction rationale

### Tokens
- [x] P13-I3 Define token categories:
  - colors (surface/text/border + semantic statuses)
  - typography (incl. code font)
  - spacing/radii
  - motion
- [x] P13-I4 Ensure tokens map cleanly to Tailwind and Tremor theming

### Component inventory + Storybook
- [ ] P13-I5 Standardize first components:
   - [x] status badges (Fresh/Stale/Building/Pending/Throttled)
   - [ ] error code block + remediation panel
   - [x] chunk viewer
   - [x] citation blocks
   - [x] copy-to-clipboard
- [ ] P13-I5a Settings primitives (Phase02 settings panel; see `../Phase02_Dashboard/SETTINGS_TODO.md`):
   - [x] ProjectSettingsPanel (include/exclude/max bytes/trace/auto-rebuild)
   - [x] AIModelsSettings (model slots)
   - [x] EndpointManager (saved endpoints)
   - [ ] SettingsPageLayout (tabs/sections)
   - [ ] SettingsSection / SettingsRow
   - [ ] ToggleSwitch (extract reusable toggle)
   - [ ] TagListEditor (extract from include/exclude editors)
   - [ ] NumberField (validation + units)
   - [ ] BudgetPill + BudgetPreview (context + trace caps)
   - [ ] ConfigProvenanceRow + ConfigDiffSummary (default/global/team/project)
   - [ ] ProviderTestButton / ConnectivityStatusRow
   - [ ] CopyDiagnosticsButton
- [x] P13-I6 Storybook structure:
   - [x] foundations (color/type/spacing)
   - [x] components
   - [x] patterns (trust console states)
- [ ] P13-I7 Accessibility expectations:
  - contrast checks
  - focus states
  - keyboard behaviors

## Cross-phase strategy alignment
Relevant entries in `../MASTER_TODO.md`:
- [ ] STR-01 Error model (single UI component across app + docs)
- [ ] STR-05 Budgets UI (teach bounded outputs)

## Notes / blockers
- [ ] Decide default theme (light vs dark) and whether a density toggle exists
