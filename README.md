# CoDRAG

**Code Documentation and RAG** — A standalone, multi-project semantic search and codebase intelligence platform.

> *Like Ollama for code understanding: one daemon, multiple projects, shared AI resources.*

---

## Vision

CoDRAG is a **local-first, team-ready** application that provides:

- **Semantic code search** across multiple codebases simultaneously
- **Trace indexing** for structural understanding (symbols, imports, call graphs)
- **LLM augmentation** for intelligent summaries and context assembly
- **Unified dashboard** with project tabs, search, and visualization
- **MCP integration** for IDE tools (Windsurf, Cursor, VS Code)

### Why CoDRAG?

| Problem | CoDRAG Solution |
|---------|-----------------|
| "I have 5 repos, each needs its own RAG setup" | Single daemon manages all projects |
| "Ollama is running but each tool reconnects" | Shared LLM connection pool |
| "I can't remember which port is which project" | One port (8400), project tabs in UI |
| "New team members can't find anything" | Indexed codebase with semantic search |
| "AI tools don't understand my code structure" | Trace index + AGENTS.md generation |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CoDRAG                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│  Dashboard (React/Vite → Tauri for MVP)                                     │
│  ├── Project Tabs (LinuxBrain, HalleyApp, Website, ...)                     │
│  ├── Search / Context / Trace views                                         │
│  └── Settings / LLM Status                                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│  HTTP API (FastAPI @ :8400)                                                 │
│  ├── /projects/*           Project management                               │
│  ├── /projects/{id}/build  Index building                                   │
│  ├── /projects/{id}/search Semantic search                                  │
│  ├── /projects/{id}/trace  Structural queries                               │
│  └── /llm/*                LLM service status                               │
├─────────────────────────────────────────────────────────────────────────────┤
│  Core Engine                                                                │
│  ├── ProjectRegistry       SQLite-backed project config                     │
│  ├── EmbeddingIndex        Semantic vector search (per project)             │
│  ├── TraceIndex            Symbol graph + import edges                      │
│  ├── FileWatcher           Auto-rebuild on changes                          │
│  └── LLMCoordinator        Ollama/CLaRa connection management               │
├─────────────────────────────────────────────────────────────────────────────┤
│  CLI                                                                        │
│  codrag serve | add | build | search | ui | mcp                             │
└─────────────────────────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
    ┌─────────┐         ┌─────────┐         ┌─────────┐
    │ Ollama  │         │  CLaRa  │         │ Project │
    │ :11434  │         │  :8765  │         │  Dirs   │
    └─────────┘         └─────────┘         └─────────┘
```

---

## Key Features

### Multi-Project Management
- Add any number of local codebases
- Each project has isolated index data
- Switch between projects via tabs or CLI
- Optional: cross-project search (enterprise)

### Hybrid Index Mode
- **Standalone mode** (default): Index stored in `~/.local/share/codrag/projects/`
- **Embedded mode** (team): Index stored in project `.codrag/` directory
- Teams can commit embedded indexes to git for instant onboarding

### Trace Index
Beyond keyword/semantic search, CoDRAG builds a **structural graph**:
- **Nodes:** Files, symbols, classes, functions, endpoints, docs sections
- **Edges:** Imports, calls, implements, documented-by
- Query: "What calls `generate_image()`?" or "What does this module depend on?"

### LLM Integration
- **Embeddings:** Ollama (`nomic-embed-text` or custom)
- **Compression:** CLaRa (optional, for large context assembly)
- **Augmentation:** Mistral/Llama (optional, for summaries and tagging)
- Shared connection pool across all projects

### AGENTS.md Generation
Auto-generate [AGENTS.md](https://agents.md/) files from trace index:
- Project structure overview
- Key modules and their purposes
- Build/test commands
- API endpoints

---

## Installation

### Prerequisites
- Python 3.11+
- Node.js 18+ (for dashboard)
- Ollama (for embeddings)

### Quick Start

```bash
# Clone the repo
git clone https://github.com/anthropics/CoDRAG.git
cd CoDRAG

# Install Python dependencies
python3 -m venv .venv
source .venv/bin/activate
pip install -e .

# Install dashboard dependencies
cd dashboard
npm install
cd ..

# Start the daemon
codrag serve

# Add a project
codrag add /path/to/your/project --name "MyProject"

# Open dashboard
codrag ui
```

### With Ollama

```bash
# Install Ollama (if not installed)
curl -fsSL https://ollama.com/install.sh | sh

# Pull embedding model
ollama pull nomic-embed-text

# CoDRAG will auto-detect Ollama at localhost:11434
```

---

## CLI Reference

```bash
# Daemon
codrag serve                      # Start daemon (background)
codrag serve --foreground         # Start in foreground
codrag stop                       # Stop daemon

# Projects
codrag add <path>                 # Add project (auto-detect name)
codrag add <path> --name "Name"   # Add with custom name
codrag add <path> --embedded      # Store index in project dir
codrag list                       # List all projects
codrag remove <project-id>        # Remove project
codrag remove <id> --purge        # Remove + delete index

# Building
codrag build <project-id>         # Full rebuild
codrag build --all                # Rebuild all projects
codrag status                     # Show all project status
codrag status <project-id>        # Show specific project

# Querying
codrag search <project-id> "query"
codrag context <project-id> "query" --max-chars 8000
codrag trace <project-id> "symbol_name"

# Dashboard
codrag ui                         # Open dashboard in browser
codrag ui --port 8401             # Custom port

# MCP (for IDE integration)
codrag mcp --project <project-id> # MCP server for specific project
codrag mcp --auto                 # Auto-detect project from cwd

# Utilities
codrag export-agents <project-id> # Generate AGENTS.md
codrag config                     # Show/edit global config
```

---

## Configuration

### Global Config

```yaml
# ~/.config/codrag/config.yaml

# LLM Services
ollama:
  url: http://localhost:11434
  embedding_model: nomic-embed-text
  augmentation_model: mistral  # optional
  
clara:
  url: http://localhost:8765
  enabled: false  # optional compression

# Index Settings
index:
  data_dir: ~/.local/share/codrag
  max_size_gb: 10

# Auto-Rebuild
watch:
  enabled: true
  debounce_ms: 5000

# Server
server:
  port: 8400
  host: 0.0.0.0  # for team access
```

### Per-Project Config

```yaml
# Set via CLI or dashboard
project:
  name: "LinuxBrain"
  path: /Volumes/4TB-BAD/HumanAI/LinuxBrain
  mode: standalone  # or "embedded"
  
  include:
    - "**/*.py"
    - "**/*.md"
    - "**/*.ts"
    - "**/*.tsx"
    
  exclude:
    - "**/node_modules/**"
    - "**/.venv/**"
    - "**/dist/**"
    - "**/__pycache__/**"
    
  trace:
    enabled: true
    languages: [python, typescript]
    
  auto_rebuild: true
```

---

## API Reference

### Projects

```
GET  /projects                    List all projects
POST /projects                    Add new project
GET  /projects/{id}               Get project details
PUT  /projects/{id}               Update project config
DELETE /projects/{id}             Remove project
```

### Indexing

```
GET  /projects/{id}/status        Index status
POST /projects/{id}/build         Trigger build
GET  /projects/{id}/build/status  Build progress
```

### Search & Context

```
POST /projects/{id}/search        Semantic search
POST /projects/{id}/context       Assemble context for LLM
```

### Trace

```
GET  /projects/{id}/trace/status  Trace index status
POST /projects/{id}/trace/search  Symbol search
POST /projects/{id}/trace/node    Get node details
POST /projects/{id}/trace/neighbors  Graph expansion
```

### LLM

```
GET  /llm/status                  Ollama/CLaRa connection status
POST /llm/test                    Test connections
```

---

## Team / Enterprise Features

### Embedded Mode for Teams

```bash
# Team lead sets up project with embedded index
codrag add /path/to/team-project --embedded

# Index lives in /path/to/team-project/.codrag/
# Commit to git:
git add .codrag/
git commit -m "Add CoDRAG index for instant search"

# Team members clone and have instant search
git clone <repo>
codrag add /path/to/repo --embedded  # Recognizes existing index
```

### Network Mode (Enterprise)

```bash
# Run CoDRAG server on team machine
codrag serve --host 0.0.0.0 --port 8400

# Team members connect remotely
codrag config set server.remote_url http://team-server:8400

# All search/context requests go to shared server
```

### Access Control (Roadmap)

- Project-level permissions
- API key authentication
- Audit logging

---

## Development

### Project Structure

```
CoDRAG/
├── src/
│   └── codrag/
│       ├── __init__.py
│       ├── cli.py              # CLI entry point
│       ├── server.py           # FastAPI app
│       ├── core/
│       │   ├── registry.py     # Project registry (SQLite)
│       │   ├── embedding.py    # Embedding index
│       │   ├── trace.py        # Trace index
│       │   ├── watcher.py      # File watcher
│       │   └── llm.py          # LLM coordinator
│       └── api/
│           ├── projects.py     # /projects routes
│           ├── search.py       # /search routes
│           ├── trace.py        # /trace routes
│           └── llm.py          # /llm routes
├── dashboard/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── components/
│   │   └── pages/
│   ├── package.json
│   └── vite.config.ts
├── docs/
│   ├── ARCHITECTURE.md
│   ├── ROADMAP.md
│   └── API.md
├── tests/
├── pyproject.toml
└── README.md
```

### Running in Development

```bash
# Terminal 1: Backend
source .venv/bin/activate
uvicorn codrag.server:app --reload --port 8400

# Terminal 2: Dashboard
cd dashboard
npm run dev

# Open http://localhost:5173 (Vite dev server proxies to :8400)
```

### Testing

```bash
pytest tests/
npm run test --prefix dashboard
```

---

## Roadmap

See [ROADMAP.md](docs/ROADMAP.md) for detailed phases.

| Phase | Focus | Timeline |
|-------|-------|----------|
| **0: Foundation** | Core engine, CLI, basic API | Week 1-2 |
| **1: Dashboard** | React UI, project tabs, search | Week 3-4 |
| **2: Auto-Rebuild** | File watching, incremental builds | Week 5 |
| **3: Trace Index** | Symbol extraction, graph queries | Week 6-7 |
| **4: MCP Integration** | IDE tool support | Week 8 |
| **5: Team Features** | Embedded mode, network mode | Week 9-10 |
| **MVP: Tauri** | Native app wrapper | Week 11-12 |

---

## Related Projects

- **[Ollama](https://ollama.com/)** — Local LLM serving (CoDRAG uses for embeddings)
- **[CLaRa](../CLaRa-Remembers-It-All/)** — Context compression (optional integration)
- **[LinuxBrain](../LinuxBrain/)** — Test project / Halley codebase

---

## License

MIT License — See [LICENSE](LICENSE) for details.

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.
