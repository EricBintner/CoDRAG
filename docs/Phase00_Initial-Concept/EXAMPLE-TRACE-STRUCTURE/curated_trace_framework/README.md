# Curated Traceability Framework (Optional)

This folder contains a **content-agnostic** example of a curated traceability system.

It is designed to complement CoDRAG’s **automated Trace Index** (files/symbols/imports) by capturing higher-level intent:

- plans / requirements
- architecture decisions (ADRs)
- research notes
- explicit links from plans → code and back

## Contents

- `FRAMEWORK.md` — philosophy, directory layout, multi-pass workflow
- `SCHEMA.md` — entry schema (YAML)
- `ai_questions/` — prompts for multi-pass generation/maintenance
- `.validation/` — expected shape of validation outputs

## How this relates to CoDRAG

- The Phase04 Trace Index is **auto-built** from code.
- This curated framework is **optional** and can be maintained by humans and/or AI.
- Long-term, CoDRAG can support retrieval that combines:
  - trace neighbors (imports/contains)
  - curated links (implements/decision/research links)
