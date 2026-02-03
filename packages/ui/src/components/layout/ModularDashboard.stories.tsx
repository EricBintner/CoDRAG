import type { Meta, StoryObj } from '@storybook/react';
import { Database, Search, Settings2, Hammer, SlidersHorizontal, List, FileText, FolderTree as FolderTreeIcon } from 'lucide-react';
import { ModularDashboard } from './ModularDashboard';
import { IndexStatusCard } from '../dashboard/IndexStatusCard';
import { BuildCard } from '../dashboard/BuildCard';
import { SearchPanel } from '../search/SearchPanel';
import { ContextOptionsPanel } from '../search/ContextOptionsPanel';
import { ContextOutput } from '../search/ContextOutput';
import type { PanelDefinition } from '../../types/layout';

const meta: Meta<typeof ModularDashboard> = {
  title: 'Layout/ModularDashboard',
  component: ModularDashboard,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ModularDashboard>;

const samplePanelDefinitions: PanelDefinition[] = [
  { id: 'status', title: 'Index Status', icon: Database, minHeight: 2, defaultHeight: 2, category: 'status', closeable: true },
  { id: 'build', title: 'Build', icon: Hammer, minHeight: 2, defaultHeight: 2, category: 'status', closeable: true },
  { id: 'search', title: 'Search', icon: Search, minHeight: 2, defaultHeight: 3, category: 'search', closeable: false },
  { id: 'context-options', title: 'Context Options', icon: SlidersHorizontal, minHeight: 1, defaultHeight: 2, category: 'context', closeable: true },
  { id: 'results', title: 'Search Results', icon: List, minHeight: 2, defaultHeight: 4, category: 'search', closeable: true },
  { id: 'context-output', title: 'Context Output', icon: FileText, minHeight: 2, defaultHeight: 4, category: 'context', closeable: true },
  { id: 'roots', title: 'Index Roots', icon: FolderTreeIcon, minHeight: 2, defaultHeight: 5, category: 'config', closeable: true },
  { id: 'settings', title: 'Settings', icon: Settings2, minHeight: 2, defaultHeight: 4, category: 'config', closeable: true },
];

const mockPanelContent = {
  status: (
    <IndexStatusCard
      className="h-full"
      stats={{
        loaded: true,
        total_documents: 1234,
        model: 'all-MiniLM-L6-v2',
        built_at: '2 hours ago',
        embedding_dim: 384
      }}
    />
  ),
  build: (
    <BuildCard
      className="h-full"
      repoRoot="/Users/dev/projects/codrag"
      onRepoRootChange={() => {}}
      onBuild={() => {}}
    />
  ),
  search: (
    <SearchPanel
      className="h-full"
      query=""
      onQueryChange={() => {}}
      k={10}
      onKChange={() => {}}
      minScore={0.5}
      onMinScoreChange={() => {}}
      onSearch={() => {}}
    />
  ),
  'context-options': (
    <ContextOptionsPanel
      className="h-full"
      k={5}
      onKChange={() => {}}
      maxChars={4000}
      onMaxCharsChange={() => {}}
      includeSources={true}
      onIncludeSourcesChange={() => {}}
      includeScores={false}
      onIncludeScoresChange={() => {}}
      structured={false}
      onStructuredChange={() => {}}
      onGetContext={() => {}}
      onCopyContext={() => {}}
      hasContext={false}
      disabled={true}
    />
  ),
  results: (
    <div className="h-full p-4 text-center text-text-muted border border-dashed border-border rounded-lg flex items-center justify-center">
      Perform a search to see results
    </div>
  ),
  'context-output': (
    <ContextOutput
      className="h-full"
      context=""
      meta={null}
    />
  ),
  roots: (
    <div className="h-full p-4 text-sm text-text-muted rounded-lg border border-border bg-surface">
      File tree component would go here
    </div>
  ),
  settings: (
    <div className="h-full p-4 space-y-4 rounded-lg border border-border bg-surface">
      <div className="space-y-2">
        <label className="text-sm font-medium text-text">Include Globs</label>
        <textarea
          className="w-full bg-surface-raised border border-border rounded-md px-3 py-2 text-sm min-h-20"
          defaultValue="**/*.ts"
        />
      </div>
    </div>
  ),
};

export const Default: Story = {
  args: {
    panelDefinitions: samplePanelDefinitions,
    panelContent: mockPanelContent,
  },
  decorators: [
    (Story) => (
      <div className="p-6 min-h-screen bg-background text-text">
        <Story />
      </div>
    ),
  ],
};

export const WithHeaderContent: Story = {
  args: {
    panelDefinitions: samplePanelDefinitions,
    panelContent: mockPanelContent,
    headerLeft: (
      <h1 className="text-2xl font-bold flex items-center gap-2 text-text">
        <Database className="w-6 h-6" />
        Code Index Dashboard
      </h1>
    ),
    headerRight: (
      <div className="flex items-center gap-2">
        <select className="bg-surface-raised border border-border rounded-md px-3 py-2 text-sm text-text">
          <option>Light</option>
          <option>Dark</option>
        </select>
        <button className="p-2 rounded hover:bg-surface-raised text-text-muted">
          <Settings2 className="w-5 h-5" />
        </button>
      </div>
    ),
  },
  decorators: [
    (Story) => (
      <div className="p-6 min-h-screen bg-background text-text">
        <Story />
      </div>
    ),
  ],
};
