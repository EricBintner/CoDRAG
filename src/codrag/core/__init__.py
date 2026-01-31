"""
CoDRAG Core Engine.

Contains the main components:
- registry: Project registry (SQLite)
- embedding: Embedding index
- trace: Trace index (symbol graph)
- watcher: File watcher for auto-rebuild
- llm: LLM coordinator (Ollama, CLaRa)
"""
