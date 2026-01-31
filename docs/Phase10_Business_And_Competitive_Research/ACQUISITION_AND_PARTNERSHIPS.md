# Acquisition and Partnerships

## Purpose
CoDRAG’s stated ambition is to become an essential companion to Cursor/Windsurf/Copilot workflows and potentially be acquired by one of these companies.

This doc clarifies:
- what “acquisition-ready” means for CoDRAG
- what partnership surfaces exist today (MCP, plugins, distribution)
- what product choices increase acquisition attractiveness without derailing MVP

## What acquisition targets tend to buy
Likely acquirers in this space want one or more of:
- differentiated technology (retrieval/trace/agent workflows)
- distribution and user adoption momentum
- strategic positioning (local-first, enterprise-friendly)
- integration surface that reduces friction to embed the product

## CoDRAG positioning that is acquisition-friendly

### 1) “Context engine” vs “another IDE”
The most plausible positioning:
- CoDRAG is not competing as a full IDE.
- CoDRAG is a local-first context/index daemon that integrates into IDE assistants.

This matches the architectural decision:
- MCP as primary IDE integration
  - `docs/DECISIONS.md` (ADR-010)

### 2) Local-first + enterprise constraints as a moat
A large portion of enterprise demand is constrained by:
- privacy concerns
- network restrictions
- procurement and security requirements

Competitor signals show enterprise buyers expect:
- SSO/SCIM
- audit logs
- admin controls

Example (Cursor Enterprise lists audit logs + SCIM + granular admin/model controls):
- https://cursor.com/pricing

CoDRAG’s “local-first by default” stance can become a durable differentiation if paired with:
- safe defaults
- clear data-handling guarantees

### 3) Hybrid index mode increases compatibility
Hybrid (standalone + embedded) lets CoDRAG serve:
- solo devs (standalone, clean repos)
- teams (embedded, repeatable onboarding)

Reference:
- `docs/DECISIONS.md` (ADR-003)

### 4) Business Model as a Trust Asset
CoDRAG's "Perpetual License" model builds deep trust with developers who are fatigued by subscriptions.
- This creates a loyal, high-intent user base.
- An acquirer could easily transition this base to a subscription or keep the license model as a "Pro" wedge.

## Partnership surfaces

### MCP
MCP is the primary partnership surface because:
- it is cross-vendor
- it works with Windsurf/Cursor (per project docs)

Reference:
- `docs/DECISIONS.md` (ADR-010)

Partnership-style outcomes:
- “Verified tool” in MCP directories
- shared workflows / examples
- co-marketing via docs and templates

### Optional: IDE-specific plugins (post-MVP)
- VS Code extension (wrap MCP or direct API)
- JetBrains plugin

Reference:
- ADR-010 “Future” notes.

## What to optimize for (as a solo dev)

### 1) Integration simplicity
Acquirers value products that are easy to embed.

Concretely:
- stable HTTP API
- stable MCP tool schemas
- stable on-disk formats

### 2) A crisp, narrow wedge
Your wedge should be obvious:
- “Your local codebase context engine that works with your AI IDE.”

Avoid:
- becoming a general-purpose agent platform
- building a full IDE

### 3) Evidence of differentiation
You’ll likely need at least one “hard” differentiator beyond baseline vector search:
- Trace index (graph structure) integrated into retrieval

This is already in the technical landscape:
- `../Phase00_Initial-Concept/COMPETITORS_AND_CUTTING_EDGE.md`

## Risks
- Chasing partnerships too early can distract from shipping a high-quality core loop.
- Adding cloud prematurely can violate local-first trust and add operational burden.

## Suggested “acquisition readiness” milestones
- MVP ships with:
  - local-first daemon
  - dashboard
  - MCP integration
  - stable storage and project registry
- Post-MVP adds:
  - team onboarding (embedded mode) and a safe network mode baseline
  - enterprise governance features (SSO/SCIM/audit) only when justified

## Open questions
- Which vendor ecosystem is the best initial amplifier (Cursor vs Windsurf vs Copilot)?
- Do we aim for “works everywhere” via MCP first, or do one deep integration?
- What would a Cursor/Windsurf acquisition care about most: tech moat vs distribution?
