# Curated Traceability Framework

This document outlines a curated traceability framework inspired by:

- Requirements Traceability Matrix (RTM) practices
- Code knowledge graphs (typed edges, traversal)
- Architecture Decision Records (ADRs)

The goal is to create a lightweight, queryable graph across plans, decisions, research, and code.

## Principles

- **Unique IDs**: Every entity has a stable identifier.
- **Typed links**: Relationships are explicit (e.g. implements, depends_on).
- **Bidirectional traceability**: Links are traversable both directions.
- **Confidence levels**: Links can be explicit or inferred.
- **Validation**: Detect orphans, broken links, and staleness.
- **Incremental maintenance**: Re-run validation after changes; don’t require full regeneration.

## Recommended directory layout

```
curated_trace_framework/
├── README.md
├── FRAMEWORK.md
├── SCHEMA.md
├── plans/
├── code/
├── research/
├── decisions/
├── crossrefs/
├── ai_questions/
└── .validation/
```

Notes:
- `crossrefs/` is optional for derived artifacts (coverage reports, transitive closures).
- `plans/`, `research/`, and `decisions/` can map to whatever your org uses (product specs, RFCs, ADRs).

## Link type taxonomy (example)

- `implements` / `implemented_by`
- `depends_on` / `depended_by`
- `documents` / `documented_by`
- `supersedes` / `superseded_by`
- `tests` / `tested_by`
- `related` (symmetric)

## Confidence levels

- `high`: explicit citation (doc/comment)
- `medium`: strong inference (naming/imports)
- `low`: speculative

## Multi-pass workflow (AI-friendly)

- **Pass 1 — Direct discovery**
  - Extract explicit references (paths, IDs, doc citations) and create high-confidence links.
- **Pass 2 — Semantic inference**
  - Infer links from imports, naming patterns, and structural clues.
- **Pass 3 — Validation & repair**
  - Enforce bidirectionality; detect orphans/broken links/stale entries.
- **Pass 4 — Transitive computation**
  - Compute bounded transitive closures and coverage reports.
