import json
import sys
from pathlib import Path


def _read_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def _read_jsonl(path: Path) -> list[dict]:
    items: list[dict] = []
    for i, line in enumerate(path.read_text(encoding="utf-8").splitlines(), start=1):
        line = line.strip()
        if not line:
            continue
        try:
            items.append(json.loads(line))
        except json.JSONDecodeError as e:
            raise ValueError(f"Invalid JSON on {path.name}:{i}: {e}") from e
    return items


def main() -> int:
    if len(sys.argv) != 2:
        print("Usage: validate_trace.py /path/to/expected_trace")
        return 2

    root = Path(sys.argv[1])
    manifest_path = root / "trace_manifest.json"
    nodes_path = root / "trace_nodes.jsonl"
    edges_path = root / "trace_edges.jsonl"

    for p in (manifest_path, nodes_path, edges_path):
        if not p.exists():
            print(f"Missing required file: {p}")
            return 2

    manifest = _read_json(manifest_path)
    nodes = _read_jsonl(nodes_path)
    edges = _read_jsonl(edges_path)

    node_ids = {n.get("id") for n in nodes}
    if None in node_ids:
        print("One or more nodes missing required field: id")
        return 1

    if len(node_ids) != len(nodes):
        print("Duplicate node IDs detected")
        return 1

    for e in edges:
        if not e.get("id"):
            print("Edge missing required field: id")
            return 1
        if not e.get("kind"):
            print("Edge missing required field: kind")
            return 1
        if e.get("source") not in node_ids:
            print(f"Edge source not found in nodes: {e.get('source')}")
            return 1
        if e.get("target") not in node_ids:
            print(f"Edge target not found in nodes: {e.get('target')}")
            return 1
        if not isinstance(e.get("metadata"), dict):
            print("Edge missing required field: metadata (object)")
            return 1

    counts = manifest.get("counts", {})
    expected_nodes = counts.get("nodes")
    expected_edges = counts.get("edges")

    if expected_nodes is not None and expected_nodes != len(nodes):
        print(f"Manifest nodes count mismatch: {expected_nodes} != {len(nodes)}")
        return 1

    if expected_edges is not None and expected_edges != len(edges):
        print(f"Manifest edges count mismatch: {expected_edges} != {len(edges)}")
        return 1

    print("OK")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
