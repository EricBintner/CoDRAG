# Phase 00 — Initial Concept TODO

## Purpose
Phase00 is preserved Phase69 planning/research. This TODO exists to:
- Extract durable decisions into Phase01+ docs and ADRs.
- Track unresolved strategic questions that shape multiple later phases.

## Links
- Master orchestrator: `../MASTER_TODO.md`
- Phase69 implementation plan: `IMPLEMENTATION.md`
- Competitors + cutting edge: `COMPETITORS_AND_CUTTING_EDGE.md`
- Trace index research: `TRACE_INDEX_RESEARCH.md`
- AI infra research: `AI_INFRASTRUCTURE_RESEARCH.md`
- Decisions log: `../DECISIONS.md`
- Workflow backbone (journeys + MVP boundaries): `../WORKFLOW_RESEARCH.md`

## Phase00 carry-forward tasks
### Research distillation (P00-R*)
- [ ] P00-R1 Identify any missing ADRs implied by Phase00 research (e.g., language strategy, trace ingestion plugins, evaluation philosophy)
- [ ] P00-R2 Ensure Phase00 “hazards” are translated into explicit guardrails in later phases (01–05 + 07)
- [ ] P00-R3 Convert key Phase00 opportunity statements into cross-phase sprints/tasks (keep Phase00 as “source”, not the execution plan)

### Spec hygiene + alignment (P00-A*)
- [ ] P00-A1 Confirm Phase69 claims in `IMPLEMENTATION.md` still match current repo state (HTTP routes, dashboard location, MCP server assumptions)
- [ ] P00-A2 Keep the “trust loop” framing consistent across:
  - `../WORKFLOW_RESEARCH.md`
  - `../Phase02_Dashboard/README.md`
  - `../Phase12_Marketing-Documentation-Website/README.md`

### Strategy watchlist (P00-S*)
- [ ] P00-S1 Language strategy decision framing: Tree-sitter broad support vs curated “best-in-class” languages
- [ ] P00-S2 Trace “bounded UX first” principle: neighbors lists + symbol browser before any graph visualization
- [ ] P00-S3 Token-efficiency discipline: lean outputs for MCP + context assembly caps everywhere

## Notes / open questions
- [ ] How do we want to formalize “trust” as measurable product behaviors (not just messaging)?
- [ ] What is the minimal acceptable multi-language posture for MVP vs post-MVP?
