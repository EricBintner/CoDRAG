import { Card, Badge, Button, Select, SelectItem } from '@tremor/react';
import { cn } from '../../lib/utils';
import type { SavedEndpoint, EndpointTestResult, ModelSource } from '../../types';

export interface ModelCardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  
  // Current config
  enabled?: boolean;
  source?: ModelSource;
  endpoint?: string;
  model?: string;
  
  // Endpoint options
  endpoints: SavedEndpoint[];
  onEndpointChange?: (endpointId: string) => void;
  
  // Model selection
  availableModels?: string[];
  onModelChange?: (model: string) => void;
  onRefreshModels?: () => void;
  loadingModels?: boolean;
  
  // HuggingFace download (optional)
  hfEnabled?: boolean;
  hfRepoId?: string;
  hfDownloaded?: boolean;
  hfDownloadProgress?: number;
  onHFDownload?: () => void;
  onSourceChange?: (source: ModelSource) => void;
  
  // Status
  status?: 'connected' | 'disconnected' | 'not-configured' | 'downloading';
  onTest?: () => void;
  testResult?: EndpointTestResult;
  testingConnection?: boolean;
  
  className?: string;
}

export function ModelCard({
  title,
  description,
  icon,
  source = 'endpoint',
  endpoint,
  model,
  endpoints,
  onEndpointChange,
  availableModels = [],
  onModelChange,
  onRefreshModels,
  loadingModels = false,
  hfEnabled = false,
  hfRepoId,
  hfDownloaded = false,
  hfDownloadProgress,
  onHFDownload,
  onSourceChange,
  status = 'not-configured',
  onTest,
  testResult,
  testingConnection = false,
  className,
}: ModelCardProps) {
  const isActive = status === 'connected';
  const isDownloading = status === 'downloading';
  
  const statusColor = {
    connected: 'green',
    disconnected: 'red',
    'not-configured': 'gray',
    downloading: 'blue',
  }[status] as 'green' | 'red' | 'gray' | 'blue';
  
  const statusLabel = {
    connected: 'Connected',
    disconnected: 'Disconnected',
    'not-configured': 'Not Configured',
    downloading: 'Downloading...',
  }[status];

  return (
    <Card className={cn(
      'codrag-model-card',
      isActive && 'ring-1 ring-green-500/50',
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {icon}
          <div>
            <h3 className="text-sm font-semibold">{title}</h3>
            <p className="text-xs text-gray-500">{description}</p>
          </div>
        </div>
        <Badge color={statusColor} size="xs">{statusLabel}</Badge>
      </div>
      
      {/* Source Toggle (if HF enabled) */}
      {hfEnabled && onSourceChange && (
        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex gap-2">
            <button
              onClick={() => onSourceChange('endpoint')}
              className={cn(
                'flex-1 px-3 py-2 text-xs rounded-md transition-colors',
                source === 'endpoint'
                  ? 'bg-white dark:bg-gray-700 shadow-sm font-medium'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              Use Endpoint
            </button>
            <button
              onClick={() => onSourceChange('huggingface')}
              className={cn(
                'flex-1 px-3 py-2 text-xs rounded-md transition-colors',
                source === 'huggingface'
                  ? 'bg-white dark:bg-gray-700 shadow-sm font-medium'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              Download from HF
            </button>
          </div>
        </div>
      )}
      
      {/* Endpoint Mode */}
      {source === 'endpoint' && (
        <div className="space-y-3">
          {/* Endpoint Selector */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Endpoint
            </label>
            <Select
              value={endpoint || ''}
              onValueChange={(val) => onEndpointChange?.(val)}
              placeholder="Select endpoint..."
            >
              {endpoints.map((ep) => (
                <SelectItem key={ep.id} value={ep.id}>
                  {ep.name} ({ep.provider})
                </SelectItem>
              ))}
            </Select>
          </div>
          
          {/* Model Selector */}
          {endpoint && (
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Model
              </label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Select
                    value={model || ''}
                    onValueChange={(val) => onModelChange?.(val)}
                    placeholder="Select model..."
                  >
                    {availableModels.map((m) => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </Select>
                </div>
                {onRefreshModels && (
                  <Button
                    size="xs"
                    variant="secondary"
                    onClick={onRefreshModels}
                    loading={loadingModels}
                    icon={() => (
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    )}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* HuggingFace Mode */}
      {source === 'huggingface' && hfEnabled && (
        <div className="space-y-3">
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium">Model</span>
              <code className="text-xs text-gray-500">{hfRepoId}</code>
            </div>
            
            {hfDownloaded ? (
              <div className="flex items-center gap-2 text-xs text-green-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Downloaded
              </div>
            ) : isDownloading ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span>Downloading...</span>
                  <span>{hfDownloadProgress ? `${Math.round(hfDownloadProgress * 100)}%` : '...'}</span>
                </div>
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 transition-all"
                    style={{ width: `${(hfDownloadProgress || 0) * 100}%` }}
                  />
                </div>
              </div>
            ) : (
              <Button
                size="xs"
                onClick={onHFDownload}
                icon={() => (
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                )}
              >
                Download
              </Button>
            )}
          </div>
        </div>
      )}
      
      {/* Test Connection */}
      {onTest && source === 'endpoint' && endpoint && (
        <div className="mt-4 pt-4 border-t">
          <Button
            size="xs"
            variant="secondary"
            onClick={onTest}
            loading={testingConnection}
            className="w-full"
          >
            Test Connection
          </Button>
          {testResult && (
            <div className={cn(
              'mt-2 p-2 rounded text-xs',
              testResult.success 
                ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
            )}>
              {testResult.message}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
