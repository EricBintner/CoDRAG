import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Database, RefreshCw } from 'lucide-react';
import { Grid, Col, Card, Title, Flex, Badge, Text } from '@tremor/react';
import { IndexStatusCard } from '../../components/dashboard/IndexStatusCard';
import { BuildCard } from '../../components/dashboard/BuildCard';
import { IndexStatsDisplay, LLMStatusCard, StatItem, type LLMServiceStatus } from '../../components/dashboard/index';
import { SearchPanel } from '../../components/search/SearchPanel';
import { ContextOptionsPanel } from '../../components/search/ContextOptionsPanel';
import { SearchResultsList } from '../../components/search/SearchResultsList';
import type { SearchResult } from '../../types';
import { ChunkPreview } from '../../components/search/ChunkPreview';
import { ContextOutput } from '../../components/search/ContextOutput';
import { FolderTree } from '../../components/project/FolderTree';
import { sampleFileTree } from '../../components/project/index';
import { TraceGraph, TraceGraphMini, SymbolSearchInput, type TraceNode } from '../../components/trace/index';

const meta: Meta = {
  title: 'Pages/Dashboard',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

const sampleIndexStats: StatItem[] = [
  { label: 'Total Files', value: 1234, change: '+12 today', trend: 'up' },
  { label: 'Chunks', value: 12904, change: '+847 today', trend: 'up' },
  { label: 'Embeddings', value: '768-dim', change: 'nomic-embed-text' },
  { label: 'Last Build', value: '2m ago', change: 'Auto-rebuild on' },
];

const sampleTraceNodes: TraceNode[] = [
  { id: '1', name: 'build_project', kind: 'symbol', language: 'Python', inDegree: 3, outDegree: 5 },
  { id: '2', name: 'IndexManager', kind: 'symbol', language: 'Python', inDegree: 8, outDegree: 12 },
  { id: '3', name: '/api/build', kind: 'endpoint', inDegree: 1, outDegree: 2 },
  { id: '4', name: 'server.py', kind: 'file', inDegree: 0, outDegree: 15 },
];

const sampleLLMServices: LLMServiceStatus[] = [
  { name: 'Ollama', url: 'localhost:11434', status: 'connected', type: 'ollama' },
  { name: 'CLaRa', status: 'disabled', type: 'clara' },
  { name: 'OpenAI', status: 'disconnected', type: 'openai' },
];

const mockResults: SearchResult[] = [
  {
    chunk_id: '1',
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
    preview: 'export class ApiClient { ... }',
    span: { start_line: 1, end_line: 15 },
    score: 0.892,
  },
  {
    chunk_id: '2',
    source_path: 'src/api/errors.ts',
    section: 'handleApiError',
    content: `export function handleApiError(error: unknown): never {
  if (error instanceof ApiError) {
    console.error('API Error:', error.message);
    throw error;
  }
  throw new ApiError('Unknown error', 500);
}`,
    preview: 'export function handleApiError(error: unknown): never { ... }',
    span: { start_line: 1, end_line: 10 },
    score: 0.756,
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
    const [selectedTraceNode, setSelectedTraceNode] = useState<string>('1');
    const [symbolQuery, setSymbolQuery] = useState('');
    
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
      setContext('# Source: src/api/client.ts ...');
    };

    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <header className="flex items-center justify-between">
            <h1 className="text-2xl font-bold flex items-center gap-2 text-text">
              <Database className="w-6 h-6" />
              Code Index Dashboard
            </h1>
            <button className="p-2 rounded hover:bg-surface-raised transition text-text-muted">
              <RefreshCw className="w-5 h-5" />
            </button>
          </header>

          <IndexStatsDisplay stats={sampleIndexStats} />

          <Grid numItems={1} numItemsLg={3} className="gap-6">
             {/* Left Column: Project & Search */}
             <Col numColSpan={1} numColSpanLg={2}>
               <div className="space-y-6">
                 {/* Project Status */}
                 <div className="space-y-4">
                   <IndexStatusCard
                    stats={{
                      loaded: true,
                      total_documents: 1234,
                      model: 'nomic-embed-text',
                      built_at: new Date().toISOString(),
                      index_dir: 'LinuxBrain',
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

                 {/* Search */}
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

                 {results.length > 0 && (
                   <SearchResultsList
                    results={results}
                    selectedId={selectedChunk?.chunk_id}
                    onSelect={setSelectedChunk}
                   />
                 )}
               </div>
             </Col>

             {/* Right Column: Files & Trace */}
             <Col>
               <div className="space-y-6">
                 {/* Folder Tree */}
                 <Card className="border border-border bg-surface shadow-sm">
                   <Flex justifyContent="between" alignItems="center" className="mb-4">
                     <Title className="text-text">Indexed Files</Title>
                     <Badge color="gray" size="xs">1,234 files</Badge>
                   </Flex>
                   <div className="max-h-[300px] overflow-y-auto -mx-2">
                     <FolderTree data={sampleFileTree} />
                   </div>
                 </Card>

                 {/* Trace Graph Mini */}
                 <Card className="border border-border bg-surface shadow-sm">
                   <Flex justifyContent="between" alignItems="center" className="mb-4">
                     <Title className="text-text">Trace Index</Title>
                     <Badge color="blue" size="xs">Pro</Badge>
                   </Flex>
                   <TraceGraphMini nodeCount={847} edgeCount={2341} />
                   <Text className="text-text-subtle text-xs mt-3">
                     Symbol relationships and import graph
                   </Text>
                 </Card>

                 {/* LLM Services */}
                 <LLMStatusCard services={sampleLLMServices} />

                 {/* Context Controls */}
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
               </div>
             </Col>
          </Grid>

          {/* Trace Details Row */}
          <Grid numItems={1} numItemsLg={2} className="gap-6">
            <Card className="border border-border bg-surface shadow-sm">
              <Title className="text-text mb-4">Symbol Explorer</Title>
              <div className="mb-6">
                <SymbolSearchInput 
                  value={symbolQuery}
                  onChange={setSymbolQuery}
                />
              </div>
              <TraceGraph 
                nodes={sampleTraceNodes} 
                edges={[]} 
                selectedNode={selectedTraceNode}
                onSelectNode={setSelectedTraceNode}
              />
            </Card>

            <div className="space-y-6">
               {selectedChunk && (
                 <ChunkPreview
                   content={selectedChunk.content}
                   sourcePath={selectedChunk.source_path}
                   section={selectedChunk.section}
                 />
               )}
               <ContextOutput
                 context={context}
                 meta={context ? { chunks: [], total_chars: context.length, estimated_tokens: 100 } : null}
               />
            </div>
          </Grid>
        </div>
      </div>
    );
  },
};

export const EmptyState: StoryObj = {
  render: () => {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <header className="flex items-center justify-between">
            <h1 className="text-2xl font-bold flex items-center gap-2 text-text">
              <Database className="w-6 h-6" />
              Code Index Dashboard
            </h1>
          </header>

          <Grid numItems={1} numItemsLg={3} className="gap-6">
            <Col numColSpan={1} numColSpanLg={2}>
              <div className="space-y-6">
                 <IndexStatusCard stats={{ loaded: false }} />
                 <BuildCard
                    repoRoot=""
                    onRepoRootChange={() => {}}
                    onBuild={() => {}}
                 />
                 <SearchPanel
                    query=""
                    onQueryChange={() => {}}
                    k={8}
                    onKChange={() => {}}
                    minScore={0.15}
                    onMinScoreChange={() => {}}
                    onSearch={() => {}}
                    disabled
                 />
              </div>
            </Col>
            <Col>
              {/* Empty right column */}
            </Col>
          </Grid>
        </div>
      </div>
    );
  },
};
