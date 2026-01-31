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
    from codrag.server import app as fastapi_app
    
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
    project_id: str = typer.Argument(..., help="Project ID to build"),
    full: bool = typer.Option(False, "--full", help="Force full rebuild"),
) -> None:
    """Build or rebuild project index."""
    console.print(f"[green]Building index for: {project_id}[/green]")
    if full:
        console.print("  Mode: Full rebuild")
    else:
        console.print("  Mode: Incremental")
    
    # TODO: Implement build
    console.print("[yellow]Not implemented yet[/yellow]")


@app.command()
def status(
    project_id: str = typer.Argument(None, help="Project ID (optional)"),
) -> None:
    """Show project status."""
    if project_id:
        console.print(f"[cyan]Status for: {project_id}[/cyan]")
    else:
        console.print("[cyan]Status for all projects[/cyan]")
    
    # TODO: Implement status
    console.print("[yellow]Not implemented yet[/yellow]")


@app.command()
def search(
    project_id: str = typer.Argument(..., help="Project ID"),
    query: str = typer.Argument(..., help="Search query"),
    k: int = typer.Option(10, "--k", "-k", help="Number of results"),
) -> None:
    """Search project with semantic query."""
    console.print(f"[cyan]Searching {project_id}: {query}[/cyan]")
    
    # TODO: Implement search
    console.print("[yellow]Not implemented yet[/yellow]")


@app.command()
def context(
    project_id: str = typer.Argument(..., help="Project ID"),
    query: str = typer.Argument(..., help="Query for context assembly"),
    max_chars: int = typer.Option(8000, "--max-chars", "-c", help="Max context chars"),
) -> None:
    """Assemble context for LLM prompt."""
    console.print(f"[cyan]Assembling context for {project_id}: {query}[/cyan]")
    console.print(f"  Max chars: {max_chars}")
    
    # TODO: Implement context assembly
    console.print("[yellow]Not implemented yet[/yellow]")


@app.command()
def ui(
    port: int = typer.Option(8400, "--port", "-p", help="Dashboard port"),
) -> None:
    """Open CoDRAG dashboard in browser."""
    import webbrowser
    
    url = f"http://localhost:{port}"
    console.print(f"[green]Opening dashboard: {url}[/green]")
    webbrowser.open(url)


@app.command()
def mcp(
    project_id: str = typer.Option(None, "--project", "-p", help="Project ID"),
    auto: bool = typer.Option(False, "--auto", "-a", help="Auto-detect project from cwd"),
) -> None:
    """Run as MCP server for IDE integration."""
    if auto:
        console.print("[cyan]MCP server with auto-detect mode[/cyan]", err=True)
    elif project_id:
        console.print(f"[cyan]MCP server for project: {project_id}[/cyan]", err=True)
    else:
        console.print("[red]Error: Specify --project or --auto[/red]", err=True)
        raise typer.Exit(1)
    
    # TODO: Implement MCP server
    console.print("[yellow]MCP server not implemented yet[/yellow]", err=True)


@app.command("mcp-config")
def mcp_config() -> None:
    """Generate MCP config for IDE integration."""
    import json
    
    config = {
        "mcpServers": {
            "codrag": {
                "command": "codrag",
                "args": ["mcp", "--auto"],
            }
        }
    }
    
    console.print(json.dumps(config, indent=2))
    console.print("\n[dim]Add this to your IDE's MCP configuration.[/dim]", err=True)


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
