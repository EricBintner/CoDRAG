const RELEASES_URL =
  process.env.NEXT_PUBLIC_CODRAG_RELEASES_URL ??
  'https://github.com/EricBintner/CoDRAG/releases';

export default function Page() {
  return (
    <main className="min-h-screen bg-background text-text">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <a href="/" className="text-sm text-text-muted">
          ← Home
        </a>

        <h1 className="mt-6 text-3xl font-bold tracking-tight">Download</h1>
        <p className="mt-4 text-lg text-text-muted">
          Installers are not published yet. This page will host signed downloads
          and checksums.
        </p>

        <div className="mt-8 space-y-4 rounded-lg border border-border bg-surface p-6">
          <div>
            <div className="font-semibold">Current status</div>
            <div className="mt-1 text-sm text-text-muted">
              Pre-release.
            </div>
          </div>
          <div>
            <div className="font-semibold">Planned Platforms</div>
            <div className="mt-1 text-sm text-text-muted">
              We will support macOS (Homebrew, DMG), Windows (winget, MSI), and Linux (AppImage, deb, rpm).
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <a
            href={RELEASES_URL}
            className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-surface shadow-sm"
          >
            Releases
          </a>
          <a
            href="/pricing"
            className="inline-flex items-center rounded-md border border-border px-4 py-2 text-sm font-medium text-text"
          >
            Pricing
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
