from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, List, Optional

from .ids import stable_sha256


TEAM_CONFIG_REL_PATH = Path(".codrag") / "team_config.json"


@dataclass(frozen=True)
class TeamConfig:
    format_version: int
    enforcement_mode: str
    include_globs: List[str]
    exclude_globs: List[str]
    trace_enabled_default: bool
    embedding_provider: Optional[str]
    embedding_model: Optional[str]
    config_hash: str


@dataclass(frozen=True)
class TeamConfigLoadResult:
    present: bool
    path: Optional[Path]
    config: Optional[TeamConfig]
    error: Optional[str]


def team_config_path(project_root: Path) -> Path:
    return Path(project_root).resolve() / TEAM_CONFIG_REL_PATH


def _normalize_globs(v: Any) -> List[str]:
    if not isinstance(v, list):
        return []
    out: List[str] = []
    for x in v:
        if isinstance(x, str):
            s = x.strip()
            if s:
                out.append(s)
    return sorted(set(out))


def _canonical_json_for_hash(obj: Dict[str, Any]) -> str:
    return json.dumps(obj, sort_keys=True, separators=(",", ":"), ensure_ascii=False)


def _semantic_subset(raw: Dict[str, Any]) -> Dict[str, Any]:
    enforcement = raw.get("enforcement")
    if not isinstance(enforcement, dict):
        enforcement = {}

    policy = raw.get("policy")
    if not isinstance(policy, dict):
        policy = {}

    features = raw.get("features")
    if not isinstance(features, dict):
        features = {}

    models = raw.get("models")
    if not isinstance(models, dict):
        models = {}

    trace_enabled_default = features.get("trace_enabled_default")
    if not isinstance(trace_enabled_default, bool):
        trace_enabled_default = False

    embedding_provider = models.get("embedding_provider")
    if not isinstance(embedding_provider, str) or not embedding_provider.strip():
        embedding_provider = None

    embedding_model = models.get("embedding_model")
    if not isinstance(embedding_model, str) or not embedding_model.strip():
        embedding_model = None

    return {
        "format_version": raw.get("format_version"),
        "enforcement": {"mode": enforcement.get("mode")},
        "policy": {
            "include_globs": _normalize_globs(policy.get("include_globs")),
            "exclude_globs": _normalize_globs(policy.get("exclude_globs")),
        },
        "features": {"trace_enabled_default": trace_enabled_default},
        "models": {"embedding_provider": embedding_provider, "embedding_model": embedding_model},
    }


def load_team_config(project_root: Path) -> TeamConfigLoadResult:
    path = team_config_path(project_root)
    if not path.exists():
        return TeamConfigLoadResult(present=False, path=None, config=None, error=None)

    try:
        raw = json.loads(path.read_text(encoding="utf-8"))
    except Exception as e:
        return TeamConfigLoadResult(present=True, path=path, config=None, error=f"Invalid JSON: {e}")

    if not isinstance(raw, dict):
        return TeamConfigLoadResult(present=True, path=path, config=None, error="team_config must be a JSON object")

    normalized = _semantic_subset(raw)

    fv = normalized.get("format_version")
    if not isinstance(fv, int):
        return TeamConfigLoadResult(present=True, path=path, config=None, error="format_version must be an integer")
    if fv != 1:
        return TeamConfigLoadResult(present=True, path=path, config=None, error=f"Unsupported format_version: {fv}")

    enforcement_mode = (normalized.get("enforcement") or {}).get("mode")
    if not isinstance(enforcement_mode, str) or enforcement_mode not in {"warn", "strict"}:
        return TeamConfigLoadResult(
            present=True,
            path=path,
            config=None,
            error="enforcement.mode must be one of: warn, strict",
        )

    policy = normalized.get("policy") or {}
    include_globs = policy.get("include_globs") or []
    exclude_globs = policy.get("exclude_globs") or []

    features = normalized.get("features") or {}
    trace_enabled_default = features.get("trace_enabled_default")
    if not isinstance(trace_enabled_default, bool):
        trace_enabled_default = False

    models = normalized.get("models") or {}
    embedding_provider = models.get("embedding_provider")
    embedding_model = models.get("embedding_model")

    cfg_hash = stable_sha256(_canonical_json_for_hash(normalized), length=16)

    return TeamConfigLoadResult(
        present=True,
        path=path,
        config=TeamConfig(
            format_version=fv,
            enforcement_mode=enforcement_mode,
            include_globs=list(include_globs),
            exclude_globs=list(exclude_globs),
            trace_enabled_default=trace_enabled_default,
            embedding_provider=embedding_provider,
            embedding_model=embedding_model,
            config_hash=cfg_hash,
        ),
        error=None,
    )
