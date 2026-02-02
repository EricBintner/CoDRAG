export default function Page() {
  return (
    <main className="min-h-screen bg-background text-text">
      <div className="mx-auto max-w-4xl px-6 py-16">
        <a href="/" className="text-sm text-text-muted">
          ← Home
        </a>

        <h1 className="mt-6 text-3xl font-bold tracking-tight">Pricing</h1>
        <p className="mt-4 text-lg text-text-muted">
          Pricing is a placeholder while the product ships. This page exists so
          the site has a stable URL and clear intent.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-border bg-surface p-5 shadow-sm">
            <div className="text-sm font-medium text-text-muted">Free</div>
            <div className="mt-2 text-2xl font-bold">$0</div>
            <div className="mt-3 text-sm text-text-muted">
              Evaluate the loop on a small number of projects.
            </div>
          </div>

          <div className="rounded-lg border border-border bg-surface p-5 shadow-sm">
            <div className="text-sm font-medium text-text-muted">Pro</div>
            <div className="mt-2 text-2xl font-bold">Perpetual</div>
            <div className="mt-3 text-sm text-text-muted">
              Unlimited projects and advanced context tooling.
            </div>
          </div>

          <div className="rounded-lg border border-border bg-surface p-5 shadow-sm">
            <div className="text-sm font-medium text-text-muted">Team</div>
            <div className="mt-2 text-2xl font-bold">Per seat</div>
            <div className="mt-3 text-sm text-text-muted">
              Centralized configuration and shared standards.
            </div>
          </div>

          <div className="rounded-lg border border-border bg-surface p-5 shadow-sm">
            <div className="text-sm font-medium text-text-muted">Enterprise</div>
            <div className="mt-2 text-2xl font-bold">Custom</div>
            <div className="mt-3 text-sm text-text-muted">
              Air-gapped environments and procurement-ready terms.
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <a
            href="https://payments.codrag.io"
            className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-surface shadow-sm"
          >
            Purchase / licensing
          </a>
          <a
            href="/security"
            className="inline-flex items-center rounded-md border border-border px-4 py-2 text-sm font-medium text-text"
          >
            Security & privacy
          </a>
          <a
            href="/contact"
            className="inline-flex items-center rounded-md border border-border px-4 py-2 text-sm font-medium text-text"
          >
            Contact
          </a>
        </div>
      </div>
    </main>
  );
}
