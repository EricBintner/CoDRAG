# Example Trace Structure (Minimal, Content-Agnostic)

This folder is a small, stable reference example for CoDRAG’s **Trace Index** output format.

It is intentionally:
- Content-agnostic (no references to any specific app)
- Small (a tiny sample repo + a tiny expected trace graph)
- Transparent (JSON/JSONL that can be inspected and diffed)

## Contents

- `sample_repo/`
  - A tiny Python codebase used as an input corpus.
- `expected_trace/`
  - `trace_manifest.json`
  - `trace_nodes.jsonl`
  - `trace_edges.jsonl`
- `validate_trace.py`
  - Lightweight validator for the `expected_trace/` files.

## Intended use

- Treat `expected_trace/` as the **known-good** output for this example.
- When CoDRAG’s trace builder is implemented, it should be able to produce an equivalent trace graph (IDs may differ if the ID scheme changes, but the *structure* should match).

## Validate the example trace

From repo root:

```bash
python3 docs/Phase00_Initial-Concept/EXAMPLE-TRACE-STRUCTURE/validate_trace.py \
  docs/Phase00_Initial-Concept/EXAMPLE-TRACE-STRUCTURE/expected_trace
```

## Notes

- This example is aligned with:
  - `docs/Phase04_TraceIndex/README.md`
  - `docs/Phase04_TraceIndex/CURATED_TRACEABILITY_FRAMEWORK.md`
  - `docs/Phase00_Initial-Concept/TRACE_INDEX_RESEARCH.md`
- Optional curated traceability bundle (schema + AI prompts):
  - `docs/Phase00_Initial-Concept/EXAMPLE-TRACE-STRUCTURE/curated_trace_framework/README.md`
