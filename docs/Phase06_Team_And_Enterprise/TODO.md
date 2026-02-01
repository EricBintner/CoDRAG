# Phase 06 — Team & Enterprise TODO

## Links
- Spec: `README.md`
- Research + decisions: `RESEARCH_AND_DECISIONS.md`
- Implementation plan: `IMPLEMENTATION_PLAN.md`
- Test plan: `TEST_PLAN.md`
- Opportunities: `opportunities.md`
- Master orchestrator: `../MASTER_TODO.md`
- Research backlog: `../RESEARCH_BACKLOG.md`
- Decision log: `../DECISIONS.md` (ADR-012 MVP boundary)
- Workflow backbone: `../WORKFLOW_RESEARCH.md`

## Research completion checklist (P06-R*)
- [x] P06-R1 Define embedded mode behavior (See: `RESEARCH_AND_DECISIONS.md` — P06-R1):
  - what files exist
  - what can be committed
  - format/version compatibility behavior
- [x] P06-R2 Define merge conflict and corruption handling for committed indexes (See: `RESEARCH_AND_DECISIONS.md` — P06-R2)
- [x] P06-R3 Define network mode security baseline (See: `RESEARCH_AND_DECISIONS.md` — P06-R3):
  - binding defaults
  - auth required rules
  - threat model assumptions
- [x] P06-R4 Specify onboarding UX for team mode (CLI + dashboard) (See: `RESEARCH_AND_DECISIONS.md` — P06-R4)

## Implementation backlog (P06-I*)
**Note:** post-MVP implementation. These items can be executed later, but should remain coherent with earlier phase constraints.

### Shared configuration (Team Tier)
- [ ] P06-I1 Define `.codrag/team_config.json` schema (secret-free) (See: `IMPLEMENTATION_PLAN.md` — P06-I1)
- [ ] P06-I2 Config merge precedence rules (See: `IMPLEMENTATION_PLAN.md` — P06-I2):
  - defaults → global → team → project overrides
- [ ] P06-I3 Config provenance reporting plan (UI/diagnostics) (See: `IMPLEMENTATION_PLAN.md` — P06-I3)

### Embedded mode
- [ ] P06-I4 Embedded index directory layout (`.codrag/index/**`) aligned with Phase01 formats (See: `IMPLEMENTATION_PLAN.md` — P06-I4)
- [ ] P06-I5 Incompatible index detection and remediation UX (“Full rebuild required”) (See: `IMPLEMENTATION_PLAN.md` — P06-I5)
- [ ] P06-I6 Watch-loop avoidance requirements (Phase03): `.codrag/**` excluded always (See: `IMPLEMENTATION_PLAN.md` — P06-I6)

### Network mode
- [ ] P06-I7 Remote bind requires auth; refuse unsafe startup unless explicit override (See: `IMPLEMENTATION_PLAN.md` — P06-I7)
- [ ] P06-I8 Auth header standardization (`Authorization: Bearer <api_key>`) (See: `IMPLEMENTATION_PLAN.md` — P06-I8)
- [ ] P06-I9 Remote-mode redaction rules (See: `IMPLEMENTATION_PLAN.md` — P06-I9):
  - do not leak server filesystem paths
  - sanitize logs/diagnostics

## Testing & validation (P06-T*)
- [ ] P06-T1 Embedded committed index flow (See: `TEST_PLAN.md` — P06-T1):
  - build on machine A
  - commit `.codrag/index/**`
  - clone on machine B
  - instant search without rebuild
- [ ] P06-T2 Merge conflict handling (See: `TEST_PLAN.md` — P06-T2):
  - conflict markers inside `.codrag/index/**` → index invalid → rebuild required
- [ ] P06-T3 Network mode safety (See: `TEST_PLAN.md` — P06-T3):
  - remote bind without auth is rejected
  - remote bind with auth works

## Cross-phase strategy alignment
Relevant entries in `../MASTER_TODO.md`:
- [ ] STR-03 Manifest + versioning (embedded index compatibility)
- [ ] STR-06 Watcher strategy (loop avoidance rules must be universal)
- [ ] STR-09 Licensing + feature gating (tier mapping to features)

## Notes / blockers
- [ ] Decide default guidance for committing `.codrag/index/**` (explicit opt-in vs recommended) (See: `RESEARCH_AND_DECISIONS.md` — D06-01)
- [ ] Decide TLS posture for network mode (reverse proxy acceptable vs built-in) (See: `RESEARCH_AND_DECISIONS.md` — D06-02)
