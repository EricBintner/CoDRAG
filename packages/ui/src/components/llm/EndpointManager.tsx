import { useState } from 'react';
import { Card, Button, TextInput, Select, SelectItem, Badge } from '@tremor/react';
import { cn } from '../../lib/utils';
import type { SavedEndpoint, LLMProvider, EndpointTestResult } from '../../types';

export interface EndpointManagerProps {
  endpoints: SavedEndpoint[];
  onAdd: (endpoint: Omit<SavedEndpoint, 'id'>) => void;
  onEdit: (endpoint: SavedEndpoint) => void;
  onDelete: (id: string) => void;
  onTest: (endpoint: SavedEndpoint) => Promise<EndpointTestResult>;
  className?: string;
}

const PROVIDER_OPTIONS: { value: LLMProvider; label: string }[] = [
  { value: 'ollama', label: 'Ollama' },
  { value: 'openai', label: 'OpenAI' },
  { value: 'openai-compatible', label: 'OpenAI Compatible' },
  { value: 'anthropic', label: 'Anthropic (Claude)' },
];

export function EndpointManager({
  endpoints,
  onAdd,
  onEdit,
  onDelete,
  onTest,
  className,
}: EndpointManagerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, EndpointTestResult>>({});
  
  // Form state
  const [formName, setFormName] = useState('');
  const [formProvider, setFormProvider] = useState<LLMProvider>('ollama');
  const [formUrl, setFormUrl] = useState('');
  const [formApiKey, setFormApiKey] = useState('');

  const resetForm = () => {
    setFormName('');
    setFormProvider('ollama');
    setFormUrl('');
    setFormApiKey('');
    setShowAddForm(false);
    setEditingId(null);
  };

  const handleAdd = () => {
    if (!formName.trim() || !formUrl.trim()) return;
    onAdd({
      name: formName.trim(),
      provider: formProvider,
      url: formUrl.trim(),
      api_key: formApiKey.trim() || undefined,
    });
    resetForm();
  };

  const handleEdit = (ep: SavedEndpoint) => {
    setEditingId(ep.id);
    setFormName(ep.name);
    setFormProvider(ep.provider);
    setFormUrl(ep.url);
    setFormApiKey(ep.api_key || '');
    setShowAddForm(false);
  };

  const handleSaveEdit = () => {
    if (!editingId || !formName.trim() || !formUrl.trim()) return;
    onEdit({
      id: editingId,
      name: formName.trim(),
      provider: formProvider,
      url: formUrl.trim(),
      api_key: formApiKey.trim() || undefined,
    });
    resetForm();
  };

  const handleTest = async (ep: SavedEndpoint) => {
    setTestingId(ep.id);
    try {
      const result = await onTest(ep);
      setTestResults((prev) => ({ ...prev, [ep.id]: result }));
    } catch (err) {
      setTestResults((prev) => ({
        ...prev,
        [ep.id]: { success: false, message: 'Test failed' },
      }));
    }
    setTestingId(null);
  };

  const providerNeedsApiKey = (provider: LLMProvider) =>
    provider === 'openai' || provider === 'anthropic' || provider === 'openai-compatible';

  return (
    <Card className={cn('codrag-endpoint-manager', className)}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold">Saved Endpoints</h3>
          <p className="text-xs text-gray-500">Add endpoints for local or remote LLM servers</p>
        </div>
      </div>

      {/* Endpoint List */}
      <div className="space-y-2 mb-4">
        {endpoints.length === 0 ? (
          <p className="text-xs text-gray-400 py-4 text-center">No saved endpoints</p>
        ) : (
          endpoints.map((ep) => (
            <div
              key={ep.id}
              className="p-3 border rounded-lg hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
            >
              {editingId === ep.id ? (
                // Edit form inline
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <TextInput
                      placeholder="Display Name"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                    />
                    <Select
                      value={formProvider}
                      onValueChange={(val) => setFormProvider(val as LLMProvider)}
                    >
                      {PROVIDER_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </Select>
                  </div>
                  <TextInput
                    placeholder="Endpoint URL"
                    value={formUrl}
                    onChange={(e) => setFormUrl(e.target.value)}
                  />
                  {providerNeedsApiKey(formProvider) && (
                    <TextInput
                      placeholder="API Key"
                      type="password"
                      value={formApiKey}
                      onChange={(e) => setFormApiKey(e.target.value)}
                    />
                  )}
                  <div className="flex gap-2">
                    <Button size="xs" onClick={handleSaveEdit}>Save</Button>
                    <Button size="xs" variant="secondary" onClick={resetForm}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                // Display mode
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{ep.name}</span>
                      <Badge color="gray" size="xs">{ep.provider}</Badge>
                    </div>
                    <p className="text-xs text-gray-500 truncate">{ep.url}</p>
                    {testResults[ep.id] && (
                      <p
                        className={cn(
                          'text-xs mt-1',
                          testResults[ep.id].success ? 'text-green-600' : 'text-red-600'
                        )}
                      >
                        {testResults[ep.id].message}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1 ml-2">
                    <Button
                      size="xs"
                      variant="secondary"
                      onClick={() => handleTest(ep)}
                      loading={testingId === ep.id}
                    >
                      Test
                    </Button>
                    <Button
                      size="xs"
                      variant="secondary"
                      onClick={() => handleEdit(ep)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="xs"
                      variant="secondary"
                      color="red"
                      onClick={() => onDelete(ep.id)}
                    >
                      ×
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add New Endpoint */}
      {showAddForm ? (
        <div className="p-3 border border-dashed rounded-lg space-y-3">
          <h4 className="text-xs font-semibold">Add Endpoint</h4>
          <div className="grid grid-cols-2 gap-2">
            <TextInput
              placeholder="Display Name"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
            />
            <Select
              value={formProvider}
              onValueChange={(val) => setFormProvider(val as LLMProvider)}
            >
              {PROVIDER_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </Select>
          </div>
          <TextInput
            placeholder="Endpoint URL (e.g., http://localhost:11434)"
            value={formUrl}
            onChange={(e) => setFormUrl(e.target.value)}
          />
          {providerNeedsApiKey(formProvider) && (
            <TextInput
              placeholder="API Key"
              type="password"
              value={formApiKey}
              onChange={(e) => setFormApiKey(e.target.value)}
            />
          )}
          <div className="flex gap-2">
            <Button size="xs" onClick={handleAdd}>Save Endpoint</Button>
            <Button size="xs" variant="secondary" onClick={resetForm}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button
          size="xs"
          variant="secondary"
          onClick={() => setShowAddForm(true)}
          className="w-full"
          icon={() => (
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          )}
        >
          Add Endpoint
        </Button>
      )}
    </Card>
  );
}
