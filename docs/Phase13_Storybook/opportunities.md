# Opportunities — Phase 13 (Storybook)

## Purpose
Capture design-system/UI opportunities that make advanced indexing controls approachable.

## Opportunities
- **Advanced settings UX**: group controls by intent (Freshness, Performance, Providers, Safety) with safe defaults + progressive disclosure.
- **Index status components**: reusable status badges (Fresh/Stale/Building/Pending/Throttled) + build progress timeline.
- **Troubleshooting components**: error code blocks, remediation panels, “Copy diagnostics” UI patterns.
- **Trace exploration UX**: node detail panel and neighbors view that stays bounded and understandable.

## Opportunities (component primitives)
- **Status primitives**:
  - standardized badge variants (Fresh/Stale/Building/Pending/Throttled/Recovery)
  - timeline component for build phases with durations
  - “caps/budget” pills (e.g., `max_chars`, `max_nodes`) used across context + trace UIs
- **Settings primitives**:
  - preset selector (Laptop/Workstation/Monorepo)
  - advanced toggle sections with clear “defaults vs overridden” display
  - config provenance row (default/global/team/project)
- **Error primitives**:
  - error summary + expandable details
  - remediation panel that can render “actions” (open settings, rebuild, retry)
  - redaction-friendly error rendering for future remote mode
- **Data display primitives**:
  - small sparklines for event/build cadence
  - compact tables for “coverage by extension” and “top churn directories”

## Hazards
- **Token churn via UI inconsistency**: if components render different labels/states for the same concept (freshness, budgets), users won’t trust the system.
- **Over-designing too early**: locking tokens/components before the core dashboard surfaces stabilize causes rework.
- **Accessibility regressions**: charts, badges, and dense tables must remain accessible (contrast, keyboard navigation).
- **Design system fights Tremor**: introducing patterns that diverge from Tremor primitives increases maintenance and inconsistency.

## References
- `docs/Phase03_AutoRebuild/README.md`
- `docs/Phase04_TraceIndex/README.md`
- `docs/Phase02_Dashboard/README.md`
