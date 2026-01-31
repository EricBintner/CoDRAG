# Phase 69 — Standalone Multi-Project RAG App Feasibility Study

## Executive Summary

**Proposal:** Instead of embedding `code_index` as a git submodule in each project, build a **standalone application** (similar to Ollama) that manages multiple projects simultaneously, consolidates LLM resources, and provides a unified dashboard for RAG/trace operations.

**Verdict:** This is a **viable and potentially superior** approach for power users managing multiple codebases. It trades project-level portability for operational simplicity and resource efficiency.

---

## The Two Architectures

### Option A: Project-Embedded (Current Plan)
```
Project-A/
├── code_index/           ← git submodule
│   └── .code_index/      ← index data lives in project
└── ...

Project-B/
├── code_index/           ← another submodule copy
│   └── .code_index/
└── ...
```

### Option B: Standalone App (New Proposal)
```
~/.local/share/codebase-rag/        ← centralized data
├── config.yaml                      ← global settings
├── projects/
│   ├── project-a/                   ← index for Project-A
│   │   ├── embeddings.npy
│   │   ├── documents.json
│   │   ├── trace_nodes.jsonl
│   │   └── manifest.json
│   └── project-b/                   ← index for Project-B
│       └── ...
└── cache/
    └── ollama-responses/            ← shared LLM cache

codebase-rag                         ← standalone binary/script
├── serve                            ← HTTP server (daemon mode)
├── build <project-path>             ← CLI commands
├── search <query>
└── ui                               ← opens dashboard
```

---

## Comparison Matrix

| Aspect | Project-Embedded | Standalone App |
|--------|------------------|----------------|
| **Setup per project** | `git submodule add` + config | `codebase-rag add <path>` |
| **Index location** | Inside project (`.code_index/`) | Centralized (`~/.local/share/`) |
| **Multi-project** | Run separate servers per project | Single server, multiple tabs |
| **LLM resources** | Each project manages its own | Shared Ollama/CLaRa connection |
| **Memory footprint** | N servers × memory | 1 server, amortized |
| **Portability** | Index travels with project (git) | Index stays on machine |
| **CI/CD integration** | Easy (index in repo) | Harder (needs setup step) |
| **Team sharing** | Commit index to repo | Each dev builds locally |
| **Offline machines** | Self-contained | Needs app installed |

---

## Technical Architecture (Standalone)

### System Topology

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          Standalone RAG App                                 │
│                        (codebase-rag daemon)                                │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         Dashboard (React/Tauri)                      │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐            │   │
│  │  │Project A │  │Project B │  │Project C │  │  + Add   │   (tabs)   │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘            │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐│   │
│  │  │ Build │ Search │ Context │ Trace │ Settings │ LLM Status       ││   │
│  │  └─────────────────────────────────────────────────────────────────┘│   │
│  └─────────────────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────────────────┤
│  HTTP API (FastAPI @ localhost:8400)                                        │
│  ├── /projects                    ← list/add/remove projects               │
│  ├── /projects/{id}/status        ← per-project status                     │
│  ├── /projects/{id}/build         ← trigger build                          │
│  ├── /projects/{id}/search        ← semantic search                        │
│  ├── /projects/{id}/context       ← assemble context                       │
│  ├── /projects/{id}/trace/*       ← trace index endpoints                  │
│  ├── /llm/status                  ← Ollama/CLaRa connection status         │
│  └── /llm/config                  ← LLM settings                           │
├─────────────────────────────────────────────────────────────────────────────┤
│  Project Manager                                                            │
│  ├── ProjectRegistry (SQLite: projects, build history, settings)           │
│  ├── FileWatcher (fsnotify: detect changes, trigger incremental builds)    │
│  └── BuildQueue (async builds, priority, cancellation)                     │
├─────────────────────────────────────────────────────────────────────────────┤
│  Index Engine (per project)                                                 │
│  ├── EmbeddingIndex (current code_index logic)                             │
│  ├── TraceIndex (symbol graph, import edges)                               │
│  └── IncrementalBuilder (hash manifest, diff-based rebuild)                │
├─────────────────────────────────────────────────────────────────────────────┤
│  LLM Coordinator                                                            │
│  ├── OllamaClient (embeddings, augmentation)                               │
│  ├── ClaraClient (optional compression)                                    │
│  └── RequestQueue (rate limiting, retry, caching)                          │
└─────────────────────────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
    ┌─────────┐         ┌─────────┐         ┌─────────┐
    │ Ollama  │         │  CLaRa  │         │ Project │
    │ :11434  │         │  :8765  │         │  Dirs   │
    └─────────┘         └─────────┘         └─────────┘
```

### Data Model

```yaml
# ~/.local/share/codebase-rag/config.yaml
ollama_url: http://localhost:11434
clara_url: http://localhost:8765     # optional
embedding_model: nomic-embed-text
augmentation_model: mistral          # optional
auto_rebuild: true                   # watch for changes
rebuild_delay_ms: 5000               # debounce

# Per-project config stored in registry
projects:
  - id: "proj-abc123"
    name: "LinuxBrain"
    path: "/Volumes/4TB-BAD/HumanAI/LinuxBrain"
    index_dir: "~/.local/share/codebase-rag/projects/proj-abc123"
    include_globs: ["**/*.py", "**/*.md", "**/*.ts", "**/*.tsx"]
    exclude_globs: ["**/node_modules/**", "**/.venv/**", "**/dist/**"]
    trace_enabled: true
    last_build: "2026-01-30T15:00:00Z"
    auto_rebuild: true
```

### CLI Interface

```bash
# Daemon management
codebase-rag serve                    # start daemon (background)
codebase-rag serve --foreground       # start in foreground
codebase-rag stop                     # stop daemon

# Project management
codebase-rag add /path/to/project     # register project
codebase-rag add . --name "MyProject" # register current dir
codebase-rag list                     # list all projects
codebase-rag remove <project-id>      # unregister (keeps index)
codebase-rag remove <project-id> --purge  # remove index too

# Build operations
codebase-rag build <project-id>       # trigger full build
codebase-rag build --all              # rebuild all projects
codebase-rag status                   # show all project status
codebase-rag status <project-id>      # show specific project

# Query operations
codebase-rag search <project-id> "query"
codebase-rag context <project-id> "query" --max-chars 8000

# Dashboard
codebase-rag ui                       # open dashboard in browser
codebase-rag ui --port 8401           # custom port
```

### MCP Integration

The standalone app exposes the same MCP tools, but scoped to a "current project":

```json
{
  "mcpServers": {
    "codebase-rag": {
      "command": "codebase-rag",
      "args": ["mcp", "--project", "proj-abc123"],
      "env": {}
    }
  }
}
```

Or auto-detect project from `cwd`:
```json
{
  "mcpServers": {
    "codebase-rag": {
      "command": "codebase-rag",
      "args": ["mcp", "--auto"],
      "env": {}
    }
  }
}
```

The `--auto` flag looks up the current working directory in the project registry.

---

## Dashboard UX Concept

### Main Window (Tauri or Electron)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ◉ ○ ○   Codebase RAG                                              ─ □ ✕  │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────┬──────────┬──────────┬──────────┬─────────┐                   │
│  │Project A │ Project B│ Website  │ + Add... │         │                   │
│  └──────────┴──────────┴──────────┴──────────┴─────────┘                   │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │ 📊 Status    🔨 Build    🔍 Search    🗺️ Trace    ⚙️ Settings           ││
│  └─────────────────────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Project: LinuxBrain                                                        │
│  Path: /Volumes/4TB-BAD/HumanAI/LinuxBrain                                  │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │ Index Status                                                            ││
│  │ ├── Documents: 1,247                                                    ││
│  │ ├── Embeddings: 1,247 vectors (768 dim)                                 ││
│  │ ├── Trace Nodes: 3,892                                                  ││
│  │ ├── Trace Edges: 8,421                                                  ││
│  │ ├── Last Build: 2026-01-30 14:32:00 (28 min ago)                        ││
│  │ └── Changed Files: 3 (auto-rebuild in 2s)                               ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │ LLM Services                                                            ││
│  │ ├── Ollama: ● Connected (localhost:11434)                               ││
│  │ │   └── Models: nomic-embed-text, mistral                               ││
│  │ └── CLaRa: ○ Not running                              [Start CLaRa]     ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                             │
│  [Rebuild Now]  [Open in IDE]  [Export AGENTS.md]                          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Search Tab

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  🔍 Search                                                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │ How does image generation work?                            [Search] 🔄  ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│  k: [10]  min_score: [0.3]  ☑ Include trace expansion                      │
├─────────────────────────────────────────────────────────────────────────────┤
│  Results (8 chunks, 342ms)                                                  │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │ 1. src/docs/README.md:1-50                              score: 0.82     ││
│  │    └── "Image generation architecture overview..."                      ││
│  ├─────────────────────────────────────────────────────────────────────────┤│
│  │ 2. src/server.py:112-145                              score: 0.79     ││
│  │    ├── Symbol: generate_image()                                         ││
│  │    ├── Trace: called_by → /api/image/generate endpoint                  ││
│  │    └── "Handles image generation API requests..."                       ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                             │
│  [Copy as Context]  [Open Files in IDE]  [Show in Trace Graph]             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Settings Tab (Global)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ⚙️ Global Settings                                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  LLM Configuration                                                          │
│  ├── Ollama URL: [http://localhost:11434        ]                          │
│  ├── Embedding Model: [nomic-embed-text    ▼]                              │
│  ├── Augmentation Model: [mistral          ▼] ☑ Enable                     │
│  └── CLaRa URL: [http://localhost:8765          ] ☐ Enable compression     │
│                                                                             │
│  Index Storage                                                              │
│  ├── Data Directory: [~/.local/share/codebase-rag     ] [Browse]           │
│  └── Max Index Size: [10   ] GB                                            │
│                                                                             │
│  Auto-Rebuild                                                               │
│  ├── ☑ Watch for file changes                                              │
│  ├── Debounce delay: [5000 ] ms                                            │
│  └── ☐ Rebuild on app start                                                │
│                                                                             │
│  MCP Integration                                                            │
│  ├── Default port: [8400 ]                                                 │
│  └── [Copy MCP Config for Windsurf]                                        │
│                                                                             │
│  [Save]  [Reset to Defaults]                                               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Implementation Options

### Option 1: Pure Web (FastAPI + React)
- **Stack:** FastAPI backend, React frontend, browser-based
- **Pros:** Cross-platform, no native build complexity
- **Cons:** No system tray, no auto-start, feels less "app-like"
- **Effort:** Medium

### Option 2: Tauri (Rust + React)
- **Stack:** Tauri shell, React frontend, Python backend via sidecar
- **Pros:** Native feel, small binary, system tray, auto-start
- **Cons:** Python sidecar adds complexity, Rust learning curve
- **Effort:** High

### Option 3: Electron (Node + React)
- **Stack:** Electron shell, React frontend, Python backend via child process
- **Pros:** Mature ecosystem, familiar stack
- **Cons:** Large binary (~150MB), higher memory usage
- **Effort:** Medium-High

### Option 4: Python + System Service
- **Stack:** FastAPI daemon, React/Vite dashboard (served by FastAPI)
- **Pros:** Simplest, reuses existing code_index work
- **Cons:** No native app chrome, manual daemon management
- **Effort:** Low

**Recommendation:** Start with **Option 4** (Python daemon + web dashboard), add Tauri wrapper later if native feel is important.

---

## Resource Sharing Benefits

### Without Standalone App (N Projects)
```
Project A server → Ollama (nomic-embed-text loaded)
Project B server → Ollama (nomic-embed-text loaded again? or shared)
Project C server → Ollama (...)

Memory: 3 Python processes + N model loads (if not shared)
Ports: 3 different ports to remember
```

### With Standalone App
```
Codebase RAG daemon → Ollama (single connection, model stays warm)
                   → CLaRa (single connection, auto-unload works correctly)

Memory: 1 Python process, 1 Ollama connection
Ports: 1 port (8400), projects accessed via /projects/{id}/*
```

### Incremental Build Efficiency
- File watcher can dedupe across projects (if they share subtrees)
- Embedding requests can be batched across projects
- Single build queue with priority

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| **Single point of failure** | All projects down if daemon crashes | Auto-restart, health checks, graceful degradation |
| **Index not portable** | Can't share index via git | Export/import commands, or hybrid mode |
| **Complex setup for new devs** | Onboarding friction | One-liner install, auto-detect projects |
| **Cross-project data leakage** | Privacy concerns | Strict project isolation, no cross-project queries (unless explicit) |
| **Stale indexes** | Forgot to rebuild | Auto-rebuild on file change, staleness warnings |

---

## Hybrid Mode (Best of Both?)

Could support **both** modes:

```bash
# Standalone mode (default)
codebase-rag add /path/to/project

# Embedded mode (for specific project)
codebase-rag add /path/to/project --embedded
# Creates /path/to/project/.codebase-rag/ with index inside
# Still managed by central daemon, but data lives in project
```

This allows:
- Developers who want portability → embedded mode
- Power users with many projects → standalone mode
- Team projects → embedded (commit to repo)
- Personal exploration → standalone

---

## Comparison with Existing Tools

| Tool | Scope | Multi-Project | Dashboard | Local-First |
|------|-------|---------------|-----------|-------------|
| **Ollama** | LLM serving | N/A | Basic web UI | ✅ |
| **LM Studio** | LLM serving | N/A | Full GUI | ✅ |
| **Cursor/Windsurf** | IDE + AI | Per-workspace | IDE-integrated | ❌ (cloud) |
| **Sourcegraph** | Code search | Multi-repo | Full web UI | ❌ (cloud) |
| **OpenCtx** | Context providers | Multi-project | IDE-integrated | ✅ |
| **This Proposal** | RAG + Trace | Multi-project | Full dashboard | ✅ |

### Differentiation
- **vs Ollama:** This is RAG/indexing, not LLM serving (but uses Ollama)
- **vs LM Studio:** This is code-focused, not general chat
- **vs Sourcegraph:** Local-first, no cloud, includes trace index
- **vs OpenCtx:** Standalone app with dashboard, not just IDE plugin

---

## MVP Scope (4-6 weeks)

### Phase 1: Core Daemon (Week 1-2)
- [ ] Project registry (SQLite)
- [ ] CLI: `serve`, `add`, `list`, `remove`, `build`, `status`
- [ ] HTTP API: `/projects/*`, `/projects/{id}/build|search|context`
- [ ] Reuse existing code_index core

### Phase 2: Dashboard (Week 3-4)
- [ ] React app with project tabs
- [ ] Status view per project
- [ ] Search interface
- [ ] Settings panel

### Phase 3: File Watching + Auto-Rebuild (Week 5)
- [ ] fsnotify integration
- [ ] Debounced incremental builds
- [ ] Staleness indicators in UI

### Phase 4: MCP Integration (Week 6)
- [ ] `codebase-rag mcp --project <id>` mode
- [ ] `--auto` project detection
- [ ] Windsurf config generator

### Post-MVP
- [ ] Trace index integration
- [ ] CLaRa compression toggle
- [ ] Export AGENTS.md
- [ ] Tauri wrapper (native app)
- [ ] Cross-project search (opt-in)

---

## Recommendation

### Is this the best plan?

**For power users managing multiple codebases: Yes.**

The standalone app approach offers:
- **Operational simplicity:** One daemon, one dashboard, one config
- **Resource efficiency:** Shared LLM connections, single memory footprint
- **Better UX:** Unified view of all projects, no port juggling
- **Extensibility:** Easier to add features (cross-project search, LLM coordination)

**For single-project or team workflows: Consider hybrid mode.**

Some projects benefit from embedded indexes (git-tracked, CI/CD friendly).

### Improvements to Consider

1. **Hybrid mode from day one** — Support both standalone and embedded indexes
2. **Project auto-detection** — Scan common locations, suggest projects to add
3. **IDE deep integration** — VS Code extension that talks to daemon
4. **Export/Import** — Allow index snapshots for portability
5. **Remote mode** — Optional: run daemon on a powerful machine, access from laptop

### Next Steps

If proceeding:
1. Rename project: `codebase-rag` or `code-rag` or `devrag`?
2. Decide on hybrid mode support
3. Decide on native wrapper priority (Tauri vs web-only MVP)
4. Create new repo or keep in LinuxBrain for now?

---

## Related Documents

- `AI_INFRASTRUCTURE_RESEARCH.md` — LLM stack details
- `TRACE_INDEX_RESEARCH.md` — Trace index design
- `IMPLEMENTATION.md` — Current code_index status
