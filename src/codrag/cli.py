"""
CoDRAG CLI entry point.

Usage:
    codrag serve              Start the daemon
    codrag add <path>         Add a project
    codrag list               List projects
    codrag build <id>         Build project index
    codrag search <id> <q>    Search project
    codrag ui                 Open dashboard
"""

import requests
import typer
from rich.console import Console
from rich.table import Table

from codrag import __version__

app = typer.Typer(
    name="codrag",
    help="CoDRAG - Code Documentation and RAG",
    no_args_is_help=True,
)
console = Console()


def _api_base(host: str, port: int) -> str:
    return f"http://{host}:{port}/api/code-index"


def _post_json(url: str, payload: dict) -> dict:
    r = requests.post(url, json=payload, timeout=30)
    r.raise_for_status()
    return r.json()


def _get_json(url: str) -> dict:
    r = requests.get(url, timeout=30)
    r.raise_for_status()
    return r.json()


@app.callback()
def callback() -> None:
    """CoDRAG - Multi-project semantic search for codebases."""
    pass


@app.command()
def version() -> None:
    """Show version information."""
    console.print(f"CoDRAG v{__version__}")


@app.command()
def serve(
    foreground: bool = typer.Option(False, "--foreground", "-f", help="Run in foreground"),
    host: str = typer.Option("127.0.0.1", "--host", "-h", help="Host to bind to"),
    port: int = typer.Option(8400, "--port", "-p", help="Port to bind to"),
) -> None:
    """Start the CoDRAG daemon."""
    console.print(f"[green]Starting CoDRAG server on {host}:{port}...[/green]")
    
    # TODO: Implement server startup
    # For now, run uvicorn directly
    import uvicorn
    from codrag.server import app as fastapi_app, configure, mount_dashboard

    configure()
    mount_dashboard()
    
    uvicorn.run(fastapi_app, host=host, port=port)


@app.command()
def stop() -> None:
    """Stop the CoDRAG daemon."""
    console.print("[yellow]Stopping CoDRAG daemon...[/yellow]")
    # TODO: Implement daemon stop
    console.print("[red]Not implemented yet[/red]")


@app.command()
def add(
    path: str = typer.Argument(..., help="Path to project directory"),
    name: str = typer.Option(None, "--name", "-n", help="Project name"),
    embedded: bool = typer.Option(False, "--embedded", "-e", help="Store index in project dir"),
) -> None:
    """Add a project to CoDRAG."""
    from pathlib import Path
    
    project_path = Path(path).resolve()
    if not project_path.exists():
        console.print(f"[red]Error: Path does not exist: {project_path}[/red]")
        raise typer.Exit(1)
    
    project_name = name or project_path.name
    mode = "embedded" if embedded else "standalone"
    
    console.print(f"[green]Adding project:[/green] {project_name}")
    console.print(f"  Path: {project_path}")
    console.print(f"  Mode: {mode}")
    
    # TODO: Implement project registration
    console.print("[yellow]Project registration not implemented yet[/yellow]")


@app.command("list")
def list_projects() -> None:
    """List all registered projects."""
    # TODO: Implement project listing
    table = Table(title="CoDRAG Projects")
    table.add_column("ID", style="cyan")
    table.add_column("Name", style="green")
    table.add_column("Path")
    table.add_column("Mode")
    table.add_column("Status")
    
    # Placeholder data
    table.add_row("(no projects)", "", "", "", "")
    
    console.print(table)
    console.print("[yellow]Project listing not fully implemented yet[/yellow]")


@app.command()
def remove(
    project_id: str = typer.Argument(..., help="Project ID to remove"),
    purge: bool = typer.Option(False, "--purge", help="Also delete index data"),
) -> None:
    """Remove a project from CoDRAG."""
    console.print(f"[yellow]Removing project: {project_id}[/yellow]")
    if purge:
        console.print("[red]  Also purging index data[/red]")
    
    # TODO: Implement project removal
    console.print("[yellow]Not implemented yet[/yellow]")


@app.command()
def build(
    full: bool = typer.Option(False, "--full", help="Force full rebuild"),
    host: str = typer.Option("127.0.0.1", "--host", help="Server host"),
    port: int = typer.Option(8400, "--port", help="Server port"),
) -> None:
    """Build or rebuild project index."""
    base = _api_base(host, port)
    try:
        console.print("[cyan]Starting index build...[/cyan]")
        if full:
            console.print("  Mode: Full rebuild")
        else:
            console.print("  Mode: Incremental")
        
        data = _post_json(f"{base}/build", {})
        
        if data.get("started"):
            console.print("[green]Build started successfully[/green]")
            console.print("[dim]Use 'codrag status' to check progress[/dim]")
        elif data.get("building"):
            console.print("[yellow]A build is already in progress[/yellow]")
        else:
            console.print(f"[yellow]Unexpected response: {data}[/yellow]")
            
    except requests.exceptions.ConnectionError:
        console.print("[red]Error: Cannot connect to CoDRAG daemon[/red]")
        console.print("[dim]Is the server running? Try: codrag serve[/dim]")
        raise typer.Exit(1)
    except Exception as e:
        console.print(f"[red]Error: {e}[/red]")
        raise typer.Exit(1)


@app.command()
def status(
    project_id: str = typer.Argument(None, help="Project ID (optional)"),
    host: str = typer.Option("127.0.0.1", "--host", help="Server host"),
    port: int = typer.Option(8400, "--port", help="Server port"),
) -> None:
    """Show project/index status."""
    base = _api_base(host, port)
    try:
        data = _get_json(f"{base}/status")
        
        # Format output
        index = data.get("index", {})
        if index.get("loaded"):
            console.print("[green]Index Status: LOADED[/green]")
            console.print(f"  Documents: {index.get('total_documents', 0)}")
            console.print(f"  Model: {index.get('model', 'unknown')}")
            console.print(f"  Built: {index.get('built_at', 'unknown')}")
        else:
            console.print("[yellow]Index Status: NOT LOADED[/yellow]")
            console.print("  Run 'codrag build' to create the index.")
        
        if data.get("building"):
            console.print("[cyan]Build: IN PROGRESS[/cyan]")
        
        watch = data.get("watch", {})
        if watch.get("enabled"):
            console.print(f"[green]Watch: ENABLED ({watch.get('state', 'unknown')})[/green]")
        else:
            console.print("[dim]Watch: disabled[/dim]")
            
    except requests.exceptions.ConnectionError:
        console.print("[red]Error: Cannot connect to CoDRAG daemon[/red]")
        console.print(f"[dim]Is the server running? Try: codrag serve[/dim]")
        raise typer.Exit(1)
    except Exception as e:
        console.print(f"[red]Error: {e}[/red]")
        raise typer.Exit(1)


@app.command()
def search(
    query: str = typer.Argument(..., help="Search query"),
    k: int = typer.Option(10, "--k", "-k", help="Number of results"),
    min_score: float = typer.Option(0.15, "--min-score", help="Minimum similarity score"),
    host: str = typer.Option("127.0.0.1", "--host", help="Server host"),
    port: int = typer.Option(8400, "--port", help="Server port"),
) -> None:
    """Search index with semantic query."""
    base = _api_base(host, port)
    try:
        data = _post_json(f"{base}/search", {
            "query": query,
            "k": k,
            "min_score": min_score,
        })
        
        results = data.get("results", [])
        if not results:
            console.print("[yellow]No results found[/yellow]")
            return
        
        console.print(f"[green]Found {len(results)} results:[/green]\n")
        
        for i, r in enumerate(results, 1):
            doc = r.get("doc", {})
            score = r.get("score", 0)
            path = doc.get("source_path", "unknown")
            section = doc.get("section", "")
            content = doc.get("content", "")[:200]
            
            console.print(f"[bold cyan]{i}. {path}[/bold cyan] [dim](score: {score:.3f})[/dim]")
            if section:
                console.print(f"   [dim]Section: {section}[/dim]")
            console.print(f"   {content}..." if len(doc.get("content", "")) > 200 else f"   {content}")
            console.print()
            
    except requests.exceptions.ConnectionError:
        console.print("[red]Error: Cannot connect to CoDRAG daemon[/red]")
        raise typer.Exit(1)
    except Exception as e:
        console.print(f"[red]Error: {e}[/red]")
        raise typer.Exit(1)


@app.command()
def context(
    query: str = typer.Argument(..., help="Query for context assembly"),
    k: int = typer.Option(5, "--k", "-k", help="Number of chunks"),
    max_chars: int = typer.Option(8000, "--max-chars", "-c", help="Max context chars"),
    raw: bool = typer.Option(False, "--raw", "-r", help="Output raw context only (for piping)"),
    host: str = typer.Option("127.0.0.1", "--host", help="Server host"),
    port: int = typer.Option(8400, "--port", help="Server port"),
) -> None:
    """Assemble context for LLM prompt."""
    base = _api_base(host, port)
    try:
        data = _post_json(f"{base}/context", {
            "query": query,
            "k": k,
            "max_chars": max_chars,
            "include_sources": True,
            "structured": True,
        })
        
        context_str = data.get("context", "")
        
        if raw:
            # Raw output for piping to LLM
            print(context_str)
            return
        
        if not context_str:
            console.print("[yellow]No context assembled (no matching chunks)[/yellow]")
            return
        
        total_chars = data.get("total_chars", len(context_str))
        est_tokens = data.get("estimated_tokens", total_chars // 4)
        chunks = data.get("chunks", [])
        
        console.print(f"[green]Assembled context:[/green]")
        console.print(f"  Chunks: {len(chunks)}")
        console.print(f"  Characters: {total_chars:,}")
        console.print(f"  Est. tokens: ~{est_tokens:,}")
        console.print()
        console.print("[dim]─" * 60 + "[/dim]")
        console.print(context_str)
        console.print("[dim]─" * 60 + "[/dim]")
        
    except requests.exceptions.ConnectionError:
        console.print("[red]Error: Cannot connect to CoDRAG daemon[/red]")
        raise typer.Exit(1)
    except Exception as e:
        console.print(f"[red]Error: {e}[/red]")
        raise typer.Exit(1)


@app.command()
def ui(
    port: int = typer.Option(8400, "--port", "-p", help="Dashboard port"),
) -> None:
    """Open CoDRAG dashboard in browser."""
    import webbrowser
    
    url = f"http://localhost:{port}/ui"
    console.print(f"[green]Opening dashboard: {url}[/green]")
    webbrowser.open(url)


@app.command()
def profile(
    repo_root: str = typer.Option(None, "--repo-root", help="Repository root to profile (optional if server configured)"),
    host: str = typer.Option("127.0.0.1", "--host", help="Server host"),
    port: int = typer.Option(8400, "--port", help="Server port"),
) -> None:
    """Show deterministic repo profile (suggested include/exclude + roles)."""
    base = _api_base(host, port)
    url = f"{base}/profile"
    if repo_root:
        url = url + f"?repo_root={repo_root}"
    data = _get_json(url)
    console.print_json(data=data)


@app.command()
def policy(
    repo_root: str = typer.Option(None, "--repo-root", help="Repository root (optional if server configured)"),
    force: bool = typer.Option(False, "--force", help="Regenerate policy"),
    host: str = typer.Option("127.0.0.1", "--host", help="Server host"),
    port: int = typer.Option(8400, "--port", help="Server port"),
) -> None:
    """Get or regenerate the persisted repo policy (repo_policy.json)."""
    base = _api_base(host, port)
    payload: dict = {"force": force}
    if repo_root:
        payload["repo_root"] = repo_root
    data = _post_json(f"{base}/policy", payload)
    console.print_json(data=data)


@app.command("watch-start")
def watch_start(
    repo_root: str = typer.Option(None, "--repo-root", help="Repository root (optional if server configured)"),
    debounce_ms: int = typer.Option(5000, "--debounce-ms", help="Debounce interval in ms"),
    min_rebuild_gap_ms: int = typer.Option(2000, "--min-gap-ms", help="Minimum gap between rebuilds in ms"),
    host: str = typer.Option("127.0.0.1", "--host", help="Server host"),
    port: int = typer.Option(8400, "--port", help="Server port"),
) -> None:
    """Start auto-rebuild watcher (single-repo server mode)."""
    base = _api_base(host, port)
    payload: dict = {
        "debounce_ms": debounce_ms,
        "min_rebuild_gap_ms": min_rebuild_gap_ms,
    }
    if repo_root:
        payload["repo_root"] = repo_root
    data = _post_json(f"{base}/watch/start", payload)
    console.print_json(data=data)


@app.command("watch-stop")
def watch_stop(
    host: str = typer.Option("127.0.0.1", "--host", help="Server host"),
    port: int = typer.Option(8400, "--port", help="Server port"),
) -> None:
    """Stop auto-rebuild watcher."""
    base = _api_base(host, port)
    data = _post_json(f"{base}/watch/stop", {})
    console.print_json(data=data)


@app.command("watch-status")
def watch_status(
    host: str = typer.Option("127.0.0.1", "--host", help="Server host"),
    port: int = typer.Option(8400, "--port", help="Server port"),
) -> None:
    """Show auto-rebuild watcher status."""
    base = _api_base(host, port)
    data = _get_json(f"{base}/watch/status")
    console.print_json(data=data)


@app.command()
def mcp(
    project_id: str = typer.Option(None, "--project", "-p", help="Project ID (pinned mode)"),
    auto: bool = typer.Option(False, "--auto", "-a", help="Auto-detect project from cwd"),
    daemon_url: str = typer.Option("http://127.0.0.1:8400", "--daemon", "-d", help="CoDRAG daemon URL"),
) -> None:
    """Run as MCP server for IDE integration (stdio transport)."""
    from codrag.mcp_server import main as mcp_main
    
    # Log to stderr (stdout is reserved for MCP JSON-RPC)
    import sys
    if auto:
        print("[codrag] MCP server starting (auto-detect mode)", file=sys.stderr)
    elif project_id:
        print(f"[codrag] MCP server starting (project: {project_id})", file=sys.stderr)
    else:
        print("[codrag] MCP server starting (default mode)", file=sys.stderr)
    
    mcp_main(
        daemon_url=daemon_url,
        project_id=project_id,
        auto_detect=auto,
    )

@app.command("mcp-config")
def mcp_config(
    ide: str = typer.Option("all", "--ide", "-i", help="Target IDE: claude, cursor, vscode, jetbrains, windsurf, all"),
    daemon_url: str = typer.Option("http://127.0.0.1:8400", "--daemon", "-d", help="CoDRAG daemon URL"),
    mode: str = typer.Option("auto", "--mode", help="MCP mode: auto | project"),
    project_id: str = typer.Option(None, "--project-id", help="Project ID when --mode project"),
) -> None:
    """Generate MCP config for IDE integration."""
    import json
    from codrag.mcp_config import generate_mcp_configs

    try:
        configs = generate_mcp_configs(
            ide=ide,
            daemon_url=daemon_url,
            mode=mode,
            project_id=project_id,
        )
    except ValueError as e:
        console.print(f"[red]{e}[/red]")
        raise typer.Exit(1)

    if ide == "all":
        console.print("[bold cyan]MCP Configuration for All Supported IDEs[/bold cyan]\n")
        for ide_name, cfg in configs.items():
            console.print(f"[bold green]━━━ {ide_name.upper()} ━━━[/bold green]")
            console.print(f"[dim]File: {cfg['file']}[/dim]")
            console.print(f"[dim]Location: {cfg['path_hint']}[/dim]")
            console.print(json.dumps(cfg["config"], indent=2))
            console.print()
    else:
        cfg = next(iter(configs.values()))
        console.print(f"[dim]# {ide.upper()} - {cfg['file']}[/dim]")
        console.print(f"[dim]# Location: {cfg['path_hint']}[/dim]")
        console.print(json.dumps(cfg["config"], indent=2))


@app.command()
def config(
    key: str = typer.Argument(None, help="Config key to get/set"),
    value: str = typer.Argument(None, help="Value to set"),
) -> None:
    """View or modify CoDRAG configuration."""
    if key is None:
        console.print("[cyan]Current configuration:[/cyan]")
        # TODO: Show current config
        console.print("[yellow]Not implemented yet[/yellow]")
    elif value is None:
        console.print(f"[cyan]Getting: {key}[/cyan]")
        # TODO: Get config value
        console.print("[yellow]Not implemented yet[/yellow]")
    else:
        console.print(f"[cyan]Setting: {key} = {value}[/cyan]")
        # TODO: Set config value
        console.print("[yellow]Not implemented yet[/yellow]")


def main() -> None:
    """Entry point for the CLI."""
    app()


if __name__ == "__main__":
    main()
