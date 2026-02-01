from __future__ import annotations

import shutil
from typing import Any, Dict, Optional


def detect_codrag_command() -> str:
    return shutil.which("codrag") or "codrag"


def generate_mcp_configs(
    *,
    ide: str = "all",
    daemon_url: str = "http://127.0.0.1:8400",
    codrag_command: Optional[str] = None,
    mode: str = "auto",
    project_id: Optional[str] = None,
) -> Dict[str, Any]:
    norm_mode = str(mode).strip().lower()
    if norm_mode in ("pinned", "project"):
        norm_mode = "project"
    if norm_mode not in ("auto", "project"):
        raise ValueError("mode must be 'auto' or 'project'")
    if norm_mode == "project":
        if project_id is None or not str(project_id).strip():
            raise ValueError("project_id is required when mode='project'")

    codrag_path = codrag_command or detect_codrag_command()

    args = ["mcp"]
    if norm_mode == "project":
        args.extend(["--project", str(project_id).strip()])
    else:
        args.append("--auto")
    args.extend(["--daemon", daemon_url])

    base_config: Dict[str, Any] = {
        "command": codrag_path,
        "args": args,
    }

    configs: Dict[str, Any] = {}

    if ide in ("all", "claude"):
        configs["claude"] = {
            "file": "claude_desktop_config.json",
            "path_hint": "~/Library/Application Support/Claude/ (macOS) or %APPDATA%/Claude/ (Windows)",
            "config": {"mcpServers": {"codrag": base_config}},
        }

    if ide in ("all", "cursor"):
        configs["cursor"] = {
            "file": ".cursor/mcp.json",
            "path_hint": "Project root or ~/.cursor/",
            "config": {"mcpServers": {"codrag": base_config}},
        }

    if ide in ("all", "vscode"):
        configs["vscode"] = {
            "file": ".vscode/mcp.json",
            "path_hint": "Project root",
            "config": {"servers": {"codrag": base_config}},
        }

    if ide in ("all", "jetbrains"):
        configs["jetbrains"] = {
            "file": "AI Assistant > MCP Servers (Settings)",
            "path_hint": "Add via IDE Settings > Tools > AI Assistant > MCP Servers",
            "config": {
                "servers": [
                    {
                        "name": "codrag",
                        "command": codrag_path,
                        "args": args,
                    }
                ]
            },
        }

    if ide in ("all", "windsurf"):
        configs["windsurf"] = {
            "file": ".windsurf/mcp.json",
            "path_hint": "Project root",
            "config": {"mcpServers": {"codrag": base_config}},
        }

    if not configs:
        raise ValueError(f"Unknown IDE: {ide}")

    return configs
