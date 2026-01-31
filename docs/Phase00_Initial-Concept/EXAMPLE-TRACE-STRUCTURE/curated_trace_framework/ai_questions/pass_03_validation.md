# Pass 3: Validation & Repair

**Goal**: Ensure bidirectional consistency, identify orphans, repair broken links, and generate validation reports.

---

## Task 3.1: Bidirectional consistency

**Prompt**:
```
Validate bidirectional link consistency across all entries.

For each entry:
1. For each link A -> B, ensure the inverse link exists on B.
2. If inverse is missing:
   - Add it with the same confidence
   - Set auto_generated: true
   - Set generation_pass: "Pass3-Validation"

Output:
- List of repairs
- Updated entries
```

---

## Task 3.2: Orphan detection

An entry is orphaned if it has no meaningful links explaining purpose (e.g., no implemented_by/documents/related).

Write `.validation/orphans.json`.

---

## Task 3.3: Broken link detection

Report references to non-existent IDs in `.validation/broken_links.json`.

---

## Task 3.4: Stale entry detection

Flag entries with old `last_updated` / `last_verified` in `.validation/stale_entries.json`.
