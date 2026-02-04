import type { Meta, StoryObj } from '@storybook/react';
import { IndexStatusCard } from '../../components/dashboard/IndexStatusCard';

// IndexStatusCard Stories
const indexStatusMeta: Meta<typeof IndexStatusCard> = {
  title: 'Dashboard/Widgets/IndexStatusCard',
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

