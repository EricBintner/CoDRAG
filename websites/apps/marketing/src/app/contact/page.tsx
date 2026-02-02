const GITHUB_URL =
  process.env.NEXT_PUBLIC_CODRAG_GITHUB_URL ??
  'https://github.com/EricBintner/CoDRAG';

export default function Page() {
  return (
    <main className="min-h-screen bg-background text-text">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <a href="/" className="text-sm text-text-muted">
          ← Home
        </a>

        <h1 className="mt-6 text-3xl font-bold tracking-tight">Contact</h1>
        <p className="mt-4 text-lg text-text-muted">
          This page is the canonical contact surface for CoDRAG.
        </p>

        <div className="mt-8 space-y-3 rounded-lg border border-border bg-surface p-6">
          <div>
            <div className="text-sm font-medium text-text">Support</div>
            <a className="text-sm underline" href="mailto:support@codrag.io">
              support@codrag.io
            </a>
          </div>
          <div>
            <div className="text-sm font-medium text-text">Licensing</div>
            <a className="text-sm underline" href="mailto:licenses@codrag.io">
              licenses@codrag.io
            </a>
          </div>
          <div>
            <div className="text-sm font-medium text-text">Security</div>
            <a className="text-sm underline" href="mailto:security@codrag.io">
              security@codrag.io
            </a>
          </div>
          <div>
            <div className="text-sm font-medium text-text">GitHub</div>
            <a className="text-sm underline" href={GITHUB_URL}>
              {GITHUB_URL}
            </a>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <a
            href="https://docs.codrag.io"
            className="inline-flex items-center rounded-md border border-border px-4 py-2 text-sm font-medium text-text"
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
