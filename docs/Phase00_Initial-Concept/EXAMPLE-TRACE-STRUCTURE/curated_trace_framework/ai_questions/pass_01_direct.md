# Pass 1: Direct Link Discovery

**Goal**: Establish high-confidence links by scanning for explicit references in code and documentation.

**Parallelizable**: Yes (by file/directory)

---

## Task 1.1: Scan planning docs for code references

**Input**: Planning/spec docs under a docs root (e.g. `docs/`)
**Output**: Entries in `plans/` plus code-link stubs

**Prompt**:
```
Analyze the planning docs at [docs_path].

1. Read README.md and all .md files in scope
2. Extract explicit mentions of code paths (e.g., "src/...", "packages/...", "frontend/...", "tests/...")
3. For each unique code path found:
   a. Create or update a `Code` entry under `code/` using SCHEMA.md
   b. Add `implemented_by` link back to the relevant plan with confidence: high
4. Create/update the `Plan` entry under `plans/`:
   a. Set origin.source to the doc path
   b. Add `implements` links to discovered code paths with confidence: high
   c. Extract summary from the plan doc

Output the created/updated entries in YAML format.
```

---

## Task 1.2: Scan code files for explicit plan/decision references

**Input**: Source files under [repo_root]
**Output**: Code entries with `implemented_by` links

**Prompt**:
```
Analyze the file at [file_path].

1. Search for explicit references (IDs, links, doc paths) in:
   - module docstrings
   - file header comments
   - inline comments
   - ADR citations
2. For each explicit reference found:
   a. Create/update `code/[file_name].md`
   b. Add `implemented_by` link with confidence: high
   c. Add notes with a short citation (line number or excerpt)

If no explicit references are found, still create the entry and note:
- "ORPHAN_CANDIDATE: no explicit plan/decision references"

Output the created/updated entry in YAML format.
```
