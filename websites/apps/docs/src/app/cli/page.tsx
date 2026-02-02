export default function Page() {
  return (
    <main className="min-h-screen bg-background text-text">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <a href="/" className="text-sm text-text-muted">
          ← Docs home
        </a>

        <h1 className="mt-6 text-3xl font-bold tracking-tight">CLI reference</h1>
        <p className="mt-4 text-lg text-text-muted">
          This page is a scaffold. It will be aligned with the repo CLI as it
          stabilizes.
        </p>

        <div className="mt-8 space-y-3 rounded-lg border border-border bg-surface p-6 text-sm text-text-muted">
          <div>Planned sections:</div>
          <div>- Installation and first run</div>
          <div>- Project management</div>
          <div>- Build / rebuild commands</div>
          <div>- Search and context export</div>
          <div>- Troubleshooting flags and logs</div>
        </div>
      </div>
    </main>
  );
}
