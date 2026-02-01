"""
Core CoDRAG Index implementation.

Provides hybrid semantic + keyword search over documents.
"""

from __future__ import annotations

import hashlib
import json
import logging
import re
import sqlite3
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Callable, Dict, List, Optional

import numpy as np

from .chunking import Chunk, chunk_code, chunk_markdown
from .embedder import Embedder
from .repo_profile import DEFAULT_ROLE_WEIGHTS, classify_rel_path, profile_repo

logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class SearchResult:
    """A search result with document and score."""
    doc: Dict[str, Any]
    score: float


class CodeIndex:
    """
    A hybrid semantic + keyword search index for code and documentation.

    On-disk format:
    - documents.json: List of document chunks with metadata
    - embeddings.npy: Float32 embedding vectors (N x dim)
    - manifest.json: Index metadata (model, timestamps, config)
    - fts.sqlite3: Optional SQLite FTS5 keyword index
    """

    def __init__(
        self,
        index_dir: Path | str,
        embedder: Embedder,
    ):
        """
        Initialize a CodeIndex.

        Args:
            index_dir: Directory to store index files
            embedder: Embedder instance for generating vectors
        """
        self.index_dir = Path(index_dir)
        self.embedder = embedder

        self.documents_path = self.index_dir / "documents.json"
        self.embeddings_path = self.index_dir / "embeddings.npy"
        self.manifest_path = self.index_dir / "manifest.json"
        self.fts_path = self.index_dir / "fts.sqlite3"

        self._documents: Optional[List[Dict[str, Any]]] = None
        self._embeddings: Optional[np.ndarray] = None
        self._manifest: Dict[str, Any] = {}

        self._load()

    def _load(self) -> None:
        """Load existing index from disk."""
        if not self.documents_path.exists() or not self.embeddings_path.exists():
            self._documents = None
            self._embeddings = None
            self._manifest = {}
            return

        try:
            with open(self.documents_path, "r") as f:
                self._documents = json.load(f)
            self._embeddings = np.load(self.embeddings_path)
            if self.manifest_path.exists():
                with open(self.manifest_path, "r") as f:
                    self._manifest = json.load(f) or {}
            else:
                self._manifest = {}
        except Exception as e:
            logger.warning(f"Failed to load index: {e}")
            self._documents = None
            self._embeddings = None
            self._manifest = {}

    def is_loaded(self) -> bool:
        """Check if an index is loaded and ready for search."""
        return bool(self._documents) and self._embeddings is not None

    def stats(self) -> Dict[str, Any]:
        """Get index statistics."""
        if not self.is_loaded():
            return {
                "loaded": False,
                "index_dir": str(self.index_dir),
            }

        return {
            "loaded": True,
            "index_dir": str(self.index_dir),
            "model": self._manifest.get("model", "unknown"),
            "built_at": self._manifest.get("built_at"),
            "total_documents": len(self._documents or []),
            "embedding_dim": int(self._embeddings.shape[1]) if self._embeddings is not None else 0,
            "config": self._manifest.get("config", {}),
        }

    def build(
        self,
        repo_root: Path | str,
        include_globs: Optional[List[str]] = None,
        exclude_globs: Optional[List[str]] = None,
        max_file_bytes: int = 500_000,
        progress_callback: Optional[Callable[[str, int, int], None]] = None,
    ) -> Dict[str, Any]:
        """
        Build the index from a repository.

        Args:
            repo_root: Root directory to index
            include_globs: Glob patterns for files to include (default: ["**/*.md", "**/*.py"])
            exclude_globs: Glob patterns for files to exclude
            max_file_bytes: Skip files larger than this
            progress_callback: Optional callback(file_path, current, total)

        Returns:
            Build metadata
        """
        repo_root = Path(repo_root).resolve()

        profile: Optional[Dict[str, Any]] = None
        if not include_globs or not exclude_globs:
            profile = profile_repo(repo_root)

        if not include_globs:
            include_globs = list((profile or {}).get("recommended", {}).get("include_globs") or [])
            if not include_globs:
                include_globs = ["**/*.md", "**/*.py"]

        if not exclude_globs:
            exclude_globs = list((profile or {}).get("recommended", {}).get("exclude_globs") or [])
            if not exclude_globs:
                exclude_globs = ["**/.git/**", "**/node_modules/**", "**/__pycache__/**", "**/.venv/**"]

        role_weights: Dict[str, float] = dict(DEFAULT_ROLE_WEIGHTS)
        if profile:
            rw = (profile.get("recommended") or {}).get("role_weights")
            if isinstance(rw, dict) and rw:
                role_weights = {str(k): float(v) for k, v in rw.items()}

        files: List[Path] = []
        for pat in include_globs:
            files.extend(repo_root.glob(pat))
        files = sorted(set(files))

        filtered_files: List[Path] = []
        for f in files:
            if not f.is_file():
                continue
            rel_path = str(f.relative_to(repo_root))
            if any(Path(rel_path).match(pat) for pat in exclude_globs):
                continue
            if f.stat().st_size > max_file_bytes:
                continue
            filtered_files.append(f)

        docs: List[Dict[str, Any]] = []
        vectors: List[List[float]] = []
        total_files = len(filtered_files)

        for i, file_path in enumerate(filtered_files):
            rel_path = str(file_path.relative_to(repo_root))
            role = classify_rel_path(rel_path)

            if progress_callback:
                progress_callback(rel_path, i + 1, total_files)

            try:
                raw = file_path.read_text(encoding="utf-8", errors="ignore")
            except Exception:
                continue

            file_hash = hashlib.sha256(raw.encode("utf-8")).hexdigest()[:16]

            if file_path.suffix.lower() in (".md", ".markdown"):
                chunks = chunk_markdown(raw, source_path=rel_path)
            else:
                chunks = chunk_code(raw, source_path=rel_path)

            for ch in chunks:
                text_for_embed = self._format_chunk_for_embedding(ch, file_hash)
                emb = self.embedder.embed(text_for_embed).vector

                doc = {
                    "id": ch.chunk_id,
                    "source_path": rel_path,
                    "file_hash": file_hash,
                    "role": role,
                    "section": ch.metadata.get("section", ""),
                    "content": ch.content,
                }
                docs.append(doc)
                vectors.append(emb)

        if not docs:
            raise RuntimeError("No documents indexed")

        embeddings = np.array(vectors, dtype=np.float32)

        self.index_dir.mkdir(parents=True, exist_ok=True)
        with open(self.documents_path, "w") as f:
            json.dump(docs, f)
        np.save(self.embeddings_path, embeddings)

        try:
            self._rebuild_fts(docs)
        except Exception as e:
            logger.warning(f"FTS rebuild failed (continuing without keyword index): {e}")

        manifest = {
            "version": "1.0",
            "built_at": datetime.now(timezone.utc).isoformat(),
            "model": getattr(self.embedder, "model", "unknown"),
            "count": len(docs),
            "embedding_dim": int(embeddings.shape[1]),
            "config": {
                "include_globs": include_globs,
                "exclude_globs": exclude_globs,
                "max_file_bytes": max_file_bytes,
                "role_weights": role_weights,
            },
        }
        with open(self.manifest_path, "w") as f:
            json.dump(manifest, f, indent=2)

        self._documents = docs
        self._embeddings = embeddings
        self._manifest = manifest

        return manifest

    def search(
        self,
        query: str,
        k: int = 8,
        min_score: float = 0.15,
    ) -> List[SearchResult]:
        """
        Search the index.

        Args:
            query: Search query
            k: Number of results to return
            min_score: Minimum similarity score

        Returns:
            List of SearchResult objects
        """
        if not self.is_loaded():
            return []

        qv = np.array(self.embedder.embed(query).vector, dtype=np.float32)
        qn = np.linalg.norm(qv)
        if qn == 0.0:
            return []

        emb = self._embeddings
        docs = self._documents
        if emb is None or docs is None:
            return []

        denom = np.linalg.norm(emb, axis=1) * qn
        denom = np.where(denom == 0.0, 1e-8, denom)
        sims = (emb @ qv) / denom

        sims = sims + self._keyword_boosts(query, docs)
        sims = sims + self._fts_boosts(query, docs, limit=max(10, k * 4))

        role_weights = (self._manifest.get("config") or {}).get("role_weights") or {}
        if isinstance(role_weights, dict) and role_weights:
            for i, d in enumerate(docs):
                role = str(d.get("role") or "")
                w = role_weights.get(role)
                if w is None:
                    continue
                try:
                    sims[i] = sims[i] * float(w)
                except (TypeError, ValueError):
                    continue

        top_idx = np.argsort(sims)[::-1]
        out: List[SearchResult] = []
        for idx in top_idx:
            score = float(sims[idx])
            if score < min_score:
                break
            out.append(SearchResult(doc=docs[int(idx)], score=score))
            if len(out) >= k:
                break

        return out

    def get_context(
        self,
        query: str,
        k: int = 5,
        max_chars: int = 6000,
        include_sources: bool = True,
        include_scores: bool = False,
        min_score: float = 0.15,
    ) -> str:
        results = self.search(query, k=k, min_score=min_score)
        if not results:
            return ""

        parts: List[str] = []
        total = 0

        for r in results:
            d = r.doc
            header_bits: List[str] = []

            if d.get("section"):
                header_bits.append(str(d.get("section") or ""))
            if include_sources and d.get("source_path"):
                header_bits.append(f"@{d.get('source_path')}")
            if include_scores:
                header_bits.append(f"score={r.score:.3f}")

            if header_bits:
                header = " | ".join(header_bits)
            else:
                header = str(d.get("source_path") or "")

            block = f"[{header}]\n{d.get('content', '')}"

            if total + len(block) > max_chars:
                remaining = max_chars - total
                if remaining > 200:
                    block = block[:remaining] + "..."
                else:
                    break

            parts.append(block)
            total += len(block)

        return "\n\n---\n\n".join(parts)

    def get_context_structured(
        self,
        query: str,
        k: int = 5,
        max_chars: int = 6000,
        min_score: float = 0.15,
    ) -> Dict[str, Any]:
        results = self.search(query, k=k, min_score=min_score)
        if not results:
            return {
                "context": "",
                "chunks": [],
                "total_chars": 0,
                "estimated_tokens": 0,
            }

        parts: List[str] = []
        chunks_meta: List[Dict[str, Any]] = []
        total = 0

        for r in results:
            d = r.doc
            header_bits: List[str] = []
            if d.get("section"):
                header_bits.append(str(d.get("section") or ""))
            if d.get("source_path"):
                header_bits.append(f"@{d.get('source_path')}")
            header = " | ".join(header_bits) if header_bits else str(d.get("source_path") or "")
            block = f"[{header}]\n{d.get('content', '')}"

            if total + len(block) > max_chars:
                remaining = max_chars - total
                if remaining > 200:
                    block = block[:remaining] + "..."
                    parts.append(block)
                    total += len(block)
                    chunks_meta.append(
                        {
                            "source_path": d.get("source_path", ""),
                            "section": d.get("section", ""),
                            "score": r.score,
                            "truncated": True,
                        }
                    )
                break

            parts.append(block)
            total += len(block)
            chunks_meta.append(
                {
                    "source_path": d.get("source_path", ""),
                    "section": d.get("section", ""),
                    "score": r.score,
                    "truncated": False,
                }
            )

        context_str = "\n\n---\n\n".join(parts)
        return {
            "context": context_str,
            "chunks": chunks_meta,
            "total_chars": total,
            "estimated_tokens": total // 4,
        }

    def get_chunk(self, chunk_id: str) -> Optional[Dict[str, Any]]:
        """Get a specific chunk by ID."""
        if not self._documents:
            return None
        for d in self._documents:
            if d.get("id") == chunk_id:
                return d
        return None

    def _format_chunk_for_embedding(self, chunk: Chunk, file_hash: str) -> str:
        """Format a chunk for embedding."""
        meta = chunk.metadata
        bits: List[str] = []
        if meta.get("name"):
            bits.append(f"Name: {meta['name']}")
        bits.append(f"Path: {meta.get('source_path', '')}")
        if meta.get("section"):
            bits.append(f"Section: {meta['section']}")
        bits.append(f"Hash: {file_hash}")
        bits.append("")
        bits.append(chunk.content)
        return "\n".join(bits)

    def _keyword_boosts(self, query: str, docs: List[Dict[str, Any]]) -> np.ndarray:
        """Compute keyword-based score boosts."""
        q = query.lower()
        tokens = set(re.findall(r"[a-zA-Z0-9_./-]{3,}", q))
        if not tokens:
            return np.zeros(len(docs), dtype=np.float32)

        boosts = np.zeros(len(docs), dtype=np.float32)
        for i, d in enumerate(docs):
            score = 0.0
            for field in ("source_path", "section"):
                v = str(d.get(field, "")).lower()
                if not v:
                    continue
                for t in tokens:
                    if t in v:
                        score += 0.03
            boosts[i] = min(0.25, score)
        return boosts

    def _ensure_fts_schema(self, conn: sqlite3.Connection) -> None:
        """Ensure the FTS5 table exists."""
        conn.execute(
            "CREATE VIRTUAL TABLE IF NOT EXISTS fts USING fts5("
            "chunk_id UNINDEXED, "
            "content, "
            "source_path, "
            "section"
            ")"
        )

    def _rebuild_fts(self, docs: List[Dict[str, Any]]) -> None:
        """Rebuild the FTS5 keyword index."""
        self.fts_path.parent.mkdir(parents=True, exist_ok=True)

        conn = sqlite3.connect(str(self.fts_path))
        try:
            self._ensure_fts_schema(conn)
            conn.execute("DELETE FROM fts")
            conn.execute("BEGIN")
            conn.executemany(
                "INSERT INTO fts(chunk_id, content, source_path, section) VALUES (?, ?, ?, ?)",
                [
                    (
                        str(d.get("id") or ""),
                        str(d.get("content") or ""),
                        str(d.get("source_path") or ""),
                        str(d.get("section") or ""),
                    )
                    for d in docs
                ],
            )
            conn.execute("COMMIT")
        finally:
            conn.close()

    def _fts_boosts(self, query: str, docs: List[Dict[str, Any]], limit: int) -> np.ndarray:
        """Compute FTS5-based score boosts."""
        if not self.fts_path.exists():
            return np.zeros(len(docs), dtype=np.float32)

        try:
            conn = sqlite3.connect(str(self.fts_path))
        except Exception:
            return np.zeros(len(docs), dtype=np.float32)

        try:
            self._ensure_fts_schema(conn)
            cur = conn.execute(
                "SELECT chunk_id, bm25(fts) AS rank FROM fts WHERE fts MATCH ? ORDER BY rank LIMIT ?",
                (query, int(limit)),
            )
            rows = cur.fetchall()
        except Exception:
            rows = []
        finally:
            conn.close()

        if not rows:
            return np.zeros(len(docs), dtype=np.float32)

        id_to_idx = {str(d.get("id")): i for i, d in enumerate(docs)}
        boosts = np.zeros(len(docs), dtype=np.float32)

        for chunk_id, rank in rows:
            i = id_to_idx.get(str(chunk_id))
            if i is None:
                continue
            r = float(rank) if rank is not None else 0.0
            r = max(0.0, r)
            boost = 0.35 / (1.0 + r)
            boosts[i] = max(boosts[i], float(boost))

        return boosts
