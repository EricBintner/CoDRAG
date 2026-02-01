export default function Page() {
  return (
    <main className="min-h-screen bg-background text-text">
      <div className="mx-auto max-w-4xl px-6 py-16">
        <h1 className="text-4xl font-bold tracking-tight">CoDRAG</h1>
        <p className="mt-4 text-lg text-text-muted">
          Local-first semantic code search and codebase intelligence.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href="https://docs.codrag.io"
            className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-surface shadow-sm"
          >
            Read docs
          </a>
          <a
            href="https://support.codrag.io"
            className="inline-flex items-center rounded-md border border-border px-4 py-2 text-sm font-medium text-text"
          >
            Support
          </a>
        </div>
      </div>
    </main>
  );
}
