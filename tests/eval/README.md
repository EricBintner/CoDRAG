# Gold Query Evaluation

This module provides a framework for evaluating CoDRAG search quality using curated "gold" queries.

## Quick Start

```bash
# Run all gold queries against CoDRAG itself
python -m tests.eval.eval_runner --repo /path/to/codrag

# Run specific query
python -m tests.eval.eval_runner --repo /path/to/codrag --query gq-001

# Verbose output
python -m tests.eval.eval_runner --repo /path/to/codrag -v
```

## Gold Queries

Gold queries are defined in `gold_queries.json`. Each query specifies:

| Field | Description |
|-------|-------------|
| `id` | Unique identifier (e.g., `gq-001`) |
| `query` | Natural language search query |
| `expected_files` | Files that should appear in top-k results |
| `expected_keywords` | Keywords that should appear in result content |
| `category` | Query category (core, api, features, etc.) |
| `difficulty` | easy, medium, or hard |

## Scoring

Each query is scored based on:
- **File hits**: Expected files found in top-k results
- **Keyword hits**: Expected keywords found in result content

Score = (file_hits + keyword_hits) / (expected_files + expected_keywords)

A query **passes** if score >= 50%.

## Adding New Queries

Edit `gold_queries.json`:

```json
{
  "id": "gq-011",
  "query": "your natural language query",
  "expected_files": ["src/relevant/file.py"],
  "expected_keywords": ["function_name", "key_term"],
  "category": "features",
  "difficulty": "medium"
}
```

## Categories

- `core` — Fundamental indexing/search mechanics
- `api` — HTTP API endpoints and error handling
- `features` — User-facing features (primer, trace, watcher)
- `mcp` — MCP server and tool definitions
- `architecture` — System design and internal mechanics

## CI Integration

```bash
# In CI, exit code is non-zero if any query fails
python -m tests.eval.eval_runner --repo . || echo "Evaluation failed"
```
