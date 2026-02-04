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

from .embedder import Embedder, OllamaEmbedder, FakeEmbedder, EmbeddingResult
from .chunking import Chunk, chunk_markdown, chunk_code
from .index import CodeIndex, SearchResult
from .trace import TraceBuilder, TraceIndex, TraceNode, TraceEdge, build_trace

__all__ = [
    "CodeIndex",
    "SearchResult",
    "Embedder",
    "OllamaEmbedder",
    "FakeEmbedder",
    "EmbeddingResult",
    "Chunk",
    "chunk_markdown",
    "chunk_code",
    "TraceBuilder",
    "TraceIndex",
    "TraceNode",
    "TraceEdge",
    "build_trace",
]
