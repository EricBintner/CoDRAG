# Pass 4: Transitive Computation

**Goal**: Compute bounded transitive closures and generate coverage summaries.

---

## Task 4.1: Transitive closure

**Prompt**:
```
For each entry:

1. Traverse links up to depth N (recommend N=2 or N=3)
2. Store reachable IDs under transitive.reachable
3. Mark as auto-generated and record computed_date

Output updated entries.
```

---

## Task 4.2: Coverage reports

Example reports:
- Plans with no implementing code
- Code with no plan/decision links
- High-risk areas (many low-confidence links)

Write outputs under `crossrefs/` (optional) and/or `.validation/`.
