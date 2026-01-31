import { Card, Badge, Button } from '@tremor/react';
import { cn } from '../../lib/utils';
import type { LLMStatus } from '../../types';

export interface LLMStatusCardProps {
  status: LLMStatus;
  onTestConnection?: () => void;
  onOpenSettings?: () => void;
  className?: string;
}

export function LLMStatusCard({
  status,
  onTestConnection,
  onOpenSettings,
  className,
}: LLMStatusCardProps) {
  return (
    <Card className={cn('codrag-llm-status-card', className)}>
      <h3 className="text-sm font-semibold mb-4">LLM Services</h3>
      
      {/* Ollama */}
      <div className="mb-4 pb-4 border-b">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium">Ollama</span>
          <Badge color={status.ollama.connected ? 'green' : 'red'}>
            {status.ollama.connected ? 'Connected' : 'Disconnected'}
          </Badge>
        </div>
        <p className="text-xs text-gray-500">{status.ollama.url}</p>
        {status.ollama.connected && status.ollama.models.length > 0 && (
          <div className="mt-2">
            <p className="text-xs font-medium text-gray-500 mb-1">Available Models</p>
            <div className="flex flex-wrap gap-1">
              {status.ollama.models.map((model) => (
                <Badge key={model} size="xs" color="gray">{model}</Badge>
              ))}
            </div>
          </div>
        )}
        {!status.ollama.connected && (
          <p className="mt-2 text-xs text-red-600 dark:text-red-400">
            Ollama is required for embeddings. Make sure it's running.
          </p>
        )}
      </div>
      
      {/* CLaRa */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium">CLaRa</span>
          {!status.clara.enabled ? (
            <Badge color="gray">Disabled</Badge>
          ) : (
            <Badge color={status.clara.connected ? 'green' : 'yellow'}>
              {status.clara.connected ? 'Connected' : 'Not Connected'}
            </Badge>
          )}
        </div>
        <p className="text-xs text-gray-500">{status.clara.url}</p>
        <p className="text-xs text-gray-400 mt-1">
          Optional context compression service
        </p>
      </div>
      
      {/* Actions */}
      <div className="flex gap-2">
        {onTestConnection && (
          <Button size="xs" variant="secondary" onClick={onTestConnection}>
            Test Connection
          </Button>
        )}
        {onOpenSettings && (
          <Button size="xs" variant="secondary" onClick={onOpenSettings}>
            Settings
          </Button>
        )}
      </div>
    </Card>
  );
}
