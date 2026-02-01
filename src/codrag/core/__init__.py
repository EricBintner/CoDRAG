"""
CoDRAG Core Engine.

Contains the main components:
- CodeIndex: Hybrid semantic + keyword search index
- Embedder: Embedding abstraction (OllamaEmbedder)
- Chunking: Document chunking strategies

TODO:
- registry: Project registry (SQLite)
- trace: Trace index (symbol graph)
- watcher: File watcher for auto-rebuild
- llm: LLM coordinator (Ollama, CLaRa)
"""

from .embedder import Embedder, OllamaEmbedder, EmbeddingResult
from .chunking import Chunk, chunk_markdown, chunk_code
from .index import CodeIndex, SearchResult

__all__ = [
    "CodeIndex",
    "SearchResult",
    "Embedder",
    "OllamaEmbedder",
    "EmbeddingResult",
    "Chunk",
    "chunk_markdown",
    "chunk_code",
]
