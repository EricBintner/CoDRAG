# Phase 69 — Competitors + Cutting-Edge Tech Landscape (CodeRAG / GraphRAG)

This document is an isolated, tech-focused landscape review of adjacent/open-source and commercial "code RAG" / "GraphRAG for developers" systems.

## Goals

- Compare real-world systems that claim to solve repo-scale understanding and editing.
- Identify what is genuinely *cutting-edge* vs. what is table-stakes.
- Convert insights into actionable technical bets for CoDRAG (`code_index` + trace/GraphRAG roadmap).

## Scope

Included sources:

- `code-graph-rag` / Graph-Code (Vitali) — knowledge graph + agentic tooling
  - https://github.com/vitali87/code-graph-rag
  - https://memgraph.com/blog/graphrag-for-devs-coding-assistant
- DataStax GraphRAG (library + examples)
  - https://datastax.github.io/graph-rag/examples/code-generation/
- Neverdecel/CodeRAG (simple file watcher + embeddings + FAISS)
  - https://github.com/Neverdecel/CodeRAG
- Ragie (managed RAG-as-a-Service)
  - https://www.ragie.ai/

Not included (but relevant backdrop): Cursor, Claude Code, Sourcegraph Cody, Continue.dev, etc.

## Other notable competitors (backdrop)
These tools are relevant market context, but are not “apples-to-apples” comparisons with a local-first `code_index` approach. Notes below are intentionally conservative and pointer-based.

- **Cursor**
  - IDE product with agentic coding workflows and built-in retrieval/indexing features.
  - Docs: https://cursor.com/docs
- **Claude Code (Anthropic)**
  - Agentic coding workflow + tool integrations; notably promotes MCP as an integration surface.
  - Docs: https://code.claude.com/docs/en/mcp
- **Sourcegraph (Cody + SCIP)**
  - Long-standing code intelligence/search vendor; SCIP is a key piece of their code graph/indexing strategy.
  - SCIP announcement/blog: https://sourcegraph.com/blog/announcing-scip
- **Continue.dev**
  - Open-source IDE assistant that can be configured with local models and retrieval.
  - Docs: https://docs.continue.dev
- **Aider**
  - CLI-focused agentic editing workflow (patch/test loop) that pairs well with strong retrieval.
  - Repo: https://github.com/Aider-AI/aider

---

# 1) Table-stakes vs Cutting-Edge

## Table-stakes (expected in 2026)

- **Local semantic search** over repo (embeddings).
- **Keyword search fallback** (ripgrep/FTS) for exact identifiers.
- **Chunking that respects structure** (markdown headings, code chunking, overlap).
- **Incremental rebuild / file watching** (at least timestamp/hash-based).
- **Context assembly with citations** (source paths, sections).
- **IDE integration hooks** (MCP or IDE plugin).

## Cutting-edge (where the frontier is)

- **GraphRAG / structured traversal** rather than flat top-k retrieval.
- **Hybrid retrieval with symbolic + semantic signals** (AST edges, import graph, call graph, dependency graph).
- **Repo-scale “global understanding” UI** (graph visualization + navigation).
- **Surgical edits with structural targeting** (AST-based function replacement, not “string replace”).
- **Evaluation harness for code understanding** (measurable correctness, not vibes).
- **Agentic workflows with safety rails** (plan → query → verify → patch → test).

---

# 2) Competitor Deep Dives

## A) Graph-Code (`vitali87/code-graph-rag`)

### What it is

Graph-Code positions itself as “Graph-Based RAG for any codebases”: parse repo to an AST-derived **knowledge graph** stored in **Memgraph** (graph DB), then query it via Cypher, driven by an LLM.

### Architecture (as described)

- **Parser**: Tree-sitter (language-agnostic AST parsing)
- **Graph store**: Memgraph (Docker)
- **Query**: NL → Cypher translation via LLM
- **Retrieval**: return code snippets/functions matched by graph query
- **Editing**: “surgical code replacement” using AST targeting; visual diff previews

### What’s strong / cutting-edge

- **Graph representation for repo-scale understanding** (bird’s-eye view)
- **Graph queries for “architectural questions”** (call chains, dependencies)
- **AST-targeted edits** and workflow-level safety (diff preview)
- **Agentic tool design** (explicit workflow, file editing tools, command execution)
- **MCP server integration** (Claude Code integration in their case)

### Gaps / risks / tradeoffs

- **Heavy dependencies** (Docker graph DB, tree-sitter build toolchain)
- **Operational complexity** vs. a “local-first, minimal moving parts” posture
- **Graph accuracy** depends heavily on language support + parsing coverage
- **LLM-to-Cypher translation** can be brittle without guardrails + schema constraints

### Takeaways

- If we want to compete with Graph-Code’s “global understanding”, we need *some* graph layer.
- We do **not** necessarily need a full graph database to get 80% of the value.

---

## B) Memgraph “GraphRAG for Devs” write-up

### What it highlights

- Cursor/Claude Code are good at local context but lack **architectural mapping**.
- Graph representation enables a **repo-wide view**, dependency understanding, navigation.
- Memgraph is highlighted for **real-time updates** and fast graph ops.

### Takeaways

- The market narrative is clear: *vector search alone is no longer enough*.
- The edge can be: local-first + transparent storage + integrated UX.

---

## C) DataStax GraphRAG (library + code-generation example)

### What it is

A GraphRAG approach that uses a **vector store** plus an **edge graph** between documents and performs **graph traversal** (instead of naive top-k) with a strategy object.

### Key idea (from their example)

GraphRAG outperforms standard vector retrieval for code generation from docs because:
- vector top-k finds relevant snippets,
- but graph traversal can assemble a **coherent set** of nodes that together contain “example + description”.

Their custom strategy:
- traverse nodes;
- at finalize, **prefer nodes with examples**, then fill with descriptive nodes.

### What’s strong / cutting-edge

- **Traversal strategies are composable** and explicit (a real control surface)
- **Graph signals are used without a full graph DB**

### Takeaways

This is the most “compatible” GraphRAG idea for a local-first code index:
- Keep our on-disk index simple,
- add a lightweight edge graph over chunk IDs,
- implement traversal strategies for context assembly.

---

## D) Neverdecel/CodeRAG

### What it is

A straightforward “watch a directory → embed files → store in FAISS → retrieve → call GPT” pipeline, with a Streamlit UI.

### What’s strong

- Simple to understand
- Demonstrates the *minimum viable* code RAG loop

### Gaps

- Narrow scope (appears Python-focused)
- No graph structure
- No advanced evaluation or structured edits

### Takeaway

This is baseline/table-stakes. A serious local-first code index should go beyond this in persistence, UI, and hybrid retrieval.

---

## E) Ragie (managed RAG service)

### What it is

A hosted “Context Engine” for production apps:
- ingestion + syncing,
- chunking,
- multimodal parsing,
- vector + keyword + summary indexes,
- reranking,
- filtering,
- “agentic retrieval” and an MCP bridge.

### What’s strong

- Production ops solved (sync, scaling, connectors)
- Multi-index approach (vector + keyword + summary)
- Reranking and retrieval features are first-class

### Tradeoffs vs a local-first app

- Cloud dependency (not local-first)
- Not specialized for code semantics / AST graphs (at least in their marketing)

### Takeaway

Ragie is the “platform competitor”: they win on operations/connectors; a local-first app wins on privacy + transparency + code-specific structure.

---

# 3) Comparison Matrix (high-level)

| System | Local-first | Code graph | Graph traversal | Hybrid keyword | Incremental updates | MCP | Surgical edits | Primary differentiation |
|--------|-----------:|-----------:|----------------:|--------------:|-------------------:|----:|-------------:|------------------------|
| Graph-Code | Yes | Yes (Memgraph) | Yes (Cypher) | Yes (rg fallback) | Yes (real-time graph updates) | Yes | Yes (AST-targeted) | Repo-as-graph + editing workflow |
| DataStax GraphRAG | N/A (library) | Edges between docs | Yes (strategy traversal) | Depends | Depends | N/A | N/A | Strategy-based traversal for coherence |
| Neverdecel/CodeRAG | Yes | No | No | No/limited | Yes (file monitor) | No | No | Minimal viable pipeline |
| Ragie | No (hosted) | Not code-specific | Possibly | Yes (hybrid) | Yes (sync) | Yes (bridge) | No | Managed ingestion + retrieval |
| CoDRAG `code_index` + trace roadmap | Yes | In progress | In progress | Yes (FTS) | In progress | Yes (MCP codrag) | Indirect (patch workflow) | Local-first + transparent storage |

---

# 4) How CoDRAG Stays Cutting-Edge (Actionable Tech Bets)

## Bet 1: Lightweight GraphRAG layer (no graph DB required)

Add a small edge graph on top of chunk IDs.

- **Nodes**: chunk IDs (existing)
- **Edges**:
  - `same_file_next` (chunk adjacency)
  - `same_symbol` (if we add symbol IDs)
  - `imports` / `references` (approximate via regex + optional tree-sitter)
  - `_MASTER_CROSSREFERENCE` links (already implied by XREF metadata)

Then implement a traversal-based context builder:
- start with vector top-k seeds,
- expand neighbors with a bounded walk,
- score with “coverage” objectives (examples + descriptions, call chain completeness, etc.).

This mirrors DataStax GraphRAG’s *Strategy* concept.

## Bet 2: Add code-structure signals incrementally

We can stage this:

- **Stage A (cheap)**: regex import graph + file adjacency + repo path heuristics.
- **Stage B (medium)**: tree-sitter extraction for:
  - symbol defs (functions/classes)
  - import statements
  - call sites (approx)
- **Stage C (heavy)**: language-server or compiler-backed call graph.

## Bet 3: “Surgical edits” as a first-class workflow

Graph-Code’s standout feature is **structural targeting**.

We can become cutting-edge by:
- extracting symbol boundaries (tree-sitter),
- generating edits “replace function X” rather than “replace these lines”,
- validating by re-parsing after patch.

## Bet 4: Evaluation harness (measurable advantage)

Add a local eval suite for retrieval quality:

- **Gold queries** per repo area (“How do I download models?”, “Where is auth handled?”)
- **Expected citations** (source paths / xref IDs)
- Metrics:
  - recall@k over expected sources
  - coherence score (example+description coverage)
  - duplication rate

This is how we stay cutting-edge beyond “it feels good”.

## Bet 5: Multi-index beyond vector+FTS

Ragie markets “vector + keyword + summary indexes”.

For a local-first tool, we can add:
- **summary index** per file/module (build-time)
- **symbol index** (function/class signatures)
- **doc-type index** (xref_type, tags)

Then retrieval can mix:
- direct chunks,
- summaries for breadth,
- then drill-down chunks.

## Bet 6: Agentic retrieval UX

Graph-Code wins on “bird’s-eye view” + control.

CoDRAG can add a Dev-mode (and later user-facing) UX:
- show retrieved chunks + why they were chosen,
- show graph neighborhood expansion,
- allow “pin this file” / “exclude this folder” quickly,
- show index freshness and what changed.

---

# 5) Where We Already Beat the Field

- **Local-first by default** (privacy + reliability)
- **Transparent on-disk format** (JSON + NPY + SQLite)
- **Hybrid retrieval already implemented** (vector + FTS + keyword boosts)
- **MCP tooling already exists** (codrag)

---

# 6) Recommended Next Steps (Roadmap)

1. **GraphRAG MVP (edges + traversal)**
   - store `edges.json` alongside `documents.json`
   - implement traversal-based context assembly method

2. **Tree-sitter optional plugin**
   - extract symbol boundaries + imports
   - enable “replace symbol” operations

3. **Eval harness**
   - simple JSON testcases + CLI runner
   - integrated into dashboard

4. **UX: retrieval inspector**
   - show chunk headers, score breakdown, and traversal path

---

# Appendix: Notes on Claims vs Evidence

- Graph-Code’s approach is credible but heavier-weight operationally.
- DataStax GraphRAG provides an implementable pattern (strategy traversal) that can be adopted locally.
- Ragie’s marketing aligns with modern best practices (hybrid + rerank + summary index), but it’s not code-graph-specific.
