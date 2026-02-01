# Opportunities — Phase 09 (Post-MVP)

## Purpose
Track high-leverage expansion ideas inspired by competitor capabilities and real-world adoption needs.

## Opportunities
- **Multi-language indexing strategy**: evaluate Tree-sitter adoption (broad language coverage) vs a curated best-supported set.
- **Multi-hop retrieval**: use trace edges + search results as a principled alternative to “LLM-only research” pipelines.
- **Autonomous background tasks (opt-in)**:
  - periodic architecture summaries
  - “what changed?” reports after merges
  - curated traceability generation (plans/decisions/research ↔ code)
- **Plugin system**: allow external parsers/analyzers for niche languages or proprietary formats.

## Opportunities (UI + control surfaces)
- **Experimental features panel**: an explicit “labs” surface for post-MVP features with:
  - per-feature enable toggles
  - clear resource impact warnings (CPU/memory/disk)
  - “rebuild required” prompts when enabling changes affects persistence formats
- **Cross-project search controls (opt-in)**:
  - project selection UI (include/exclude projects)
  - guardrails to prevent accidental data mixing
  - clear citations that include project identity
- **“What changed?” UX**:
  - diff-aware search mode (“changes that relate to X”) with bounded results
  - a “since last build / since last commit / since timestamp” selector

## Opportunities (meaningful visualization)
- **Change intelligence views**:
  - files changed over time
  - directories with highest churn
  - “recently changed symbols” (trace-powered) as a navigable list
- **Cross-project heatmap** (when opt-in exists): queries/searches by project (local-only analytics) to help users verify they’re searching the intended scope.

## Hazards
- **Scope creep**: post-MVP items can destabilize the core trust loop unless each ships with explicit success metrics and rollback paths.
- **Cross-project privacy foot-guns**: cross-project search can accidentally surface sensitive content in the wrong context.
- **Complexity explosion**: plugins, many languages, and new backends can fracture QA and create inconsistent UX.
- **Data model migration pain**: format changes without deterministic rebuild/migration paths will cause upgrade friction.

## References
- ChunkHound features: Tree-sitter 30 languages, multi-hop semantic search
- `docs/Phase09_Post_MVP/README.md`
- `docs/WORKFLOW_RESEARCH.md` (MVP boundaries)
- `docs/ROADMAP.md`
