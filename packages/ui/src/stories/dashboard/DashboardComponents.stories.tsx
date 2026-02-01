import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { IndexStatusCard } from '../../components/dashboard/IndexStatusCard';
import { BuildCard } from '../../components/dashboard/BuildCard';

// IndexStatusCard Stories
const indexStatusMeta: Meta<typeof IndexStatusCard> = {
  title: 'Components/Dashboard/IndexStatusCard',
  component: IndexStatusCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default indexStatusMeta;
type IndexStatusStory = StoryObj<typeof IndexStatusCard>;

export const Loaded: IndexStatusStory = {
  args: {
    stats: {
      loaded: true,
      total_documents: 1847,
      model: 'nomic-embed-text',
      built_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 min ago
      embedding_dim: 768,
    },
  },
};

export const NotLoaded: IndexStatusStory = {
  args: {
    stats: {
      loaded: false,
    },
  },
};

export const Building: IndexStatusStory = {
  args: {
    stats: {
      loaded: true,
      total_documents: 1234,
      model: 'nomic-embed-text',
      built_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    },
    building: true,
  },
};

export const WithError: IndexStatusStory = {
  args: {
    stats: {
      loaded: false,
    },
    lastError: 'Could not connect to Ollama at localhost:11434',
  },
};

// BuildCard Stories
export const BuildCardDefault: StoryObj<typeof BuildCard> = {
  render: () => {
    const [repoRoot, setRepoRoot] = useState('/Users/dev/my-project');
    return (
      <BuildCard
        repoRoot={repoRoot}
        onRepoRootChange={setRepoRoot}
        onBuild={() => console.log('Build triggered:', repoRoot)}
      />
    );
  },
};

export const BuildCardEmpty: StoryObj<typeof BuildCard> = {
  render: () => {
    const [repoRoot, setRepoRoot] = useState('');
    return (
      <BuildCard
        repoRoot={repoRoot}
        onRepoRootChange={setRepoRoot}
        onBuild={() => {}}
      />
    );
  },
};

export const BuildCardBuilding: StoryObj<typeof BuildCard> = {
  render: () => {
    const [repoRoot, setRepoRoot] = useState('/Volumes/Code/CoDRAG');
    return (
      <BuildCard
        repoRoot={repoRoot}
        onRepoRootChange={setRepoRoot}
        onBuild={() => {}}
        building={true}
      />
    );
  },
};

// Combined Dashboard Demo
export const DashboardDemo: StoryObj = {
  render: () => {
    const [repoRoot, setRepoRoot] = useState('/Volumes/Code/CoDRAG');
    const [building, setBuilding] = useState(false);

    const handleBuild = () => {
      setBuilding(true);
      setTimeout(() => setBuilding(false), 2000);
    };

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
        <IndexStatusCard
          stats={{
            loaded: true,
            total_documents: 2341,
            model: 'nomic-embed-text',
            built_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
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
    );
  },
};
