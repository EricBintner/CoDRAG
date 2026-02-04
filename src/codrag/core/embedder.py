"""
Embedder abstraction for CoDRAG.

Provides a base class and Ollama implementation for generating embeddings.
"""

from __future__ import annotations

import logging
import random
import time
from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import List, Optional

import requests

logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class EmbeddingResult:
    """Result of an embedding operation."""
    vector: List[float]
    model: str


class Embedder(ABC):
    """Abstract base class for embedding providers."""

    @abstractmethod
    def embed(self, text: str) -> EmbeddingResult:
        """Generate an embedding vector for the given text."""
        pass

    @abstractmethod
    def embed_batch(self, texts: List[str]) -> List[EmbeddingResult]:
        """Generate embeddings for multiple texts."""
        pass


class OllamaEmbedder(Embedder):
    """Ollama-based embedder using the /api/embeddings endpoint."""

    def __init__(
        self,
        model: str = "nomic-embed-text",
        base_url: str = "http://localhost:11434",
        timeout_s: int = 60,
        max_retries: int = 4,
        keep_alive: str = "10m",
    ):
        """
        Initialize the Ollama embedder.

        Args:
            model: Ollama embedding model name
            base_url: Ollama API base URL
            timeout_s: Request timeout in seconds
            max_retries: Number of retry attempts for transient failures
            keep_alive: How long to keep the model loaded (e.g., "10m", "1h")
        """
        self.model = model
        self.base_url = base_url.rstrip("/")
        self.timeout_s = timeout_s
        self.max_retries = max_retries
        self.keep_alive = keep_alive

    def embed(self, text: str) -> EmbeddingResult:
        """Generate an embedding for a single text."""
        payload = {
            "model": self.model,
            "prompt": text,
            "keep_alive": self.keep_alive,
        }

        last_err: Optional[Exception] = None
        for attempt in range(max(1, self.max_retries)):
            try:
                resp = requests.post(
                    f"{self.base_url}/api/embeddings",
                    json=payload,
                    timeout=self.timeout_s,
                )

                if resp.status_code >= 500:
                    raise requests.HTTPError(
                        f"{resp.status_code} Server Error for url: {resp.url}",
                        response=resp,
                    )

                resp.raise_for_status()
                data = resp.json() or {}
                emb = data.get("embedding")
                if not isinstance(emb, list) or not emb:
                    raise ValueError("Ollama embeddings response missing 'embedding'")
                return EmbeddingResult(
                    vector=[float(x) for x in emb],
                    model=data.get("model") or self.model,
                )
            except (requests.RequestException, ValueError) as e:
                last_err = e
                if attempt >= self.max_retries - 1:
                    break

                base_delay_s = 0.35 * (2**attempt)
                jitter_s = random.random() * 0.25
                time.sleep(base_delay_s + jitter_s)

        raise last_err or RuntimeError("Ollama embedding failed")

    def embed_batch(self, texts: List[str]) -> List[EmbeddingResult]:
        """Generate embeddings for multiple texts (sequential for now)."""
        return [self.embed(t) for t in texts]


class FakeEmbedder(Embedder):
    """
    Fake embedder for testing that generates deterministic pseudo-embeddings.
    
    Does NOT require Ollama or any external service.
    """

    def __init__(self, model: str = "fake-embed", dim: int = 384):
        self.model = model
        self.dim = dim

    def embed(self, text: str) -> EmbeddingResult:
        """Generate a deterministic embedding based on text hash."""
        # Use hash of text to seed random for reproducibility
        seed = hash(text) % (2**31)
        rng = random.Random(seed)
        vector = [rng.gauss(0, 1) for _ in range(self.dim)]
        # Normalize to unit length
        norm = sum(x * x for x in vector) ** 0.5
        vector = [x / norm for x in vector]
        return EmbeddingResult(vector=vector, model=self.model)

    def embed_batch(self, texts: List[str]) -> List[EmbeddingResult]:
        return [self.embed(t) for t in texts]
