import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { AIModelsSettings } from '../../components/llm/AIModelsSettings';
import type {
  EndpointTestResult,
  LLMConfig,
  ModelSlotType,
  SavedEndpoint,
} from '../../types';

const meta: Meta<typeof AIModelsSettings> = {
  title: 'Dashboard/Widgets/Settings/AIModelsSettings',
  component: AIModelsSettings,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof AIModelsSettings>;

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const baseEndpoints: SavedEndpoint[] = [
  {
    id: 'local-ollama',
    name: 'Local Ollama',
    provider: 'ollama',
    url: 'http://localhost:11434',
  },
  {
    id: 'gpu-ollama',
    name: 'GPU Server',
    provider: 'ollama',
    url: 'http://192.168.1.100:11434',
  },
  {
    id: 'openai',
    name: 'OpenAI',
    provider: 'openai',
    url: 'https://api.openai.com/v1',
    api_key: '********',
  },
];

const baseConfig: LLMConfig = {
  embedding: {
    source: 'endpoint',
    endpoint_id: 'local-ollama',
    model: 'nomic-embed-text',
    hf_repo_id: 'nomic-ai/nomic-embed-text-v1.5',
    hf_downloaded: false,
    hf_download_progress: undefined,
  },
  small_model: {
    enabled: true,
    endpoint_id: 'local-ollama',
    model: 'qwen3:4b-instruct',
  },
  large_model: {
    enabled: true,
    endpoint_id: 'gpu-ollama',
    model: 'mistral',
  },
  clara: {
    enabled: false,
    source: 'huggingface',
    hf_downloaded: false,
    hf_download_progress: undefined,
    remote_url: undefined,
  },
  saved_endpoints: baseEndpoints,
};

export const Default: Story = {
  render: () => {
    const [config, setConfig] = useState<LLMConfig>(baseConfig);
    const [availableModels, setAvailableModels] = useState<Record<string, string[]>>({
      'local-ollama': ['nomic-embed-text', 'qwen3:4b-instruct', 'phi-3-mini'],
      'gpu-ollama': ['mistral', 'qwen3:30b-instruct', 'deepseek-coder-v2'],
      openai: ['gpt-4o-mini', 'gpt-4o'],
    });
    const [loadingModels, setLoadingModels] = useState<Record<string, boolean>>({});
    const [testingSlot, setTestingSlot] = useState<ModelSlotType | null>(null);
    const [testResults, setTestResults] = useState<Record<string, EndpointTestResult>>({});

    return (
      <AIModelsSettings
        config={config}
        onConfigChange={setConfig}
        availableModels={availableModels}
        loadingModels={loadingModels}
        testingSlot={testingSlot}
        testResults={testResults}
        onAddEndpoint={(ep) =>
          setConfig((prev) => ({
            ...prev,
            saved_endpoints: [
              ...prev.saved_endpoints,
              {
                id: `ep-${prev.saved_endpoints.length + 1}`,
                ...ep,
              },
            ],
          }))
        }
        onEditEndpoint={(endpoint) =>
          setConfig((prev) => ({
            ...prev,
            saved_endpoints: prev.saved_endpoints.map((e) => (e.id === endpoint.id ? endpoint : e)),
          }))
        }
        onDeleteEndpoint={(id) =>
          setConfig((prev) => ({
            ...prev,
            saved_endpoints: prev.saved_endpoints.filter((e) => e.id !== id),
          }))
        }
        onTestEndpoint={async (endpoint) => {
          await sleep(350);
          if (endpoint.provider === 'ollama') {
            return {
              success: true,
              message: 'Connected. Models loaded.',
              models: availableModels[endpoint.id] || [],
            };
          }
          if ((endpoint.provider === 'openai' || endpoint.provider === 'anthropic') && !endpoint.api_key) {
            return { success: false, message: 'Missing API key' };
          }
          return { success: true, message: 'Connected.' };
        }}
        onFetchModels={async (endpointId) => {
          setLoadingModels((prev) => ({ ...prev, [endpointId]: true }));
          await sleep(400);

          const modelsByEndpoint: Record<string, string[]> = {
            'local-ollama': ['nomic-embed-text', 'qwen3:4b-instruct', 'phi-3-mini'],
            'gpu-ollama': ['mistral', 'qwen3:30b-instruct', 'deepseek-coder-v2'],
            openai: ['gpt-4o-mini', 'gpt-4o'],
          };

          setAvailableModels((prev) => ({
            ...prev,
            [endpointId]: modelsByEndpoint[endpointId] || [],
          }));
          setLoadingModels((prev) => ({ ...prev, [endpointId]: false }));
          return modelsByEndpoint[endpointId] || [];
        }}
        onTestModel={async (slotType) => {
          setTestingSlot(slotType);
          await sleep(450);
          const result: EndpointTestResult = { success: true, message: 'Test succeeded.' };
          setTestResults((prev) => ({ ...prev, [slotType]: result }));
          setTestingSlot(null);
          return result;
        }}
        onHFDownload={(slotType) => {
          if (slotType === 'embedding') {
            setConfig((prev) => ({
              ...prev,
              embedding: {
                ...prev.embedding,
                source: 'huggingface',
                hf_downloaded: false,
                hf_download_progress: 0.35,
              },
            }));
            return;
          }

          setConfig((prev) => ({
            ...prev,
            clara: {
              ...prev.clara,
              enabled: true,
              source: 'huggingface',
              hf_downloaded: false,
              hf_download_progress: 0.2,
            },
          }));
        }}
      />
    );
  },
};

export const ClaraEnabledRemote: Story = {
  render: () => {
    const [config, setConfig] = useState<LLMConfig>({
      ...baseConfig,
      clara: {
        enabled: true,
        source: 'endpoint',
        remote_url: 'http://192.168.1.10:8765',
        hf_downloaded: false,
        hf_download_progress: undefined,
      },
    });

    return (
      <AIModelsSettings
        config={config}
        onConfigChange={setConfig}
        onAddEndpoint={() => {}}
        onEditEndpoint={() => {}}
        onDeleteEndpoint={() => {}}
        onTestEndpoint={async () => ({ success: true, message: 'Connected.' })}
        onFetchModels={async () => []}
        onTestModel={async () => ({ success: true, message: 'Test succeeded.' })}
        onHFDownload={() => {}}
      />
    );
  },
};
