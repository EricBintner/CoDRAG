import { MarketingHero, FeatureBlocks } from '@codrag/ui';
import { Search, GitBranch, Zap, Lock, RefreshCw, Plug } from 'lucide-react';
import { DevMarketingHero } from './DevMarketingHero';

const codragFeatures = [
  {
    icon: <Search className="w-8 h-8" />,
    title: 'Semantic Search',
    description: 'Find code by meaning, not just keywords. Ask questions like "where does authentication happen?" and get accurate results.',
    badge: 'Core',
    highlight: true,
  },
  {
    icon: <GitBranch className="w-8 h-8" />,
    title: 'Trace Index',
    description: 'Understand code relationships. See imports, calls, and symbol dependencies at a glance.',
    badge: 'Pro',
  },
  {
    icon: <Zap className="w-8 h-8" />,
    title: 'Instant Context',
    description: 'Assemble LLM-ready context in under 200ms. Perfect chunks with citations, every time.',
  },
  {
    icon: <Lock className="w-8 h-8" />,
    title: 'Local-First',
    description: 'Your code never leaves your machine. No cloud, no telemetry, no compromises on privacy.',
    highlight: true,
  },
  {
    icon: <RefreshCw className="w-8 h-8" />,
    title: 'Auto-Rebuild',
    description: 'File watcher keeps your index fresh. Edit code, get updated search results instantly.',
  },
  {
    icon: <Plug className="w-8 h-8" />,
    title: 'MCP Integration',
    description: 'Works seamlessly with Cursor, Windsurf, and any MCP-compatible IDE.',
    badge: 'New',
  },
];

export default function Page() {
  const showDevToolbar = process.env.NODE_ENV !== 'production';

  return (
    <main className="min-h-screen bg-background text-text">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 space-y-24">
        {/* Hero Section */}
        {showDevToolbar ? <DevMarketingHero /> : <MarketingHero variant="split" />}

        {/* Features Section */}
        <section>
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-text sm:text-4xl">
              Everything you need for local context
            </h2>
            <p className="mt-4 text-lg text-text-muted">
              Built for privacy, speed, and deep understanding of your codebase.
            </p>
          </div>
          <FeatureBlocks features={codragFeatures} variant="cards" />
        </section>
      </div>
    </main>
  );
}
