export default function Page() {
  return (
    <main className="min-h-screen bg-background text-text">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <a href="/" className="text-sm text-text-muted">
          ← Docs home
        </a>

        <h1 className="mt-6 text-3xl font-bold tracking-tight">Troubleshooting</h1>
        <p className="mt-4 text-lg text-text-muted">
          Quick fixes for common setup problems.
        </p>

        <div className="mt-8 space-y-4 rounded-lg border border-border bg-surface p-6">
          <div>
            <div className="font-semibold">Ollama not running</div>
            <div className="mt-1 text-sm text-text-muted">
              Confirm the service is installed and reachable.
            </div>
          </div>
          <div>
            <div className="font-semibold">Build failures</div>
            <div className="mt-1 text-sm text-text-muted">
              Check logs and verify include/exclude patterns.
            </div>
          </div>
          <div>
            <div className="font-semibold">Slow performance</div>
            <div className="mt-1 text-sm text-text-muted">
              Reduce scope, tune chunking, and re-run builds.
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
