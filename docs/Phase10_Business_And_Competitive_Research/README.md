# Phase 10 — Business Plan & Competitive Research
 
 ## Problem statement
 CoDRAG is being built as a **local-first companion app** to modern AI-assisted coding workflows (Cursor/Windsurf/Copilot), with an eventual **enterprise tier** (per-seat licensing).
 
 Without an explicit business plan (ICP, packaging, pricing, distribution, and competitive positioning), we risk building the wrong product and making decisions that later constrain deployment, security, and enterprise adoption.
 
 ## Goal
 Maintain a living business plan and competitive view that directly informs roadmap decisions (ADRs/ROADMAP/phase scope).
 
 ## Scope
 ### In scope
 - Competitive landscape (direct competitors and adjacent categories)
 - Business model and pricing patterns (solo developer-friendly GTM and enterprise path)
 - Packaging tiers (individual, team, enterprise)
 - Distribution strategy:
   - direct download vs app stores (macOS/Windows)
   - enterprise distribution mechanisms
 - “Local-first” definition in enterprise ecosystems (security, compliance, IT ownership boundaries)
 - Git/codebase integration strategy (embedded vs standalone indexes; team onboarding)
 - Cloud option decision framework (when to add it, what it should be)
 - Acquisition/partnership positioning (what makes CoDRAG valuable to Cursor/Windsurf/Copilot ecosystems)
 
 ### Out of scope
 - Implementing features (tracked in other phases)
 - Detailed financial projections beyond lightweight pricing sanity checks
 
 ## Design constraints
 - CoDRAG remains **local-first by default**.
 - Business decisions must not require:
   - mandatory cloud services
   - telemetry as a prerequisite for operation
 - Competitive work must translate into concrete technical bets and roadmap updates (not a static report).
 
 ## Research questions
 - Who is the initial ICP for MVP:
   - solo developers who already use Cursor/Windsurf/Copilot
   - teams adopting AI agents (platform/enablement-led)
 - Which workflow is “must-have” in the first 10 minutes:
   - MCP setup
   - add repo
   - build index
   - query from IDE
 - What “local-first” guarantees are required for enterprise trust?
 - What is the minimal Git integration surface that makes onboarding painless?
 - Do we need any cloud, and if so:
   - licensing-only?
   - encrypted sync?
   - managed team server?
 - What enterprise features should be designed-in early (even if not MVP)?
 
 ## Artifact set
 - [COMPETITOR_LANDSCAPE.md](COMPETITOR_LANDSCAPE.md)
 - [BUSINESS_MODELS_AND_PRICING.md](BUSINESS_MODELS_AND_PRICING.md)
 - [Pricing/PRICING_STRATEGY.md](Pricing/PRICING_STRATEGY.md) (Finalized Strategy)
 - [FINANCE_AND_LEGAL_STRUCTURE.md](FINANCE_AND_LEGAL_STRUCTURE.md) (LLC & Banking Setup)
 - [LOCAL_FIRST_ENTERPRISE_ECOSYSTEM.md](LOCAL_FIRST_ENTERPRISE_ECOSYSTEM.md)
 - [GIT_AND_CODEBASE_INTEGRATION.md](GIT_AND_CODEBASE_INTEGRATION.md)
 - [ACQUISITION_AND_PARTNERSHIPS.md](ACQUISITION_AND_PARTNERSHIPS.md)
 
 Related deployment work lives in Phase 11:
 - `../Phase11_Deployment/`
 
 ## Functional specification
 This phase defines the **process and artifacts** for business/competitive work.

 ### Competitive tracking cadence
 - Monthly lightweight scan
 - Quarterly deeper update
 
 ### Decision outputs
 This phase should result in concrete decisions (or explicit deferrals) for:
 - packaging tiers
 - licensing model
 - distribution channels
 - enterprise roadmap anchors
 
 ### 1) ICP and deployment model
 
 Required fields:
 - Target user roles (e.g., staff engineers, platform teams)
 - Target environments (air-gapped, regulated, on-prem, developer laptops)
 - Deployment model (local-only vs team server) and why
 - Primary adoption channel (individual dev vs platform rollout)
 
 ### 2) Packaging tiers

Define packaging tiers as a mapping to feature surfaces:
- Local-only tier (single machine)
- Team tier (embedded mode + LAN server)
- Enterprise tier (hardening: auth, audit baseline, deployment guidance)

Each tier should specify:
- included features
- excluded features (explicit non-goals)
- operational assumptions
- support expectations

 ### 3) Pricing model

Define:
- pricing unit (per seat, per team, per machine)
- license model (subscription vs perpetual + upgrades)
- how pricing maps to tiers

 ### 4) Go-to-market plan

Minimum fields:
- distribution channels
- onboarding path (what the first 10 minutes look like)
- documentation requirements
- evaluation/trial plan (what “try it” means for a local-first product)

 ### 5) Competitive tracking

Maintain a lightweight competitor system:
- “Table stakes” list vs “differentiators” list
- Competitor matrix (capabilities vs CoDRAG phases)
- “Watch list” (what could invalidate our roadmap bets)

Cadence:
- monthly lightweight scan
- quarterly deeper update

 ## Feedback loop into product decisions

Competitive/business insights must produce one of:
- an ADR update (`docs/DECISIONS.md`)
- a roadmap update (`docs/ROADMAP.md`)
- a phase README update (scope/success criteria)

Rules:
- If a change affects API or on-disk format stability, it requires an ADR.
- If a change affects MVP scope, it requires a roadmap update.

 ## Guardrails

- Do not introduce “enterprise features” that materially increase complexity without a clear ICP-driven justification.
- Keep the product coherent: avoid bolting on unrelated integrations that drift from the core search/context/trace/MCP loop.

 ## Success criteria
 - Business-plan decisions are explicit and reflected in product scope.
 - Competitive insights produce concrete roadmap changes (not just a document).
 - Enterprise implications are identified early enough to avoid re-architecture.

 ## Dependencies
 - MVP feature set is defined enough to price/package (Phases 01–08)

 ## Open questions
 - Target ICP and deployment model (local-only vs managed team server)
 - Pricing model and packaging tiers
 - App store vs direct distribution trade-offs for MVP
 - Enterprise licensing model (offline, license server)

 ## Risks
 - Shipping features that don’t map to a viable distribution or pricing strategy
 - Being surprised by competitor capabilities that should influence technical bets
 - Choosing a distribution channel that conflicts with local-first + sidecar constraints

 ## Testing / evaluation plan
 - Validate plan against early users (qualitative) and operational constraints (quantitative)
 - Verify that enterprise assumptions match real IT constraints (procurement, security, deployment)

 ## Research completion criteria
 - Phase README satisfies `../PHASE_RESEARCH_GATES.md` (global checklist + Phase 10 gates)
