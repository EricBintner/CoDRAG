const GITHUB_URL =
  process.env.NEXT_PUBLIC_CODRAG_GITHUB_URL ??
  'https://github.com/EricBintner/CoDRAG';

export default function Page() {
  return (
    <main className="min-h-screen bg-background text-text">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <a href="/" className="text-sm text-text-muted hover:text-text transition-colors">
          ← Home
        </a>

        <h1 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">Get in Touch</h1>
        <p className="mt-4 text-lg text-text-muted max-w-2xl">
          Whether you need help getting started, have a licensing question, or want to
          discuss an enterprise deployment, we&apos;re here.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-surface p-6">
            <div className="font-semibold text-text">Technical Support</div>
            <p className="mt-1 text-sm text-text-muted">
              Installation, configuration, and troubleshooting help.
            </p>
            <a className="mt-3 inline-block text-sm text-primary underline underline-offset-2" href="mailto:support@codrag.io">
              support@codrag.io
            </a>
          </div>

          <div className="rounded-xl border border-border bg-surface p-6">
            <div className="font-semibold text-text">Licensing &amp; Billing</div>
            <p className="mt-1 text-sm text-text-muted">
              License keys, upgrades, team plans, and invoicing.
            </p>
            <a className="mt-3 inline-block text-sm text-primary underline underline-offset-2" href="mailto:licenses@codrag.io">
              licenses@codrag.io
            </a>
          </div>

          <div className="rounded-xl border border-border bg-surface p-6">
            <div className="font-semibold text-text">Enterprise &amp; Sales</div>
            <p className="mt-1 text-sm text-text-muted">
              Air-gapped deployments, SSO/SCIM, custom terms, and volume licensing.
            </p>
            <a className="mt-3 inline-block text-sm text-primary underline underline-offset-2" href="mailto:enterprise@codrag.io">
              enterprise@codrag.io
            </a>
          </div>

          <div className="rounded-xl border border-border bg-surface p-6">
            <div className="font-semibold text-text">Security</div>
            <p className="mt-1 text-sm text-text-muted">
              Report vulnerabilities or request our security posture documentation.
            </p>
            <a className="mt-3 inline-block text-sm text-primary underline underline-offset-2" href="mailto:security@codrag.io">
              security@codrag.io
            </a>
          </div>
        </div>

        <div className="mt-10 rounded-xl border border-border bg-surface p-6">
          <div className="font-semibold text-text">Community &amp; Open Source</div>
          <p className="mt-1 text-sm text-text-muted">
            Follow development, report issues, and join the discussion on GitHub.
          </p>
          <a
            className="mt-3 inline-flex items-center gap-2 text-sm text-primary underline underline-offset-2"
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            {GITHUB_URL}
          </a>
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <a
            href="https://docs.codrag.io"
            className="inline-flex items-center rounded-md border border-border px-4 py-2 text-sm font-medium text-text hover:bg-surface transition-colors"
          >
            Documentation
          </a>
          <a
            href="https://support.codrag.io"
            className="inline-flex items-center rounded-md border border-border px-4 py-2 text-sm font-medium text-text hover:bg-surface transition-colors"
          >
            Support Portal
          </a>
          <a
            href="/pricing"
            className="inline-flex items-center rounded-md border border-border px-4 py-2 text-sm font-medium text-text hover:bg-surface transition-colors"
          >
            Pricing
          </a>
        </div>
      </div>
    </main>
  );
}
