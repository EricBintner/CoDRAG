const RELEASES_URL =
  process.env.NEXT_PUBLIC_CODRAG_RELEASES_URL ??
  'https://github.com/EricBintner/CoDRAG/releases';

export default function Page() {
  return (
    <main className="min-h-screen bg-background text-text">
      <div className="mx-auto max-w-4xl px-6 py-16">
        <a href="/" className="text-sm text-text-muted hover:text-text transition-colors">
          ← Home
        </a>

        <h1 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">
          Download CoDRAG
        </h1>
        <p className="mt-4 text-lg text-text-muted max-w-2xl">
          Get the context layer that makes your AI coding tools dramatically better.
          Free to start, runs entirely on your machine.
        </p>

        {/* Platform cards */}
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border-2 border-primary/50 bg-gradient-to-br from-primary/5 to-transparent p-6">
            <div className="text-sm font-semibold text-primary uppercase tracking-wide">macOS</div>
            <div className="mt-2 text-xl font-bold">CoDRAG for Mac</div>
            <div className="mt-2 text-sm text-text-muted">
              macOS 11+ (Apple Silicon & Intel). Native Tauri app with CLI + MCP server included.
            </div>
            <a
              href={RELEASES_URL}
              className="mt-4 inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-hover transition-colors"
            >
              Download .dmg
            </a>
          </div>

          <div className="rounded-xl border border-border bg-surface p-6">
            <div className="text-sm font-semibold text-text-muted uppercase tracking-wide">Windows</div>
            <div className="mt-2 text-xl font-bold">CoDRAG for Windows</div>
            <div className="mt-2 text-sm text-text-muted">
              Windows 10+. Native Tauri app with CLI + MCP server included.
            </div>
            <a
              href={RELEASES_URL}
              className="mt-4 inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-hover transition-colors"
            >
              Download .msi
            </a>
          </div>
        </div>

        {/* Quick start */}
        <div className="mt-12 rounded-xl border border-border bg-surface p-6">
          <h2 className="text-lg font-semibold">Quick Start</h2>
          <div className="mt-4 font-mono text-sm bg-background rounded-lg border border-border p-4 space-y-2">
            <div className="text-text-muted"># Start the daemon</div>
            <div className="text-success">$ codrag serve</div>
            <div className="text-text-muted mt-3"># Add your project</div>
            <div className="text-success">$ codrag add ./my-project --name &quot;MyApp&quot;</div>
            <div className="text-text-muted mt-3"># Connect to your AI tools via MCP</div>
            <div className="text-success">$ codrag mcp --auto</div>
          </div>
          <p className="mt-4 text-sm text-text-muted">
            Works with Cursor, Windsurf, VS Code, Claude Desktop, and any MCP-compatible editor.
          </p>
        </div>

        {/* What you get */}
        <div className="mt-12 space-y-4">
          <h2 className="text-lg font-semibold">What&apos;s Included</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-border bg-surface p-4">
              <div className="font-medium">Semantic Code Search</div>
              <div className="mt-1 text-sm text-text-muted">Natural-language search across all your projects in under 100ms.</div>
            </div>
            <div className="rounded-lg border border-border bg-surface p-4">
              <div className="font-medium">Structural Trace Index</div>
              <div className="mt-1 text-sm text-text-muted">Maps imports, calls, and symbol hierarchies — not just keywords.</div>
            </div>
            <div className="rounded-lg border border-border bg-surface p-4">
              <div className="font-medium">MCP Server</div>
              <div className="mt-1 text-sm text-text-muted">Native integration with Cursor, Windsurf, VS Code, and Claude Desktop.</div>
            </div>
            <div className="rounded-lg border border-border bg-surface p-4">
              <div className="font-medium">BYOK — No Token Markup</div>
              <div className="mt-1 text-sm text-text-muted">Bring your own Ollama. CoDRAG never charges you for AI tokens.</div>
            </div>
          </div>
        </div>

        {/* Verification + links */}
        <div className="mt-12 rounded-lg border border-border bg-surface p-6">
          <h2 className="text-lg font-semibold">Verification</h2>
          <p className="mt-2 text-sm text-text-muted">
            All releases are signed and include SHA-256 checksums. Verification
            instructions are included with each download and available in the{' '}
            <a href="https://docs.codrag.io" className="underline text-primary">documentation</a>.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <a
            href={RELEASES_URL}
            className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-hover transition-colors"
          >
            All Releases
          </a>
          <a
            href="/pricing"
            className="inline-flex items-center rounded-md border border-border px-4 py-2 text-sm font-medium text-text hover:bg-surface transition-colors"
          >
            Pricing
          </a>
          <a
            href="https://docs.codrag.io"
            className="inline-flex items-center rounded-md border border-border px-4 py-2 text-sm font-medium text-text hover:bg-surface transition-colors"
          >
            Documentation
          </a>
        </div>
      </div>
    </main>
  );
}
