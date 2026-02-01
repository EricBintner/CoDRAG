from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

from .repo_profile import DEFAULT_ROLE_WEIGHTS, profile_repo

DEFAULT_POLICY_FILENAME = "repo_policy.json"


def policy_path_for_index(index_dir: Path) -> Path:
    return Path(index_dir) / DEFAULT_POLICY_FILENAME


def load_repo_policy(path: Path) -> Optional[Dict[str, Any]]:
    try:
        if not path.exists():
            return None
        with open(path, "r") as f:
            data = json.load(f)
        if not isinstance(data, dict):
            return None
        return data
    except Exception:
        return None


def write_repo_policy(path: Path, policy: Dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w") as f:
        json.dump(policy, f, indent=2)


def _normalize_globs(v: Any) -> List[str]:
    if not isinstance(v, list):
        return []
    out: List[str] = []
    for x in v:
        if isinstance(x, str) and x.strip():
            out.append(x)
    return out


def _normalize_role_weights(v: Any) -> Dict[str, float]:
    if not isinstance(v, dict):
        return dict(DEFAULT_ROLE_WEIGHTS)

    out: Dict[str, float] = {}
    for k, val in v.items():
        if not isinstance(k, str) or not k:
            continue
        try:
            out[k] = float(val)
        except (TypeError, ValueError):
            continue

    return out or dict(DEFAULT_ROLE_WEIGHTS)


def policy_from_profile(profile: Dict[str, Any], repo_root: Path) -> Dict[str, Any]:
    rec = profile.get("recommended") or {}

    return {
        "version": "1.0",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "repo_root": str(repo_root.resolve()),
        "include_globs": _normalize_globs(rec.get("include_globs")),
        "exclude_globs": _normalize_globs(rec.get("exclude_globs")),
        "role_weights": _normalize_role_weights(rec.get("role_weights")),
        "path_roles": profile.get("path_roles") or [],
        "detected_languages": profile.get("detected_languages") or [],
        "marker_files": profile.get("marker_files") or [],
    }


def ensure_repo_policy(index_dir: Path, repo_root: Path, force: bool = False) -> Dict[str, Any]:
    index_dir = Path(index_dir)
    repo_root = Path(repo_root).resolve()

    path = policy_path_for_index(index_dir)

    if not force:
        existing = load_repo_policy(path)
        if existing and str(existing.get("repo_root") or "") == str(repo_root):
            existing["include_globs"] = _normalize_globs(existing.get("include_globs"))
            existing["exclude_globs"] = _normalize_globs(existing.get("exclude_globs"))
            existing["role_weights"] = _normalize_role_weights(existing.get("role_weights"))
            return existing

    profile = profile_repo(repo_root)
    policy = policy_from_profile(profile, repo_root=repo_root)
    write_repo_policy(path, policy)
    return policy
