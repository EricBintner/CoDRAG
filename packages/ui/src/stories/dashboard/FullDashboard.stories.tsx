import type { Meta, StoryObj } from '@storybook/react';
import { useState, useMemo, useCallback } from 'react';
import { Database, RefreshCw, Network, Settings, FolderTree as FolderTreeIcon } from 'lucide-react';
import { Badge } from '@tremor/react';
import { IndexStatusCard } from '../../components/dashboard/IndexStatusCard';
import { BuildCard } from '../../components/dashboard/BuildCard';
import { LLMStatusWidget, type LLMServiceStatus } from '../../components/dashboard/index';
import { SearchPanel } from '../../components/search/SearchPanel';
import { ContextOptionsPanel } from '../../components/search/ContextOptionsPanel';
import { SearchResultsList } from '../../components/search/SearchResultsList';
import type { SearchResult } from '../../types';
import { ChunkPreview } from '../../components/search/ChunkPreview';
import { ContextOutput } from '../../components/search/ContextOutput';
import { FolderTree, sampleFileTree } from '../../components/project/index';
import { FolderTreePanel } from '../../components/project/FolderTreePanel';
import { PinnedTextFilesPanel, type PinnedTextFile } from '../../components/project/PinnedTextFilesPanel';
import { TraceGraph, TraceGraphMini, SymbolSearchInput, type TraceNode } from '../../components/trace/index';
import { ModularDashboard } from '../../components/layout/ModularDashboard';
import type { PanelDefinition } from '../../types/layout';
import { ProjectSettingsPanel } from '../../components/project/ProjectSettingsPanel';

const meta: Meta = {
  title: 'Dashboard/Layouts/FullDashboard',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

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

import { PANEL_REGISTRY } from '../../config/panelRegistry';

// Define panels for the story by extending the registry
const STORY_PANELS: PanelDefinition[] = [
  ...PANEL_REGISTRY,
  { id: 'trace-mini', title: 'Trace Index', icon: Network, minHeight: 6, defaultHeight: 8, category: 'status', closeable: true, resizable: false },
  { id: 'trace-explorer', title: 'Symbol Explorer', icon: Network, minHeight: 8, defaultHeight: 12, category: 'search', closeable: true },
];

// Recursive helper to find file name by path in the sample tree
const findFileName = (nodes: typeof sampleFileTree, targetPath: string, currentPath = ''): string | undefined => {
  for (const node of nodes) {
    const nodePath = currentPath ? `${currentPath}/${node.name}` : node.name;
    if (nodePath === targetPath) return node.name;
    if (node.children) {
      const found = findFileName(node.children, targetPath, nodePath);
      if (found) return found;
    }
  }
  return undefined;
};

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

    // RAG inclusion state (primary functionality)
    const [includedPaths, setIncludedPaths] = useState<Set<string>>(new Set(['src', 'docs']));

    const handleToggleInclude = useCallback((paths: string[], action: 'add' | 'remove') => {
      setIncludedPaths((prev) => {
        const next = new Set(prev);
        for (const path of paths) {
          if (action === 'remove') {
            next.delete(path);
          } else {
            next.add(path);
          }
        }
        return next;
      });
    }, []);

    // Pinned files state (secondary functionality for detail view)
    const [pinnedFiles, setPinnedFiles] = useState<PinnedTextFile[]>([]);

    const handlePinFile = useCallback((path: string) => {
      // Mock fetching file content
      const name = findFileName(sampleFileTree, path) || path.split('/').pop() || 'unknown';
      const newFile: PinnedTextFile = {
        id: path,
        path,
        name,
        content: `// Content for ${name}\n// Loaded from ${path}\n\nexport const ${name.replace(/\./g, '_')} = () => {\n  console.log("Hello from ${name}");\n};\n`
      };
      setPinnedFiles((files) => {
        if (files.some(f => f.id === path)) return files;
        return [...files, newFile];
      });
    }, []);

    const handleUnpin = useCallback((fileId: string) => {
      setPinnedFiles((files) => files.filter((f) => f.id !== fileId));
    }, []);

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

    const panelContent = useMemo(() => ({
      status: (
        <div className="p-4">
          <IndexStatusCard
            stats={{
              loaded: true,
              total_documents: 1234,
              model: 'nomic-embed-text',
              built_at: new Date().toISOString(),
              index_dir: 'LinuxBrain',
            }}
            building={building}
            bare
          />
        </div>
      ),
      build: (
        <div className="p-4">
          <BuildCard
            repoRoot={repoRoot}
            onRepoRootChange={setRepoRoot}
            onBuild={handleBuild}
            building={building}
            bare
          />
        </div>
      ),
      'llm-status': (
        <div className="p-4">
          <LLMStatusWidget services={sampleLLMServices} bare />
        </div>
      ),
      search: (
        <div className="p-4">
          <SearchPanel
            query={query}
            onQueryChange={setQuery}
            k={searchK}
            onKChange={setSearchK}
            minScore={minScore}
            onMinScoreChange={setMinScore}
            onSearch={handleSearch}
            loading={searchLoading}
            bare
          />
        </div>
      ),
      'context-options': (
        <div className="p-4">
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
            bare
          />
        </div>
      ),
      results: (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full overflow-hidden p-4">
          <div className="h-full overflow-y-auto min-h-0">
            <SearchResultsList
              results={results}
              selectedId={selectedChunk?.chunk_id}
              onSelect={setSelectedChunk}
            />
          </div>
          <div className="h-full overflow-y-auto min-h-0 border-l border-border pl-4">
            <ChunkPreview
              content={selectedChunk?.content}
              sourcePath={selectedChunk?.source_path}
              section={selectedChunk?.section}
              bare
            />
          </div>
        </div>
      ),
      'context-output': (
        <ContextOutput
          context={context}
          meta={context ? { chunks: [], total_chars: context.length, estimated_tokens: 100 } : null}
          bare
        />
      ),
      roots: (
        <div className="h-full p-0">
          <FolderTreePanel
            data={sampleFileTree}
            includedPaths={includedPaths}
            onToggleInclude={handleToggleInclude}
            className="h-full border-0 shadow-none"
            title="Index Scope"
            bare
          />
        </div>
      ),
      'file-tree': (
        <div className="h-full p-0">
          <FolderTreePanel
            data={sampleFileTree}
            includedPaths={includedPaths}
            onToggleInclude={handleToggleInclude}
            className="h-full border-0 shadow-none"
            title="Project Files"
            bare
          />
        </div>
      ),
      'pinned-files': (
        <div className="h-full p-0">
          <PinnedTextFilesPanel
            files={pinnedFiles}
            onUnpin={handleUnpin}
            className="h-full border-0 shadow-none"
            bare
          />
        </div>
      ),
      settings: (
         <div className="p-4">
           <ProjectSettingsPanel
             config={{
               include_globs: ['**/*.ts'],
               exclude_globs: ['**/node_modules/**'],
               max_file_bytes: 1024,
               trace: { enabled: true },
               auto_rebuild: { enabled: false }
             }}
             onChange={() => {}}
             onSave={() => {}}
             bare
           />
         </div>
      ),
      'trace-mini': (
        <div className="space-y-4 p-4">
          <div className="flex justify-between items-center">
            <Badge color="blue" size="xs">Pro</Badge>
          </div>
          <TraceGraphMini nodeCount={847} edgeCount={2341} />
        </div>
      ),
      'trace-explorer': (
        <div className="h-full flex flex-col p-4">
          <div className="mb-4">
            <SymbolSearchInput 
              value={symbolQuery}
              onChange={setSymbolQuery}
            />
          </div>
          <div className="flex-1 min-h-0">
            <TraceGraph 
              nodes={sampleTraceNodes} 
              edges={[]} 
              selectedNode={selectedTraceNode}
              onSelectNode={setSelectedTraceNode}
            />
          </div>
        </div>
      )
    }), [repoRoot, building, query, searchK, minScore, searchLoading, results, selectedChunk, contextK, maxChars, includeSources, includeScores, structured, context, symbolQuery, selectedTraceNode, includedPaths, pinnedFiles, handleToggleInclude, handleUnpin]);

    const panelDetails = useMemo(() => ({
      'llm-status': (
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Settings className="w-6 h-6" />
            LLM Settings
          </h2>
          <div className="p-4 bg-surface-raised rounded-lg border border-border">
            Mock AIModelsSettings content would go here.
          </div>
        </div>
      ),
      roots: (
        <div className="p-6 h-full flex flex-col">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <FolderTreeIcon className="w-6 h-6" />
            File Explorer
          </h2>
          <div className="flex-1 border border-border rounded-lg overflow-hidden">
            <FolderTree 
              data={sampleFileTree}
              includedPaths={includedPaths}
              onToggleInclude={handleToggleInclude}
              onNodeClick={(node, path) => {
                if (node.type === 'file') handlePinFile(path);
              }}
            />
          </div>
        </div>
      ),
      'file-tree': (
        <div className="p-6 h-full flex flex-col">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <FolderTreeIcon className="w-6 h-6" />
            File Explorer (Expanded)
          </h2>
          <div className="flex-1 border border-border rounded-lg overflow-hidden">
            <FolderTree 
              data={sampleFileTree}
              includedPaths={includedPaths}
              onToggleInclude={handleToggleInclude}
              onNodeClick={(node, path) => {
                if (node.type === 'file') handlePinFile(path);
              }}
            />
          </div>
        </div>
      )
    }), [includedPaths, handleToggleInclude, handlePinFile]);

    return (
      <div className="min-h-screen bg-background p-6">
        <ModularDashboard
          panelDefinitions={STORY_PANELS}
          panelContent={panelContent}
          panelDetails={panelDetails}
          storageKey="storybook_fulldashboard_layout"
          headerLeft={
            <h1 className="text-2xl font-bold flex items-center gap-2 text-text">
              <Database className="w-6 h-6" />
              Code Index Dashboard
            </h1>
          }
          headerRight={
            <button className="p-2 rounded hover:bg-surface-raised transition text-text-muted">
              <RefreshCw className="w-5 h-5" />
            </button>
          }
        />
      </div>
    );
  },
};

export const EmptyState: StoryObj = {
  render: () => {
    const panelContent = {
      status: (
        <div className="p-4">
          <IndexStatusCard stats={{ loaded: false }} bare />
        </div>
      ),
      build: (
        <div className="p-4">
          <BuildCard repoRoot="" onRepoRootChange={() => {}} onBuild={() => {}} bare />
        </div>
      ),
      search: (
        <div className="p-4">
          <SearchPanel
            query=""
            onQueryChange={() => {}}
            k={8}
            onKChange={() => {}}
            minScore={0.15}
            onMinScoreChange={() => {}}
            onSearch={() => {}}
            disabled
            bare
          />
        </div>
      ),
    };

    return (
      <div className="min-h-screen bg-background p-6">
        <ModularDashboard
          panelDefinitions={STORY_PANELS}
          panelContent={panelContent}
          storageKey="storybook_emptystate_layout"
          headerLeft={
            <h1 className="text-2xl font-bold flex items-center gap-2 text-text">
              <Database className="w-6 h-6" />
              Code Index Dashboard
            </h1>
          }
        />
      </div>
    );
  },
};
