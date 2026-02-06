# Marketing + Websites — MASTER TODO

## Purpose
This file tracks **public-facing website work** (marketing/docs/support/payments) separately from the **product/app** backlog in `docs/MASTER_TODO.md`.

## Links
- Phase spec: `Phase12_Marketing-Documentation-Website/README.md`
- IA + wireframe: `Phase12_Marketing-Documentation-Website/WIREFRAME_AND_IA.md`
- Copy deck: `Phase12_Marketing-Documentation-Website/COPY_DECK.md`
- Deployment/DNS: `Phase12_Marketing-Documentation-Website/DEPLOYMENT.md`
- Phase TODO: `Phase12_Marketing-Documentation-Website/TODO.md`
- Design system / Storybook: `Phase13_Storybook/TODO.md`
- App backlog (separate): `MASTER_TODO.md`

## Canonical decisions (locked unless explicitly changed)
- Canonical domain: `codrag.io`
- Legacy redirect: `codrag.ai` -> `codrag.io`
- Subdomains (v0):
  - `docs.codrag.io`
  - `support.codrag.io`
  - `payments.codrag.io`

## Implementation plan (milestones)
- **MKT-M1: Local dev + build reliability**
  - Resolve the Next.js dev static asset 404 issue (ports 3000–3003).
  - Ensure `turbo dev` and `turbo build` succeed for all 4 apps.

- **MKT-M2: Marketing v0 pages ship (codrag.io)**
  - Home, Download (placeholder), Pricing (honest placeholder), Security/Privacy, Contact.
  - Copy aligned with `COPY_DECK.md`.

- **MKT-M3: Docs v0 scaffold ship (docs.codrag.io)**
  - Getting Started “10-minute trust loop”.
  - Concepts + Guides + Troubleshooting scaffold that matches app terminology.
  - Include MCP setup guide with copy/paste examples.

- **MKT-M4: Support + Payments v0 ship (support/payments subdomains)**
  - Support hub page: bug reports, discussions, email, security reporting.
  - Payments hub + recovery flow (placeholder OK, but wired to env + documented).

- **MKT-M5: Deploy + DNS + launch checklist**
  - Provider choice (Vercel recommended) + Cloudflare DNS + redirects.
  - SEO basics (title/description/sitemap/robots) + link validation.

## Workstreams

### MKT-W0: Known blockers
- [ ] Fix Next.js dev static asset 404s (`/_next/static/*`) across ports 3000–3003.

### MKT-W1: Shared UI + drift control
- [ ] Keep “universal” marketing/docs components canonical in `@codrag/ui`.
- [ ] Keep website apps thin: pages + routing + content wiring only (avoid duplicating UI).
- [ ] Prefer Storybook-first UI iteration (`npm run storybook -w @codrag/ui`) and treat Next apps as integration/assembly.
- [ ] Theme contract (must match Storybook):
  - Apply visual direction via `data-codrag-theme="<id>"` on `<html>`.
  - Apply dark mode via `.dark` class on `<html>`.
  - Storybook reference implementation: `packages/ui/.storybook/preview.tsx`.
- [ ] Decide default `data-codrag-theme` + mode per site (marketing/docs/support/payments) and lock it for production.
- [ ] Optional (dev-only): allow `?theme=<id>&mode=light|dark` overrides in Next apps for integration preview, but keep Storybook as the primary place to explore UI.

### MKT-W2: Marketing site (`websites/apps/marketing`)
- [ ] `/` home: hero + loop + local-first trust block + integrations links.
- [ ] `/download`: pre-release placeholder + later checksums/signature guidance.
- [ ] `/pricing`: placeholder tiers + “no token markup” messaging.
- [ ] `/security`: local-first + network behavior + data collection stance.
- [ ] `/contact`: email + GitHub + enterprise interest (honest roadmap).

### MKT-W3: Docs site (`websites/apps/docs`)
- [ ] `/getting-started`: “10-minute trust loop” (add -> build -> search -> inspect -> context).
- [ ] `/mcp`: pinned vs auto-detect configuration + first query walkthrough.
- [ ] `/troubleshooting`: Ollama not running + build failures + performance tips.
- [ ] `/cli`: align with repo CLI docs.
- [ ] `/dashboard`: align terminology and surface map with actual UI.

### MKT-W4: Support site (`websites/apps/support`)
- [ ] “Before you file a bug” checklist (version/OS/logs/repro).
- [ ] Links: issues, discussions, support email, security email.

### MKT-W5: Payments site (`websites/apps/payments`)
- [ ] Wire `NEXT_PUBLIC_CODRAG_CHECKOUT_URL` and document local `.env` usage.
- [ ] Recovery path: receipt/email-based resend (can be placeholder until Lemon Squeezy API work is ready).
- [ ] Success page: clear next steps (install, activate, docs links).

### MKT-W6: Deploy + DNS
- [ ] Choose deploy provider (Vercel recommended) + configure 4 projects.
- [ ] Cloudflare DNS records + redirects (www + legacy domain).
- [ ] Preview deployments enabled for PRs.

### MKT-W7: Quality gates
- [ ] Lighthouse pass (perf/a11y/SEO) for marketing home.
- [ ] Link checker (no broken internal/external links).
- [ ] Manual QA: Chrome/Safari/Firefox.

### MKT-W8: Later (post-v0)
- [ ] `/changelog`
- [ ] `/blog`
- [ ] `/workflows/*` case studies
- [ ] Public vs private Storybook decision + hosting if public
- [ ] Interactive dashboard demo (separate demo app; mock-only)
