# School + Enterprise Inspirations (Phase 57)

This document collects:
- **Design-school lineage references** (Cranbrook, Yale, RISD/2x4, SVA, CalArts)
- **Enterprise design system references** (Carbon, Atlassian tokens, Polaris content, Fluent principles, NN/g + governance)
- **Transferable principles** we can incorporate into Halley
- **How those principles map to the sandbox variations** `I–L`

## Note on “lifting” work

I can’t directly copy (lift) copyrighted layouts or student work 1:1.

What I *did* instead:
- Built **original UI explorations** that embody the *principles* and *aesthetic moves* (typographic hierarchy, spatial rhythm, motion posture, information architecture)
- Explicitly labeled each variation **“Inspired by …”** and cite sources below

---

## Key Sources (Design Schools / Alumni)

### Cranbrook (design discourse / studio model)
- **AIGA Eye on Design** — “How Cranbrook’s Design Program Redefined How We Make and Talk About Graphic Design”
  - https://www.aiga.org/eye-on-design/how-cranbrooks-design-program-redefined-how-we-make-and-talk-about-graphic-design
  - Highlights:
    - Studio model described as “self education under good leadership,” non-hierarchical learning
    - Under the McCoys, Cranbrook combined:
      - Assigned work
      - Client work
      - Independent self-initiated work

- **Cranbrook Academy** — “Katherine and Michael McCoy Talk Cranbrook Design…”
  - https://cranbrookart.edu/2023/02/03/katherine-and-michael-mccoy-talk-cranbrook-design-on-scratching-the-surface-podcast/
  - Highlights:
    - “Bridge between theory and practice”
    - Influences: vernacular, social design, Learning from Las Vegas
    - “Polemical… calculated to ruffle designers’ feathers” (Cranbrook: The New Design Discourse)

### CalArts (experimentation / weirdness / poster culture)
- **CalArts news** — “New Book and Exhibition to Celebrate 50 Years of Posters From CalArts”
  - https://calarts.edu/news/new-book-and-exhibition-celebrate-50-years-posters-calarts
  - Highlights:
    - Program emphasizes practical + conceptual skills
    - Includes web/interface design, motion graphics, branding, type design

- **PBS SoCal / Artbound** — “CalArts Poster Archive Preserves Weird and Wonderful Experiments…”
  - https://www.pbssocal.org/shows/artbound/calarts-poster-archive-preserves-weird-and-wonderful-experiments-in-graphic-design
  - Useful framing:
    - Experiments can be spectacular/unreadable/forgettable/unforgettable
    - The point is controlled risk-taking + visual language exploration

- **CalArts GD Yearbook 2025** (program output signals)
  - https://design2025.calarts.edu/

### Yale (typography rigor + cross-disciplinary design thinking)
- **Yale News** — “Yale graphic designers honored for work in the studio and classroom”
  - https://news.yale.edu/2013/04/01/yale-graphic-designers-honored-work-studio-and-classroom
  - Highlights:
    - “Graphic design is everywhere”
    - Emphasis on design as cross-disciplinary collaboration
    - Warns against “everything looks like Instagram” and argues for developing internal voice

### RISD → 2x4 (brand systems + narrative communication)
- **RISD press release** (confirms alumni relationship)
  - https://www.risd.edu/news/for-press/press-releases/rhode-island-school-designs-board-trustees-elects-new-members
  - Highlights:
    - Michael Rock (RISD MFA) co-founded **2x4** with other alumni

- **IE.edu** — “2x4 design studio: Every project starts with a conversation”
  - https://www.ie.edu/our-news/2x4-design-studio-every-project-starts-conversation/
  - Highlights:
    - Communication + clarity
    - Explaining complex ideas accessibly
    - Narrative beats PowerPoint

### SVA IxD (inclusive futures)
- **SVA IxD**
  - https://interactiondesign.sva.edu/
  - Highlights:
    - Inclusive futures framing
    - Methods/mindsets for interaction design

---

## Key Sources (Enterprise Design Systems)

### NN/g (why design systems matter)
- **Design Systems 101**
  - https://www.nngroup.com/articles/design-systems-101/
  - Highlights:
    - Replication at scale
    - Unified language
    - Visual consistency across teams
    - Rebrand/redesign leverage via system
    - Requires time + dedicated team + training

### Governance + “design drift”
- **UXPin** — “Design System Governance: How to Prevent Design Drift…”
  - https://www.uxpin.com/studio/blog/design-system-governance/
  - Highlights:
    - Drift is a workflow problem
    - Component lifecycle: propose → review → build → document → release → measure → deprecate
    - System-first prototyping reduces handoff translation errors

### IBM Carbon (open, inclusive, modular, adoption)
- **Carbon: What is Carbon?**
  - https://carbondesignsystem.com/all-about-carbon/what-is-carbon/
  - Key principles:
    - Open
    - Inclusive
    - Modular and flexible
    - User-first
    - Builds consistency

- **Carbon Motion**
  - https://carbondesignsystem.com/elements/motion/overview/
  - Highlights:
    - Productive vs expressive motion
    - Motion strategy + evaluation checklist

### Atlassian (tokens + semantics)
- **Atlassian design tokens explained**
  - https://atlassian.design/foundations/tokens/design-tokens/
  - Highlights:
    - Tokens are name/value pairs (color, space, typography, motion)
    - Themes as token value sets
    - Best practice: choose tokens by meaning, not by “looks like it”

### Shopify Polaris (content as part of design)
- **Polaris fundamentals**
  - https://polaris-react.shopify.com/content/fundamentals
  - Highlights:
    - Keep copy lean
    - Write like users talk
    - Inspire action
    - Progressive disclosure

### Microsoft Fluent (focus + inclusion)
- **Fluent 2 design principles**
  - https://fluent2.microsoft.design/design-principles
  - Highlights:
    - Built for focus
    - One for all, all for one (inclusion)
    - Natural on every platform

---

## Transferable Principles (What we should steal into Halley)

## 1) “Authorial” layout (Cranbrook / CalArts)
- Treat screens as **composed** rather than “a pile of cards.”
- Allow controlled asymmetry and expressive hierarchy.
- Use “artifact” UI (notes, overlays, callouts) sparingly for moments like onboarding, world-building, creative tools.

## 2) Typography as the primary system (Yale)
- Baseline rhythm + type scale becomes the backbone.
- Better reading experience in chat and long-form persona content.
- A “quiet” UI can still feel premium if typography is disciplined.

## 3) Inclusion + focus as a product posture (SVA + Fluent)
- Strong focus state visuals
- Minimum tap targets (44px)
- Optional reduced motion + high contrast
- Progressive disclosure by default

## 4) Token semantics and theming (Atlassian)
- Token naming by meaning: `color.text.default`, `space.4`, `motion.duration.short`
- Theme switching becomes safe and systematic.

## 5) Adoption + governance (NN/g + UXPin + Carbon)
- Prevent “design drift” via process, not taste policing.
- Establish decision rights, a component lifecycle, and documentation ownership.

## 6) Content is UX (Polaris)
- Keep copy lean and actionable.
- Use progressive disclosure to reduce cognitive load.

---

## Sandbox Variations I–L (Mapping)

### I — Studio Collage (Cranbrook / CalArts-inspired)
- **What it explores**
  - Deconstructed hierarchy, “studio critique” overlays, authored composition
- **Best used for**
  - World-building tools, creative flows, onboarding narratives
- **Risks**
  - Easy to become inconsistent or inaccessible if not tokenized underneath

### J — Yale Grid (Typography discipline)
- **What it explores**
  - Grid-first, quiet UI, semantic hierarchy
- **Best used for**
  - Chat reading experience, persona editing, “serious” tool posture
- **Risks**
  - Can feel too restrained unless brand moments are introduced carefully

### K — Inclusive Focus (SVA IxD + Fluent principles)
- **What it explores**
  - Focus states, reduced motion, high contrast, progressive disclosure
- **Best used for**
  - Settings flows, onboarding, high-stakes edit screens
- **Risks**
  - Needs careful integration so accessibility controls apply consistently across the real app

### L — Enterprise Console (Carbon + Atlassian tokens + governance)
- **What it explores**
  - Sidebar + table + details pane, token-ish CSS variables, semantic tags
- **Best used for**
  - Admin-like surfaces: memory management, model settings, audit/debug
- **Risks**
  - Can shift product vibe “too enterprise” unless balanced with Halley’s brand personality

---

## What I recommend you decide next

- Pick **one “north-star” posture** for Halley:
  - **A)** Quiet + typographic (J)
  - **B)** Expressive studio tool (I)
  - **C)** Accessibility + focus (K)
  - **D)** Enterprise console for power users (L)

Then we can:
- Create a **hybrid** strategy:
  - Chat = J
  - Worlds = I
  - Settings/Memory = L
  - Global accessibility posture = K

---

## File locations

Sandbox variations:
- `sandbox/variation-i-studio-collage/`
- `sandbox/variation-j-yale-grid/`
- `sandbox/variation-k-inclusive-focus/`
- `sandbox/variation-l-enterprise-console/`

Index hub:
- `sandbox/index.html`
