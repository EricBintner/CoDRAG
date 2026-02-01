# Opportunities — Phase 00 (Initial Concept)

## Purpose
Track improvement ideas and robustness opportunities discovered during research. These are not commitments; they are a backlog of candidate upgrades.

## Opportunities
- **Differentiate beyond “local-first + MCP”**: treat those as table stakes (ChunkHound exists); emphasize a “trust loop” (freshness + citations + inspectability) and trace-assisted grounding.
- **Language strategy**: decide whether to adopt Tree-sitter (broad language coverage) vs a curated language set with best-in-class UX.
- **LLM-facing efficiency**: prefer lean markdown for assistant-facing outputs; keep structured outputs available when needed.

## Opportunities (UI + control surfaces)
- **Trust console as the product**: design the dashboard as the “truth surface” for:
  - right project selection
  - freshness state
  - verifiable citations
- **Progressive disclosure for power knobs**: safe defaults first, then “Advanced” panels for performance/staleness tuning.
- **Presets as onboarding**: treat presets (“Laptop”, “Workstation”, “Monorepo”) as a guided way to expose complex settings without overwhelming users.

## Opportunities (meaningful visualization)
- **Prefer timelines and counters over flashy graphs**: the most valuable charts are:
  - build phase timeline + duration history
  - staleness (last event, next rebuild)
  - counts (files/chunks/embeddings) and deltas
- **Trace visualization should start bounded**: “symbol browser + neighbors lists” beats a full interactive graph in early product.

## Hazards
- **Scope creep**: “local-first + MCP + trace + dashboard + desktop app” is already a large surface; resist adding non-core features before trust invariants are solid.
- **Contract drift**: MCP tool outputs, HTTP API, and dashboard expectations can diverge unless a single source of truth is enforced.
- **Language explosion**: broad language support without per-language quality guarantees creates fragile UX and undermines trust.
- **Token bloat**: verbose outputs (especially in MCP) can cause agent loops to degrade due to context window pressure.
- **Security posture confusion**: ambiguous messaging about network mode risks accidental exposure and enterprise distrust.

## References
- https://github.com/chunkhound/chunkhound
- `docs/WORKFLOW_RESEARCH.md`
- `docs/DECISIONS.md` (ADR-012 MVP boundary)
- `docs/Phase12_Marketing-Documentation-Website/COPY_DECK.md`
