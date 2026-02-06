export default function Page() {
  return (
    <main className="min-h-screen bg-background text-text">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <a href="/" className="text-sm text-text-muted hover:text-text transition-colors">
          ← Home
        </a>

        <h1 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">Security &amp; Privacy</h1>
        <p className="mt-4 text-lg text-text-muted max-w-2xl">
          CoDRAG was built from the ground up so your source code never has to leave
          your machine. Here&apos;s exactly how we protect it.
        </p>

        <div className="mt-10 space-y-6">
          <section className="rounded-xl border border-border bg-surface p-6">
            <h2 className="text-lg font-semibold">Your Code Never Leaves Your Machine</h2>
            <p className="mt-2 text-sm text-text-muted leading-relaxed">
              CoDRAG runs entirely on localhost. Indexes, embeddings, and configuration are
              stored locally in <code className="text-xs bg-surface-raised px-1 py-0.5 rounded">~/.local/share/codrag</code> (or
              in-project via embedded mode). There is no cloud component, no server-side
              processing, and no mechanism to upload source code.
            </p>
          </section>

          <section className="rounded-xl border border-border bg-surface p-6">
            <h2 className="text-lg font-semibold">No Telemetry, No Analytics</h2>
            <p className="mt-2 text-sm text-text-muted leading-relaxed">
              CoDRAG does not collect usage data, crash reports, or analytics of any kind.
              The application makes no outbound network requests except:
            </p>
            <ul className="mt-3 space-y-2 text-sm text-text-muted">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5 font-bold">&bull;</span>
                <span><strong>Ollama</strong> (localhost by default) for generating embeddings with your own model</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5 font-bold">&bull;</span>
                <span><strong>License activation</strong> (one-time key exchange via <code className="text-xs bg-surface-raised px-1 py-0.5 rounded">api.codrag.io</code>)</span>
              </li>
            </ul>
            <p className="mt-3 text-sm text-text-muted">
              Both connections are optional and can be fully disabled for air-gapped environments.
            </p>
          </section>

          <section className="rounded-xl border border-border bg-surface p-6">
            <h2 className="text-lg font-semibold">Network Isolation</h2>
            <p className="mt-2 text-sm text-text-muted leading-relaxed">
              The CoDRAG daemon binds to <code className="text-xs bg-surface-raised px-1 py-0.5 rounded">127.0.0.1:8400</code> by
              default. Remote access requires an explicit configuration change. Enterprise
              deployments support full air-gapped operation with no external network
              dependencies.
            </p>
          </section>

          <section className="rounded-xl border border-border bg-surface p-6">
            <h2 className="text-lg font-semibold">BYOK &mdash; Bring Your Own Keys</h2>
            <p className="mt-2 text-sm text-text-muted leading-relaxed">
              CoDRAG uses your own Ollama instance for embeddings. We never proxy API
              calls, never store API keys, and never add markup to token costs. Your AI
              infrastructure stays under your control.
            </p>
          </section>

          <section className="rounded-xl border border-border bg-surface p-6">
            <h2 className="text-lg font-semibold">Offline License Verification</h2>
            <p className="mt-2 text-sm text-text-muted leading-relaxed">
              License activation requires a single online key exchange. After activation,
              CoDRAG stores a signed Ed25519 license file locally and verifies it offline.
              No periodic phone-home, no subscription heartbeat.
            </p>
          </section>

          <section className="rounded-xl border border-border bg-surface p-6">
            <h2 className="text-lg font-semibold">Signed Releases</h2>
            <p className="mt-2 text-sm text-text-muted leading-relaxed">
              All installers are code-signed and include SHA-256 checksums. Verification
              instructions are published alongside every release.
            </p>
          </section>

          <section className="rounded-xl border border-border bg-surface p-6">
            <h2 className="text-lg font-semibold">Reporting Security Issues</h2>
            <p className="mt-2 text-sm text-text-muted leading-relaxed">
              If you discover a security vulnerability, please report it responsibly to{' '}
              <a className="underline text-primary" href="mailto:security@codrag.io">
                security@codrag.io
              </a>.
              We aim to acknowledge reports within 48 hours and will coordinate disclosure
              timelines with you.
            </p>
          </section>
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <a
            href="/contact"
            className="inline-flex items-center rounded-md border border-border px-4 py-2 text-sm font-medium text-text hover:bg-surface transition-colors"
          >
            Contact
          </a>
          <a
            href="https://docs.codrag.io"
            className="inline-flex items-center rounded-md border border-border px-4 py-2 text-sm font-medium text-text hover:bg-surface transition-colors"
          >
            Documentation
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
