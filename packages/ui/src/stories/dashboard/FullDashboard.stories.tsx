import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Database, RefreshCw } from 'lucide-react';
import { IndexStatusCard } from '../../components/dashboard/IndexStatusCard';
import { BuildCard } from '../../components/dashboard/BuildCard';
import { SearchPanel } from '../../components/search/SearchPanel';
import { ContextOptionsPanel } from '../../components/search/ContextOptionsPanel';
import { SearchResultsList, SearchResult } from '../../components/search/SearchResultsList';
import { ChunkPreview } from '../../components/search/ChunkPreview';
import { ContextOutput } from '../../components/search/ContextOutput';

const meta: Meta = {
  title: 'Pages/Dashboard',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

const mockResults: SearchResult[] = [
  {
    doc: {
      id: '1',
      source_path: 'src/api/client.ts',
      section: 'ApiClient.fetch',
      content: `export class ApiClient {
  private baseUrl: string;
  
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }
  
  async fetch<T>(endpoint: string): Promise<T> {
    const res = await fetch(\`\${this.baseUrl}\${endpoint}\`);
    if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
    return res.json();
  }
}`,
    },
    score: 0.892,
  },
  {
    doc: {
      id: '2',
      source_path: 'src/api/errors.ts',
      section: 'handleApiError',
      content: `export function handleApiError(error: unknown): never {
  if (error instanceof ApiError) {
    console.error('API Error:', error.message);
    throw error;
  }
  throw new ApiError('Unknown error', 500);
}`,
    },
    score: 0.756,
  },
  {
    doc: {
      id: '3',
      source_path: 'src/utils/retry.ts',
      section: 'retryWithBackoff',
      content: `export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  let lastError: Error | undefined;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (e) {
      lastError = e as Error;
      await sleep(Math.pow(2, i) * 100);
    }
  }
  throw lastError;
}`,
    },
    score: 0.634,
  },
];

export const FullDashboard: StoryObj = {
  render: () => {
    const [repoRoot, setRepoRoot] = useState('/path/to/my-project');
    const [building, setBuilding] = useState(false);
    
    const [query, setQuery] = useState('');
    const [searchK, setSearchK] = useState(8);
    const [minScore, setMinScore] = useState(0.15);
    const [searchLoading, setSearchLoading] = useState(false);
    const [results, setResults] = useState<SearchResult[]>([]);
    const [selectedChunk, setSelectedChunk] = useState<SearchResult | null>(null);
    
    const [contextK, setContextK] = useState(5);
    const [maxChars, setMaxChars] = useState(6000);
    const [includeSources, setIncludeSources] = useState(true);
    const [includeScores, setIncludeScores] = useState(false);
    const [structured, setStructured] = useState(false);
    const [context, setContext] = useState('');

    const handleBuild = () => {
      setBuilding(true);
      setTimeout(() => setBuilding(false), 2000);
    };

    const handleSearch = () => {
      setSearchLoading(true);
      setTimeout(() => {
        setResults(mockResults);
        setSearchLoading(false);
      }, 800);
    };

    const handleGetContext = () => {
      setContext(`# Source: src/api/client.ts (score: 0.892)

export class ApiClient {
  private baseUrl: string;
  
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }
  
  async fetch<T>(endpoint: string): Promise<T> {
    const res = await fetch(\`\${this.baseUrl}\${endpoint}\`);
    if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
    return res.json();
  }
}

# Source: src/api/errors.ts (score: 0.756)

export function handleApiError(error: unknown): never {
  if (error instanceof ApiError) {
    console.error('API Error:', error.message);
    throw error;
  }
  throw new ApiError('Unknown error', 500);
}`);
    };

    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <header className="flex items-center justify-between">
            <h1 className="text-2xl font-bold flex items-center gap-2 text-text">
              <Database className="w-6 h-6" />
              Code Index Dashboard
            </h1>
            <button className="p-2 rounded hover:bg-surface-raised transition text-text-muted">
              <RefreshCw className="w-5 h-5" />
            </button>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <IndexStatusCard
              stats={{
                loaded: true,
                total_documents: 1234,
                model: 'nomic-embed-text',
                built_at: new Date().toISOString(),
              }}
              building={building}
            />
            <BuildCard
              repoRoot={repoRoot}
              onRepoRootChange={setRepoRoot}
              onBuild={handleBuild}
              building={building}
            />
          </div>

          <SearchPanel
            query={query}
            onQueryChange={setQuery}
            k={searchK}
            onKChange={setSearchK}
            minScore={minScore}
            onMinScoreChange={setMinScore}
            onSearch={handleSearch}
            loading={searchLoading}
          />

          <ContextOptionsPanel
            k={contextK}
            onKChange={setContextK}
            maxChars={maxChars}
            onMaxCharsChange={setMaxChars}
            includeSources={includeSources}
            onIncludeSourcesChange={setIncludeSources}
            includeScores={includeScores}
            onIncludeScoresChange={setIncludeScores}
            structured={structured}
            onStructuredChange={setStructured}
            onGetContext={handleGetContext}
            onCopyContext={() => navigator.clipboard.writeText(context)}
            hasContext={!!context}
            disabled={!query.trim()}
          />

          {results.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <SearchResultsList
                results={results}
                selectedId={selectedChunk?.doc.id}
                onSelect={setSelectedChunk}
              />
              <ChunkPreview
                content={selectedChunk?.doc.content}
                sourcePath={selectedChunk?.doc.source_path}
                section={selectedChunk?.doc.section}
              />
            </div>
          )}

          <ContextOutput
            context={context}
            meta={context ? { chunks: mockResults.map(r => ({ source_path: r.doc.source_path, section: r.doc.section, score: r.score, truncated: false })), total_chars: context.length, estimated_tokens: Math.floor(context.length / 4) } : null}
          />
        </div>
      </div>
    );
  },
};

export const EmptyState: StoryObj = {
  render: () => {
    const [repoRoot, setRepoRoot] = useState('');
    const [query, setQuery] = useState('');

    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <header className="flex items-center justify-between">
            <h1 className="text-2xl font-bold flex items-center gap-2 text-text">
              <Database className="w-6 h-6" />
              Code Index Dashboard
            </h1>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <IndexStatusCard
              stats={{ loaded: false }}
            />
            <BuildCard
              repoRoot={repoRoot}
              onRepoRootChange={setRepoRoot}
              onBuild={() => {}}
            />
          </div>

          <SearchPanel
            query={query}
            onQueryChange={setQuery}
            k={8}
            onKChange={() => {}}
            minScore={0.15}
            onMinScoreChange={() => {}}
            onSearch={() => {}}
            disabled
          />
        </div>
      </div>
    );
  },
};

export const BuildingState: StoryObj = {
  render: () => {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <header className="flex items-center justify-between">
            <h1 className="text-2xl font-bold flex items-center gap-2 text-text">
              <Database className="w-6 h-6" />
              Code Index Dashboard
            </h1>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <IndexStatusCard
              stats={{
                loaded: true,
                total_documents: 856,
                model: 'nomic-embed-text',
                built_at: new Date(Date.now() - 3600000).toISOString(),
              }}
              building={true}
            />
            <BuildCard
              repoRoot="/path/to/project"
              onRepoRootChange={() => {}}
              onBuild={() => {}}
              building={true}
            />
          </div>
        </div>
      </div>
    );
  },
};
