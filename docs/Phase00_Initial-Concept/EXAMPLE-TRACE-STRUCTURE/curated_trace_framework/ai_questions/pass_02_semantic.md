# Pass 2: Semantic Inference

**Goal**: Add medium-confidence links inferred from structure (imports, naming patterns, file locality).

---

## Task 2.1: Infer dependency links from imports

**Prompt**:
```
For each code entry:

1. Parse imports (or use CoDRAG Trace Index imports edges if available)
2. Add `depends_on` links to imported modules/files
3. Mark confidence: medium unless there is an explicit comment citation

Output updated entries.
```

---

## Task 2.2: Infer plan links from naming and proximity

**Prompt**:
```
For each code entry:

1. Compare file/module names with plan titles and tags
2. Use directory proximity as a weak signal (e.g. code near a spec folder)
3. Add `related` or `implemented_by` links with confidence: medium/low
4. Always add notes describing the evidence used

Output updated entries.
```
