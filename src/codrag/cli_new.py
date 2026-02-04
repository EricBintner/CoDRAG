"""
CoDRAG CLI entry point.

Usage:
    codrag serve              Start the daemon
    codrag add <path>         Add a project
    codrag list               List projects
    codrag build [id]         Build project index
    codrag search <q>         Search project
    codrag ui                 Open dashboard
"""

import json
import sys
import time
from pathlib import Path
from typing import Optional, Dict, Any, List

import requests
import typer
from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich.markdown import Markdown

from codrag import __version__

app = typer.Typer(
    name="codrag",
    help="CoDRAG - Code Documentation and RAG.\n\nSemantic search, context assembly, and structural analysis for your codebase.",
    no_args_is_help=True,
    add_completion=False,
)
console = Console()


def _base_url(host: str, port: int) -> str:
    return f"http://{host}:{port}"


def _post_json(url: str, payload: dict) -> Any:
    try:
        r = requests.post(url, json=payload, timeout=30)
        r.raise_for_status()
        return r.json()
    except requests.exceptions.HTTPError as e:
        try:
            err = e.response.json()
            if isinstance(err, dict) and "error" in err:
                code = err["error"].get("code", "ERROR")
                msg = err["error"].get("message", str(e))
                console.print(f"[red]Error ({code}): {msg}[/red]")
                if "hint" in err["error"]:
                    console.print(f"[dim]Hint: {err['error']['hint']}[/dim]")
                raise typer.Exit(1)
        except ValueError:
            pass
        console.print(f"[red]HTTP Error: {e}[/red]")
        raise typer.Exit(1)
    except requests.exceptions.ConnectionError:
        console.print(f"[red]Error: Cannot connect to CoDRAG daemon at {url}[/red]")
        console.print("[dim]Is the server running? Try: codrag serve[/dim]")
        raise typer.Exit(1)


def _get_json(url: str) -> Any:
    try:
        r = requests.get(url, timeout=30)
        r.raise_for_status()
        return r.json()
    except requests.exceptions.HTTPError as e:
        try:
            err = e.response.json()
            if isinstance(err, dict) and "error" in err:
                code = err["error"].get("code", "ERROR")
                msg = err["error"].get("message", str(e))
                console.print(f"[red]Error ({code}): {msg}[/red]")
                if "hint" in err["error"]:
                    console.print(f"[dim]Hint: {err['error']['hint']}[/dim]")
                raise typer.Exit(1)
        except ValueError:
            pass
        console.print(f"[red]HTTP Error: {e}[/red]")
        raise typer.Exit(1)
    except requests.exceptions.ConnectionError:
        console.print(f"[red]Error: Cannot connect to CoDRAG daemon at {url}[/red]")
        console.print("[dim]Is the server running? Try: codrag serve[/dim]")
        raise typer.Exit(1)


def _resolve_project(base: str, project_id: Optional[str] = None, auto: bool = True) -> str:
    """Resolve project ID from argument, CWD (auto), or default if single project."""
    if project_id:
        return project_id

    # List all projects
    try:
        data = _get_json(f"{base}/projects")
        projects = data.get("projects", []) if isinstance(data, dict) else []
    except typer.Exit:
        raise
    except Exception as e:
        console.print(f"[red]Error listing projects: {e}[/red]")
        raise typer.Exit(1)

    if not projects:
        console.print("[yellow]No projects found in daemon.[/yellow]")
        console.print("Run 'codrag add <path>' to register a project.")
        raise typer.Exit(1)

    # 1. Try auto-detect from CWD
    cwd = str(Path.cwd().resolve())
    if auto:
        best: Optional[Dict[str, Any]] = None
        best_len = -1
        for p in projects:
            p_path = str(p.get("path") or "").rstrip("/")
            if not p_path:
                continue
            if cwd == p_path or cwd.startswith(p_path + "/"):
                if len(p_path) > best_len:
                    best = p
                    best_len = len(p_path)
        
        if best and best.get("id"):
            pid = str(best.get("id"))
            return pid

    # 2. If only one project exists, use it
    if len(projects) == 1 and projects[0].get("id"):
        pid = str(projects[0].get("id"))
        return pid

    # 3. Ambiguous
    console.print("[red]Multiple projects available. Please specify --project-id or run inside a project directory.[/red]")
    table = Table(title="Available Projects")
    table.add_column("ID", style="cyan")
    table.add_column("Name", style="green")
    table.add_column("Path")
    for p in projects:
        table.add_row(p.get("id"), p.get("name"), p.get("path"))
    console.print(table)
    raise typer.Exit(1)


@app.callback()
def callback() -> None:
    """
    CoDRAG: Code Documentation and Retrieval Augmented Generation.

    Manage code indexes, run semantic searches, and assemble context for LLMs.
    """
    pass


@app.command()
def version() -> None:
    """Show version information."""
    console.print(f"CoDRAG v{__version__}")


@app.command()
def serve(
    host: str = typer.Option("127.0.0.1", "--host", "-h", help="Host to bind to"),
    port: int = typer.Option(8400, "--port", "-p", help="Port to bind to"),
    reload: bool = typer.Option(False, "--reload", help="Enable auto-reload (dev mode)"),
) -> None:
    """
    Start the CoDRAG daemon.

    The daemon manages projects, indexes, and provides the API for clients/IDEs.
    """
    console.print(f"[green]Starting CoDRAG server on {host}:{port}...[/green]")
    
    import uvicorn
    from codrag.server import app as fastapi_app, configure, mount_dashboard

    configure()
    mount_dashboard()
    
    uvicorn.run("codrag.server:app" if reload else fastapi_app, host=host, port=port, reload=reload)


@app.command()
def add(
    path: str = typer.Argument(..., help="Path to project root directory"),
    name: str = typer.Option(None, "--name", "-n", help="Project name (defaults to folder name)"),
    mode: str = typer.Option("standalone", "--mode", "-m", help="Index mode: standalone (global data dir) or embedded (.codrag in repo)"),
    host: str = typer.Option("127.0.0.1", "--host", help="Server host"),
    port: int = typer.Option(8400, "--port", help="Server port"),
) -> None:
    """
    Register a new project with the daemon.

    Does not automatically build the index. Run 'codrag build' after adding.
    """
    base = _base_url(host, port)
    abs_path = str(Path(path).resolve())
    
    payload = {
        "path": abs_path,
        "mode": mode,
    }
    if name:
        payload["name"] = name
        
    data = _post_json(f"{base}/projects", payload)
    p = data.get("project", {})
    
    console.print(f"[green]Project added successfully:[/green] {p.get('name')}")
    console.print(f"  ID: {p.get('id')}")
    console.print(f"  Path: {p.get('path')}")
    console.print(f"  Mode: {p.get('mode')}")
    console.print("\n[dim]Run 'codrag build' to index this project.[/dim]")


@app.command("list")
def list_projects(
    host: str = typer.Option("127.0.0.1", "--host", help="Server host"),
    port: int = typer.Option(8400, "--port", help="Server port"),
) -> None:
    """List all registered projects."""
    base = _base_url(host, port)
    data = _get_json(f"{base}/projects")
    
    projects = data.get("projects", [])
    if not projects:
        console.print("[yellow]No projects found.[/yellow]")
        return

    table = Table(title="CoDRAG Projects")
    table.add_column("ID", style="cyan", no_wrap=True)
    table.add_column("Name", style="green")
    table.add_column("Path")
    table.add_column("Mode")
    table.add_column("Created")
    
    for p in projects:
        table.add_row(
            p.get("id"),
            p.get("name"),
            p.get("path"),
            p.get("mode"),
            p.get("created_at", "")[:19].replace("T", " "),
        )
    
    console.print(table)


@app.command()
def remove(
    project_id: str = typer.Argument(..., help="Project ID to remove"),
    purge: bool = typer.Option(False, "--purge", help="Also delete the index data from disk"),
    host: str = typer.Option("127.0.0.1", "--host", help="Server host"),
    port: int = typer.Option(8400, "--port", help="Server port"),
) -> None:
    """
    Unregister a project.

    Use --purge to also delete the persistent index files.
    """
    base = _base_url(host, port)
    
    # We can't use requests.delete easily with _post_json helper, so custom call here
    url = f"{base}/projects/{project_id}"
    if purge:
        url += "?purge=true"
        
    try:
        r = requests.delete(url, timeout=30)
        r.raise_for_status()
        data = r.json()
    except Exception as e:
        console.print(f"[red]Error removing project: {e}[/red]")
        raise typer.Exit(1)

    if data.get("success"):
        console.print(f"[green]Project '{project_id}' removed.[/green]")
        if data.get("purged"):
            console.print("[dim]Index data purged.[/dim]")
    else:
        console.print(f"[red]Failed to remove project: {data}[/red]")


@app.command()
def status(
    project_id: Optional[str] = typer.Argument(None, help="Project ID (optional if inside project dir)"),
    host: str = typer.Option("127.0.0.1", "--host", help="Server host"),
    port: int = typer.Option(8400, "--port", help="Server port"),
) -> None:
    """
    Show index status for a project.

    Displays whether the index is loaded, build timestamp, and stats.
    """
    base = _base_url(host, port)
    pid = _resolve_project(base, project_id)
    
    data = _get_json(f"{base}/projects/{pid}/status")
    
    console.print(Panel(f"[bold]Project Status: {pid}[/bold]", expand=False))
    
    idx = data.get("index", {})
    trace = data.get("trace", {})
    
    # Embeddings Index
    if idx.get("exists"):
        console.print("[green]● Embeddings Index: Ready[/green]")
        console.print(f"  Chunks: {idx.get('total_chunks', 0):,}")
        console.print(f"  Model: {idx.get('embedding_model', 'unknown')}")
        console.print(f"  Last Build: {idx.get('last_build_at')}")
    else:
        console.print("[yellow]○ Embeddings Index: Not Built[/yellow]")
        console.print("  Run 'codrag build' to create.")

    if data.get("building"):
        console.print("[cyan]  (Building in progress...)[/cyan]")
        
    console.print()
    
    # Trace Index
    if trace.get("exists"):
        console.print("[green]● Trace Index: Ready[/green]")
        counts = trace.get("counts", {})
        console.print(f"  Nodes: {counts.get('nodes', 0):,}")
        console.print(f"  Edges: {counts.get('edges', 0):,}")
    elif trace.get("enabled"):
        console.print("[yellow]○ Trace Index: Enabled but Not Built[/yellow]")
    else:
        console.print("[dim]○ Trace Index: Disabled[/dim]")
        
    if trace.get("building"):
        console.print("[cyan]  (Trace build in progress...)[/cyan]")


@app.command()
def build(
    project_id: Optional[str] = typer.Argument(None, help="Project ID (optional if inside project dir)"),
    full: bool = typer.Option(False, "--full", help="Force full rebuild (ignore incremental cache)"),
    host: str = typer.Option("127.0.0.1", "--host", help="Server host"),
    port: int = typer.Option(8400, "--port", help="Server port"),
) -> None:
    """
    Trigger an index build.

    Builds are asynchronous. Use 'codrag status' to check progress.
    """
    base = _base_url(host, port)
    pid = _resolve_project(base, project_id)
    
    url = f"{base}/projects/{pid}/build"
    if full:
        url += "?full=true"
        
    console.print(f"[cyan]Triggering build for project {pid}...[/cyan]")
    data = _post_json(url, {})
    
    if data.get("started"):
        console.print("[green]Build started successfully.[/green]")
        console.print("Use 'codrag status' to monitor progress.")
    else:
        console.print(f"[yellow]Build did not start: {data}[/yellow]")


@app.command()
def search(
    query: str = typer.Argument(..., help="Natural language search query"),
    project_id: Optional[str] = typer.Option(None, "--project", "-p", help="Project ID (optional if inside project dir)"),
    k: int = typer.Option(10, "--limit", "-k", help="Number of results to return"),
    min_score: float = typer.Option(0.15, "--min-score", "-s", help="Minimum similarity score (0-1)"),
    host: str = typer.Option("127.0.0.1", "--host", help="Server host"),
    port: int = typer.Option(8400, "--port", help="Server port"),
) -> None:
    """
    Semantic search across the codebase.

    Returns the most relevant code chunks for your query.
    """
    base = _base_url(host, port)
    pid = _resolve_project(base, project_id)
    
    data = _post_json(f"{base}/projects/{pid}/search", {
        "query": query,
        "k": k,
        "min_score": min_score,
    })
    
    results = data.get("results", [])
    if not results:
        console.print("[yellow]No results found matching query.[/yellow]")
        return
        
    console.print(f"[green]Found {len(results)} results for '{query}':[/green]\n")
    
    for i, r in enumerate(results, 1):
        path = r.get("source_path", "unknown")
        score = r.get("score", 0.0)
        preview = r.get("preview", "").strip()
        span = r.get("span", {})
        lines = f"{span.get('start_line', '?')}-{span.get('end_line', '?')}"
        
        console.print(f"[bold cyan]{i}. {path}:{lines}[/bold cyan] [dim](score: {score:.3f})[/dim]")
        if preview:
            # Simple syntax highlighting simulation
            preview_clean = preview[:200].replace("\n", " ")
            console.print(f"   [dim]{preview_clean}...[/dim]")
        console.print()


@app.command()
def context(
    query: str = typer.Argument(..., help="Query to assemble context for"),
    project_id: Optional[str] = typer.Option(None, "--project", "-p", help="Project ID (optional if inside project dir)"),
    k: int = typer.Option(5, "--limit", "-k", help="Number of chunks to include"),
    max_chars: int = typer.Option(8000, "--max-chars", "-c", help="Maximum characters in context"),
    raw: bool = typer.Option(False, "--raw", "-r", help="Output only the raw context string (for piping)"),
    host: str = typer.Option("127.0.0.1", "--host", help="Server host"),
    port: int = typer.Option(8400, "--port", help="Server port"),
) -> None:
    """
    Assemble context for LLM prompts.

    Retrieves relevant chunks and formats them into a single context string
    optimized for LLM consumption (with source headers).
    """
    base = _base_url(host, port)
    pid = _resolve_project(base, project_id)
    
    data = _post_json(f"{base}/projects/{pid}/context", {
        "query": query,
        "k": k,
        "max_chars": max_chars,
        "include_sources": True,
        "structured": True,
    })
    
    ctx = data.get("context", "")
    chunks = data.get("chunks", [])
    total_chars = data.get("total_chars", 0)
    est_tokens = data.get("estimated_tokens", 0)
    
    if raw:
        print(ctx)
        return
        
    console.print(Panel(
        f"Chunks: {len(chunks)} | Chars: {total_chars} | Est. Tokens: {est_tokens}",
        title="Context Assembly Stats",
        expand=False
    ))
    console.print()
    console.print(ctx)


@app.command()
def ui(
    port: int = typer.Option(8400, "--port", "-p", help="Dashboard port"),
) -> None:
    """Open the CoDRAG web dashboard."""
    import webbrowser
    url = f"http://localhost:{port}/ui"
    console.print(f"[green]Opening dashboard: {url}[/green]")
    webbrowser.open(url)


@app.command()
def mcp(
    project_id: str = typer.Option(None, "--project", "-p", help="Project ID (pinned mode)"),
    auto: bool = typer.Option(False, "--auto", "-a", help="Auto-detect project from cwd (Server Mode)"),
    mode: str = typer.Option("server", "--mode", "-m", help="Mode: server | direct"),
    daemon_url: str = typer.Option("http://127.0.0.1:8400", "--daemon", "-d", help="CoDRAG daemon URL (Server Mode)"),
    repo_root: str = typer.Option(None, "--repo-root", "-r", help="Repository root (Direct Mode). Defaults to cwd."),
) -> None:
    """
    Run the Model Context Protocol (MCP) server.

    Connects IDEs (Cursor, Windsurf, Claude Desktop) to CoDRAG.
    
    Modes:
      server (default): Bridges IDE to the running CoDRAG daemon.
      direct: Runs the CoDRAG engine in-process (no daemon required).
    """
    from codrag.mcp_server import main as mcp_server_main
    from codrag.mcp_direct import DirectMCPServer, run_stdio
    import asyncio
    
    if mode == "direct":
        root = Path(repo_root).resolve() if repo_root else Path.cwd()
        print(f"[codrag] Starting MCP (Direct Mode) at {root}...", file=sys.stderr)
        server = DirectMCPServer(repo_root=root)
        asyncio.run(run_stdio(server))
    else:
        # Server mode
        print(f"[codrag] Starting MCP (Server Mode) -> {daemon_url}...", file=sys.stderr)
        mcp_server_main(
            daemon_url=daemon_url,
            project_id=project_id,
            auto_detect=auto,
        )


@app.command("mcp-config")
def mcp_config(
    ide: str = typer.Option("all", "--ide", "-i", help="Target IDE: claude, cursor, windsurf, all"),
    daemon_url: str = typer.Option("http://127.0.0.1:8400", "--daemon", "-d", help="CoDRAG daemon URL"),
    project_id: str = typer.Option(None, "--project", "-p", help="Optional pinned Project ID"),
) -> None:
    """
    Generate MCP configuration for IDEs.

    Prints the JSON configuration needed to add CoDRAG to your IDE.
    """
    from codrag.mcp_config import generate_mcp_configs
    
    # We simplify this command to assume "server" mode for most users
    try:
        configs = generate_mcp_configs(
            ide=ide,
            daemon_url=daemon_url,
            mode="auto" if not project_id else "project",
            project_id=project_id
        )
    except Exception as e:
        console.print(f"[red]Error generating config: {e}[/red]")
        raise typer.Exit(1)

    if ide == "all":
        for name, cfg in configs.items():
            console.print(Panel(
                json.dumps(cfg["config"], indent=2),
                title=f"{name.upper()} Config ({cfg['file']})",
                expand=False
            ))
    else:
        # Single IDE
        cfg = next(iter(configs.values()))
        print(json.dumps(cfg["config"], indent=2))


if __name__ == "__main__":
    app()
