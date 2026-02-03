# CoDRAG MCP (codrag-mcp)

**Local-first codebase intelligence** for developers and IDE agents — semantic search + structural Trace Index + LLM-ready context, all on your machine.

This repository exists for **public MCP discovery and onboarding**. It points to the full CoDRAG engine, which runs locally and powers IDE integrations.

CoDRAG turns “where is this implemented?” into a 5-second, cite-the-source answer:
- **Semantic search** across your repo(s)
- **Trace Index (code graph)** for symbols/imports/calls so agents can reason structurally
- **Context builder** that outputs bounded, attributable chunks for LLMs
- **MCP for IDEs** (Cursor, Windsurf, Claude Desktop, VS Code, JetBrains)
- **Local-first by default:** no repo content is uploaded unless you choose

Supported IDEs & Agents:
- Cursor
- Windsurf
- Claude Desktop
- Claude Code (CLI)
- VS Code
- JetBrains

## Install CoDRAG (Free)

To use MCP, you first install the CoDRAG engine locally.

Primary install:
- https://codrag.io

Package managers:

```bash
# macOS (Homebrew)
brew install --cask codrag

# Windows (winget)
winget install MagneticAnomaly.CoDRAG

# Linux (Debian/Ubuntu)
sudo apt install codrag

# Linux (Fedora/RHEL)
sudo dnf install codrag

# Linux (Arch)
sudo pacman -S codrag
```

For other Linux distributions, use the AppImage or tarball from https://codrag.io.

## Connect your IDE (recommended)

Generate the MCP config for your IDE:

```bash
# Cursor
codrag mcp-config --mode direct --ide cursor

# Windsurf
codrag mcp-config --mode direct --ide windsurf

# Claude (Claude Desktop)
codrag mcp-config --mode direct --ide claude

# VS Code
codrag mcp-config --mode direct --ide vscode

# JetBrains
codrag mcp-config --mode direct --ide jetbrains
```

Then restart your IDE and enable the CoDRAG MCP server if prompted.

## Claude Code

If you're using Claude Code (or any other MCP client) and it supports MCP server configuration via JSON, you can use the same MCP server definition CoDRAG prints for `--ide claude`.

Generic MCP server entry:

```json
{
  "mcpServers": {
    "codrag": {
      "command": "codrag",
      "args": ["mcp", "--mode", "direct"]
    }
  }
}
```

If your client uses a different top-level key than `mcpServers`, keep the `command` and `args` the same and adapt the surrounding structure.

## Run the MCP server (manual)

If your IDE expects you to run the server command yourself:

```bash
codrag mcp --mode direct
```

## Troubleshooting

If you see `codrag: command not found`:
- Ensure CoDRAG is installed.
- Quit and reopen your terminal/IDE so `PATH` updates.
- Verify with:

```bash
codrag --version
```

## Security & Privacy

See:
- `SECURITY.md`
- `PRIVACY.md`
- `THREAT_MODEL.md`

## License

This repository is intended to be a public-facing MCP distribution surface.

The CoDRAG engine and commercial features may be distributed as signed binaries under a separate commercial license.
