export default function Page() {
  return (
    <main className="min-h-screen bg-background text-text">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <a href="/" className="text-sm text-text-muted">
          ← Docs home
        </a>

        <h1 className="mt-6 text-3xl font-bold tracking-tight">Dashboard UI</h1>
        <p className="mt-4 text-lg text-text-muted">
          This section will document how to use the CoDRAG dashboard to manage
          projects, builds, search, and context generation.
        </p>

        <div className="mt-8 space-y-3 rounded-lg border border-border bg-surface p-6 text-sm text-text-muted">
          <div>Planned topics:</div>
          <div>- Projects and include/exclude patterns</div>
          <div>- Build modes and index freshness</div>
          <div>- Search vs Context vs Trace</div>
          <div>- Output budgets and citations</div>
        </div>
      </div>
    </main>
  );
}
