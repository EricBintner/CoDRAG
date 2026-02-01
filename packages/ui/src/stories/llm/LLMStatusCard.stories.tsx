import type { Meta, StoryObj } from '@storybook/react';
import { LLMStatusCard } from '../../components/llm/LLMStatusCard';

const meta: Meta<typeof LLMStatusCard> = {
  title: 'Components/LLM/LLMStatusCard',
  component: LLMStatusCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof LLMStatusCard>;

export const Healthy: Story = {
  args: {
    status: {
      ollama: {
        url: 'http://localhost:11434',
        connected: true,
        models: ['nomic-embed-text', 'qwen3:4b-instruct', 'mistral'],
      },
      clara: {
        url: 'http://localhost:8765',
        enabled: true,
        connected: true,
      },
    },
    onTestConnection: () => {},
    onOpenSettings: () => {},
  },
};

export const OllamaDisconnected: Story = {
  args: {
    status: {
      ollama: {
        url: 'http://localhost:11434',
        connected: false,
        models: [],
      },
      clara: {
        url: 'http://localhost:8765',
        enabled: false,
        connected: false,
      },
    },
    onTestConnection: () => {},
    onOpenSettings: () => {},
  },
};

export const ClaraEnabledNotConnected: Story = {
  args: {
    status: {
      ollama: {
        url: 'http://localhost:11434',
        connected: true,
        models: ['nomic-embed-text'],
      },
      clara: {
        url: 'http://192.168.1.10:8765',
        enabled: true,
        connected: false,
      },
    },
    onTestConnection: () => {},
    onOpenSettings: () => {},
  },
};
