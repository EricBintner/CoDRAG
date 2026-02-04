# Phase 12 — Marketing / Docs / Website TODO

## Links
- Spec: `README.md`
- Opportunities: `opportunities.md`
- Master orchestrator: `../MASTER_TODO.md`
- Workflow backbone: `../WORKFLOW_RESEARCH.md`

## Research completion checklist (P12-R*)
- [ ] P12-R1 Domain decision criteria + canonical domain strategy (redirect plan)
- [ ] P12-R2 Domain/subdomain map + hosting assumptions
- [ ] P12-R3 v0 website + docs information architecture (placeholder launch)

## Implementation backlog (P12-I*)
### Domain + infra
- [ ] P12-I1 Confirm `codrag.io` is canonical and redirect legacy `codrag.ai` → `codrag.io`
- [ ] P12-I2 Establish subdomain plan:
  - marketing root
  - docs subdomain
  - support subdomain
  - payments subdomain
  - download/get subdomain
  - storybook subdomain (optional)

### Website scaffold
- [x] P12-I3 v0 placeholder site scaffold exists under `websites/apps/*` (marketing/docs/support/payments)
- [ ] P12-I3b v0 placeholder site pages:
  - home
  - download (placeholder)
  - pricing (placeholder, honest)
  - security/privacy
  - contact
- [ ] P12-I3c Set up redirects for canonical domain and subdomains

### Dev-only UI controls
- [x] `DevToolbar` integrated (dev-only gated) across marketing/docs/support/payments
- [x] Marketing homepage hero variant switching wired via `DevMarketingHero`
- [x] **Strategy Shift: Storybook-First & Universal UI**
  - Instead of running 4 Next.js apps to develop UI, we use Storybook (`npm run storybook -w @codrag/ui`).
  - All "Preview" themes (Neo, Retro, Glass, etc.) have been ported to `@codrag/ui`.
  - Shared components (`MarketingHero`, `FeatureBlocks`, `IndexStats`) are now canonical in `@codrag/ui`.

### Docs scaffold
- [ ] P12-I4 “10-minute trust loop” Getting Started guide (add → build → search → inspect → context)
- [ ] P12-I5 Concepts pages scaffold:
  - local-first model
  - projects/indexes/modes
  - search vs context vs trace
- [ ] P12-I6 Guides scaffold:
  - include/exclude patterns
  - MCP setup (pinned vs auto)
- [ ] P12-I7 Troubleshooting-first docs scaffold:
  - Ollama not running
  - build failures
  - performance tips

### Deployment readiness
- [ ] Wire environment variables for payments (`NEXT_PUBLIC_CODRAG_CHECKOUT_URL`) and document `.env` usage
- [ ] Decide hosting/deploy target(s) (Netlify/Vercel/Cloudflare) and add a repeatable deploy workflow
- [ ] Set up deployment scripts for website and docs

### Versioning + drift control
- [ ] P12-I8 Decide docs hosting approach (in-repo publish vs separate)
- [ ] P12-I9 Decide docs versioning strategy (latest vs versioned per release)

## Cross-phase strategy alignment
Relevant entries in `../MASTER_TODO.md`:
- [ ] STR-01 Error model and terminology alignment (docs must match UI)
- [ ] STR-05 Output budgets messaging (teach bounded context)

## Notes / blockers
- [ ] Decide whether Storybook is public or private
- [ ] Ensure messaging stays honest about enterprise features (ADR-012)

### Known issue: dev servers return 404 for some `/_next/static/*` assets
- **Symptom:** browser shows `Failed to load resource: 404` for `layout.css` and some core chunks.
- **Impact:** pages can render HTML but appear unstyled / broken.
- **Observed behavior:** hashed assets exist under `.next/static/` (e.g. `main-app-<hash>.js`, `static/css/<hash>.css`), but requests for un-hashed `main-app.js` / `layout.css` return 404.
- **Plan:** stop all website dev servers, wipe `.next` artifacts, and restart via `scripts/run_websites.sh --clean --dev` (or equivalent turbo dev). If it persists, investigate Next dev manifest generation and why it’s emitting un-hashed asset URLs.
