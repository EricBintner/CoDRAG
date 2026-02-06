# Getting Started with CoDRAG

CoDRAG is a local-first semantic code search and context assembly tool that helps AI coding assistants understand your codebase.

## Prerequisites

- **Python 3.10+**
- **Ollama** running locally with an embedding model (e.g., `nomic-embed-text`)

## Installation

### 1. Install Ollama

```bash
# macOS
brew install ollama

# Linux
curl -fsSL https://ollama.com/install.sh | sh
```

### 2. Pull an Embedding Model

```bash
ollama pull nomic-embed-text
```

### 3. Install CoDRAG

```bash
pip install codrag
```

Or install from source:

```bash
git clone https://github.com/codrag/codrag.git
cd codrag
pip install -e ".[dev]"
```

## Quick Start

### Start the Daemon

```bash
codrag serve
```

This starts the CoDRAG daemon at `http://127.0.0.1:8400`.

### Add Your First Project

```bash
codrag add /path/to/your/repo --name "My Project"
```

### Build the Index

```bash
codrag build
```

This scans your repository, chunks the code, and creates semantic embeddings.

### Search Your Code

```bash
codrag search "how does authentication work?"
```

### Get Context for an LLM

```bash
codrag context "implement a new API endpoint" --max-chars 8000
```

## Using with AI Assistants

### MCP Integration (Recommended)

CoDRAG provides an MCP server that integrates with compatible AI assistants:

```bash
codrag mcp
```

See [MCP_ONBOARDING.md](./MCP_ONBOARDING.md) for detailed setup instructions.

### Manual Context Injection

For assistants without MCP support, use the CLI to get context:

```bash
# Get context and copy to clipboard (macOS)
codrag context "your question here" --raw | pbcopy
```

## Project Configuration

### File Filtering

Control which files are indexed:

```bash
# Include patterns (default: common code extensions)
codrag config set include_globs '["**/*.py", "**/*.ts", "**/*.md"]'

# Exclude patterns (default: .git, node_modules, etc.)
codrag config set exclude_globs '["**/node_modules/**", "**/.venv/**"]'
```

### Primer Files

Create an `AGENTS.md` file in your repository root to provide project context that's always prioritized in search results:

```markdown
# Project Context

## Tech Stack
- Python 3.10+ with FastAPI
- React 18 with TypeScript

## Key Conventions
- Use type hints everywhere
- Follow PEP 8 style guide
```

## Common Commands

| Command | Description |
|---------|-------------|
| `codrag serve` | Start the daemon |
| `codrag add <path>` | Register a project |
| `codrag build` | Build/rebuild the index |
| `codrag search <query>` | Search for code |
| `codrag context <query>` | Get assembled context |
| `codrag status` | Check project status |
| `codrag watch start` | Enable auto-rebuild on file changes |

## Dashboard (Optional)

CoDRAG includes a web dashboard for visual project management:

```bash
codrag serve --dashboard
```

Open `http://127.0.0.1:8400` in your browser.

## Troubleshooting

### Ollama Connection Failed

```
Error: OLLAMA_UNAVAILABLE
```

**Solution:** Ensure Ollama is running:
```bash
ollama serve
```

### Index Not Built

```
Error: INDEX_NOT_BUILT
```

**Solution:** Build the index first:
```bash
codrag build
```

### Large Repository Performance

For repositories with many files:

1. Increase `max_file_bytes` if needed:
   ```bash
   codrag config set max_file_bytes 500000
   ```

2. Exclude large directories:
   ```bash
   codrag config set exclude_globs '["**/vendor/**", "**/dist/**"]'
   ```

3. Use selective roots:
   ```bash
   codrag build --roots src,lib
   ```

## Next Steps

- [MCP Onboarding](./MCP_ONBOARDING.md) — Set up AI assistant integration
- [API Reference](./API.md) — HTTP API documentation
- [Error Codes](./ERROR_CODES.md) — Error handling reference
- [Budgets Policy](./BUDGETS_POLICY.md) — Understanding limits and defaults

## Getting Help

- **Issues:** [GitHub Issues](https://github.com/codrag/codrag/issues)
- **Discussions:** [GitHub Discussions](https://github.com/codrag/codrag/discussions)
