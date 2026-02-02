export default function Page() {
  return (
    <main className="min-h-screen bg-background text-text">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <a href="/" className="text-sm text-text-muted">
          ← Docs home
        </a>

        <h1 className="mt-6 text-3xl font-bold tracking-tight">MCP integration</h1>
        <p className="mt-4 text-lg text-text-muted">
          This page will document how to connect CoDRAG to IDEs like Cursor and
          Windsurf using MCP.
        </p>

        <div className="mt-8 space-y-3 rounded-lg border border-border bg-surface p-6 text-sm text-text-muted">
          <div>Planned sections:</div>
          <div>- Local server requirements</div>
          <div>- MCP configuration</div>
          <div>- Common integration patterns</div>
          <div>- Privacy and network boundaries</div>
        </div>
      </div>
    </main>
  );
}
