export default function Page() {
  return (
    <main className="min-h-screen bg-background text-text">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <a href="/" className="text-sm text-text-muted">
          ← Home
        </a>

        <h1 className="mt-6 text-3xl font-bold tracking-tight">Security & Privacy</h1>
        <p className="mt-4 text-lg text-text-muted">
          CoDRAG is designed to be local-first. This page is a scaffold that will
          be expanded as the product stabilizes.
        </p>

        <div className="mt-10 space-y-6">
          <section className="rounded-lg border border-border bg-surface p-6">
            <h2 className="text-lg font-semibold">Local-first posture</h2>
            <div className="mt-2 text-sm text-text-muted">
              Indexes and configuration live on your machine by default.
            </div>
          </section>

          <section className="rounded-lg border border-border bg-surface p-6">
            <h2 className="text-lg font-semibold">Network behavior</h2>
            <div className="mt-2 text-sm text-text-muted">
              The system is intended to run on loopback by default. Any remote
              access and telemetry decisions should be explicit.
            </div>
          </section>

          <section className="rounded-lg border border-border bg-surface p-6">
            <h2 className="text-lg font-semibold">Reporting security issues</h2>
            <div className="mt-2 text-sm text-text-muted">
              Email{' '}
              <a className="underline" href="mailto:security@codrag.io">
                security@codrag.io
              </a>{' '}
              with details.
            </div>
          </section>
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <a
            href="/contact"
            className="inline-flex items-center rounded-md border border-border px-4 py-2 text-sm font-medium text-text"
          >
            Contact
          </a>
          <a
            href="https://docs.codrag.io"
            className="inline-flex items-center rounded-md border border-border px-4 py-2 text-sm font-medium text-text"
          >
            Read docs
          </a>
        </div>
      </div>
    </main>
  );
}
