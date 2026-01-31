# Contributing to CoDRAG

Thank you for your interest in contributing to CoDRAG!

## Development Setup

### Prerequisites

- Python 3.11+
- Node.js 18+ (for dashboard)
- Ollama (for embeddings)

### Setup

```bash
# Clone the repo
git clone https://github.com/anthropics/CoDRAG.git
cd CoDRAG

# Create virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install in development mode
pip install -e ".[dev]"

# Install pre-commit hooks
pre-commit install

# Install dashboard dependencies
cd dashboard
npm install
cd ..
```

### Running in Development

```bash
# Terminal 1: Backend
source .venv/bin/activate
uvicorn codrag.server:app --reload --port 8400

# Terminal 2: Dashboard (once created)
cd dashboard
npm run dev
```

### Running Tests

```bash
# Python tests
pytest

# With coverage
pytest --cov=codrag --cov-report=html

# Type checking
mypy src/codrag

# Linting
ruff check src/codrag
ruff format src/codrag
```

## Project Structure

```
CoDRAG/
├── src/codrag/           # Python package
│   ├── cli.py            # CLI entry point
│   ├── server.py         # FastAPI app
│   ├── core/             # Core engine
│   └── api/              # API routes
├── dashboard/            # React dashboard
├── docs/                 # Documentation
├── tests/                # Test suite
└── pyproject.toml        # Python project config
```

## Code Style

### Python
- Follow PEP 8
- Use type hints for all function signatures
- Docstrings for all public functions/classes
- Run `ruff format` before committing

### TypeScript (Dashboard)
- Use TypeScript strict mode
- Functional components with hooks
- Run `npm run lint` before committing

## Pull Request Process

1. Create a feature branch from `main`
2. Make your changes
3. Ensure tests pass
4. Update documentation if needed
5. Submit PR with clear description

## Architecture Decisions

Major architectural decisions are documented in `docs/DECISIONS.md`. Please review before proposing significant changes.

## Questions?

Open an issue for discussion before starting major work.
