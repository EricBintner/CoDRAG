# Opportunities — Phase 12 (Marketing Website + Public Documentation)

## Purpose
Capture messaging opportunities that are both differentiating and honest.

## Opportunities
- **Position against CLI-first indexers**: emphasize inspectability, freshness UX, and curated context controls.
- **Trust-first framing**: “right project, fresh index, verifiable sources” as the headline differentiation.
- **No config foot-guns**: highlight that shared configs are secret-free; provider keys stay local.

## Opportunities (docs + onboarding tooling)
- **10-minute trust loop guide**: a single “Getting Started” page that maps directly to the product’s trust invariants:
  - add project
  - build
  - search a known symbol
  - inspect chunk and verify source/span
  - generate bounded context with citations
- **Troubleshooting-first docs**: early adopters need failure playbooks more than feature lists.
- **MCP setup as copy-paste**: include explicit, copyable MCP config examples (pinned vs auto-detect) and a “first query” walkthrough.
- **Local-first transparency section**: clearly list:
  - what is stored locally
  - what is never uploaded
  - what is opt-in (future network mode)

## Opportunities (meaningful visualization)
- **Use screenshots as proof, not decoration**:
  - status page showing freshness/build/error states
  - search result showing file/span + chunk viewer
  - context output showing citations and bounded budgets
- **Simple “How it works” diagrams**: reuse the Phase01/ARCHITECTURE visuals to explain the loop without deep technical detail.
- **Trust indicators on docs pages**: small callouts like “Local-only by default”, “Bounded outputs”, “Citations included”.

## Hazards
- **Over-claiming**: marketing that implies enterprise auth/network mode is already shipping will backfire.
- **Onboarding mismatch**: docs that don’t match the dashboard terminology (project/build/stale/context) create immediate distrust.
- **Security ambiguity**: unclear messaging about what data leaves the machine undermines adoption in security-conscious environments.
- **Docs drift**: if docs are not versioned (or do not reference versions), users will hit stale instructions quickly.
- **Overselling visualization**: fancy “graph UI” promises can distract from the bounded trace UX planned for MVP.

## References
- `COPY_DECK.md` (differentiation bullets)
- ChunkHound issue #161 (config complexity demand)
- `docs/WORKFLOW_RESEARCH.md` (journeys + trust invariants)
- `docs/Phase05_MCP_Integration/README.md`
- `docs/Phase02_Dashboard/README.md`
