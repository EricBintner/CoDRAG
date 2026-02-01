"""
Chunking strategies for CoDRAG.

Provides heading-based markdown chunking and size-based code chunking.
"""

from __future__ import annotations

import hashlib
import re
from dataclasses import dataclass, field
from typing import Any, Dict, Generator, List, Optional, Tuple


@dataclass
class Chunk:
    """A document chunk with content and metadata."""
    chunk_id: str
    content: str
    metadata: Dict[str, Any] = field(default_factory=dict)


def _iter_markdown_sections(text: str) -> Generator[Tuple[List[str], str], None, None]:
    """
    Iterate over markdown sections, yielding (headings_stack, section_text).
    
    Headings stack tracks the current heading hierarchy.
    """
    lines = text.split("\n")
    headings: List[str] = []
    current_lines: List[str] = []

    heading_re = re.compile(r"^(#{1,6})\s+(.*)$")

    for line in lines:
        m = heading_re.match(line)
        if m:
            if current_lines:
                yield list(headings), "\n".join(current_lines).strip()
                current_lines = []

            level = len(m.group(1))
            title = m.group(2).strip()

            while len(headings) >= level:
                headings.pop()
            headings.append(title)
        else:
            current_lines.append(line)

    if current_lines:
        yield list(headings), "\n".join(current_lines).strip()


def _split_long_text(text: str, max_chars: int) -> List[str]:
    """Split long text into chunks at paragraph boundaries."""
    if len(text) <= max_chars:
        return [text]

    paragraphs = re.split(r"\n\n+", text)
    chunks: List[str] = []
    current: List[str] = []
    current_len = 0

    for para in paragraphs:
        para_len = len(para)
        if current_len + para_len + 2 > max_chars and current:
            chunks.append("\n\n".join(current))
            current = []
            current_len = 0

        if para_len > max_chars:
            if current:
                chunks.append("\n\n".join(current))
                current = []
                current_len = 0
            for i in range(0, para_len, max_chars):
                chunks.append(para[i : i + max_chars])
        else:
            current.append(para)
            current_len += para_len + 2

    if current:
        chunks.append("\n\n".join(current))

    return chunks


def chunk_markdown(
    text: str,
    source_path: str,
    xref_id: Optional[str] = None,
    name: Optional[str] = None,
    max_chars: int = 1800,
    min_chars: int = 350,
) -> List[Chunk]:
    """
    Chunk markdown text by headings with size limits.

    Args:
        text: Raw markdown content
        source_path: Path to the source file (for metadata)
        xref_id: Optional cross-reference ID
        name: Optional document name
        max_chars: Maximum chunk size
        min_chars: Minimum chunk size (smaller sections are merged)

    Returns:
        List of Chunk objects
    """
    parts: List[Chunk] = []

    def make_meta(headings: List[str]) -> Dict[str, Any]:
        return {
            "source_path": source_path,
            "xref_id": xref_id or "",
            "name": name or "",
            "section": " > ".join(headings) if headings else "",
        }

    def emit(content: str, meta: Dict[str, Any], idx: int) -> None:
        content = content.strip()
        if not content:
            return

        id_src = f"{source_path}:{meta.get('section', '')}:{idx}"
        chunk_id = hashlib.sha256(id_src.encode()).hexdigest()[:16]

        parts.append(Chunk(chunk_id=chunk_id, content=content, metadata=dict(meta)))

    pending: List[str] = []
    pending_meta: Dict[str, Any] = {}
    idx = 0

    for headings, section_text in _iter_markdown_sections(text):
        if not section_text:
            continue

        section_meta = make_meta(headings)

        if pending:
            candidate = "\n\n".join(pending + [section_text])
            if len(candidate) <= max_chars:
                pending.append(section_text)
                pending_meta = section_meta
                continue

            combined = "\n\n".join(pending).strip()
            if combined:
                emit(combined, pending_meta or section_meta, idx)
                idx += 1
            pending = []
            pending_meta = {}

        if len(section_text) < min_chars:
            pending = [section_text]
            pending_meta = section_meta
            continue

        if len(section_text) <= max_chars:
            emit(section_text, section_meta, idx)
            idx += 1
            continue

        for part in _split_long_text(section_text, max_chars):
            emit(part, section_meta, idx)
            idx += 1

    if pending:
        combined = "\n\n".join(pending).strip()
        if combined:
            emit(combined, pending_meta, idx)

    return parts


def chunk_code(
    text: str,
    source_path: str,
    max_chars: int = 2000,
    overlap_chars: int = 200,
) -> List[Chunk]:
    """
    Chunk code files by size with overlap.

    Args:
        text: Raw code content
        source_path: Path to the source file
        max_chars: Maximum chunk size
        overlap_chars: Number of characters to overlap between chunks

    Returns:
        List of Chunk objects
    """
    if len(text) <= max_chars:
        chunk_id = hashlib.sha256(f"{source_path}:0".encode()).hexdigest()[:16]
        return [
            Chunk(
                chunk_id=chunk_id,
                content=text,
                metadata={"source_path": source_path, "chunk_index": 0},
            )
        ]

    chunks: List[Chunk] = []
    start = 0
    idx = 0
    step = max_chars - overlap_chars

    while start < len(text):
        end = min(start + max_chars, len(text))
        chunk_text = text[start:end]

        chunk_id = hashlib.sha256(f"{source_path}:{idx}".encode()).hexdigest()[:16]
        chunks.append(
            Chunk(
                chunk_id=chunk_id,
                content=chunk_text,
                metadata={"source_path": source_path, "chunk_index": idx},
            )
        )

        start += step
        idx += 1

    return chunks
