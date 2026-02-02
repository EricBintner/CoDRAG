export default function Page() {
  return (
    <main className="min-h-screen bg-background text-text">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <a href="/" className="text-sm text-text-muted">
          ← Docs home
        </a>

        <h1 className="mt-6 text-3xl font-bold tracking-tight">Getting started</h1>
        <p className="mt-4 text-lg text-text-muted">
          This page is a scaffold. It will describe the minimal "trust loop" for
          evaluating CoDRAG.
        </p>

        <div className="mt-8 space-y-4 rounded-lg border border-border bg-surface p-6">
          <div>
            <div className="font-semibold">1) Add a project</div>
            <div className="mt-1 text-sm text-text-muted">
              Point CoDRAG at a repo or folder.
            </div>
          </div>
          <div>
            <div className="font-semibold">2) Build an index</div>
            <div className="mt-1 text-sm text-text-muted">
              Create a local semantic + keyword index.
            </div>
          </div>
          <div>
            <div className="font-semibold">3) Search</div>
            <div className="mt-1 text-sm text-text-muted">
              Find relevant files, symbols, and code chunks.
            </div>
          </div>
          <div>
            <div className="font-semibold">4) Generate context</div>
            <div className="mt-1 text-sm text-text-muted">
              Export a bounded context payload for an LLM.
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
