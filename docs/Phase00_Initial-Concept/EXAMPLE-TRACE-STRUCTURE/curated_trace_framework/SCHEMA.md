# Curated Traceability Entry Schema (Example)

This document defines a content-agnostic schema for curated traceability entries.

## Full schema (YAML)

```yaml
# === REQUIRED FIELDS ===

id: string
# Example: XREF-CODE-a1b2c3
# Recommended: deterministic IDs derived from stable keys.

type: enum
# One of: Plan | Code | Research | Decision | Crossref

name: string
path: string
# Project-relative path for files, or a repo-relative path for documents.
# For external documents, use a stable URL.

version: string
created: date
last_updated: date
updated_by: string

# === ORIGIN & RATIONALE (ADR-inspired) ===

origin:
  source: string
  rationale: string
  alternatives_considered: list[string]  # optional
  decision_date: date  # optional

# === SEMANTIC LINKS ===

links:
  implements: list[LinkObject]
  implemented_by: list[LinkObject]
  depends_on: list[LinkObject]
  depended_by: list[LinkObject]
  supersedes: list[LinkObject]
  superseded_by: list[LinkObject]
  documents: list[LinkObject]
  documented_by: list[LinkObject]
  tests: list[LinkObject]
  tested_by: list[LinkObject]
  related: list[LinkObject]

# === STATUS ===

status:
  state: enum  # planned | in_progress | implemented | deprecated | archived
  coverage: integer  # optional (0-100)
  test_coverage: integer  # optional (0-100)
  last_verified: date
  verification_notes: string  # optional

# === METADATA ===

tags: list[string]
summary: string
notes: string  # optional

# === TRANSITIVE (AUTO-GENERATED) ===

transitive:
  depth: integer
  computed_date: date
  reachable: list[string]
```

## Link object schema

```yaml
id: string
confidence: enum  # high | medium | low
notes: string  # optional
auto_generated: boolean  # default false
generation_pass: string  # optional
```
