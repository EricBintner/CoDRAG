import { Settings, Activity, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
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
    <div className={cn(
      'rounded-lg border border-border bg-surface p-6',
      className
    )}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold flex items-center gap-2 text-text">
          <Activity className="w-5 h-5 text-primary" />
          LLM Services
        </h3>
        <div className="flex gap-2">
          {onTestConnection && (
            <button
              onClick={onTestConnection}
              className="px-3 py-1.5 text-xs font-medium rounded-md bg-surface-raised hover:bg-border text-text border border-border transition-colors"
            >
              Test Connection
            </button>
          )}
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="p-1.5 rounded-md hover:bg-surface-raised text-text-muted hover:text-text transition-colors"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      
      {/* Ollama */}
      <div className="mb-6 pb-6 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="font-medium text-text">Ollama</span>
            {status.ollama.connected ? (
              <CheckCircle className="w-4 h-4 text-success" />
            ) : (
              <XCircle className="w-4 h-4 text-error" />
            )}
          </div>
          <span className={cn(
            "text-xs px-2 py-0.5 rounded-full font-medium",
            status.ollama.connected 
              ? "bg-success-muted text-success" 
              : "bg-error-muted text-error"
          )}>
            {status.ollama.connected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
        
        <p className="text-xs font-mono text-text-subtle mb-3 bg-surface-raised px-2 py-1 rounded w-fit">
          {status.ollama.url}
        </p>
        
        {status.ollama.connected && status.ollama.models.length > 0 && (
          <div className="mt-3">
            <p className="text-xs font-medium text-text-muted mb-2">Available Models</p>
            <div className="flex flex-wrap gap-2">
              {status.ollama.models.map((model) => (
                <span 
                  key={model} 
                  className="text-xs px-2 py-1 rounded bg-surface-raised text-text border border-border"
                >
                  {model}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {!status.ollama.connected && (
          <div className="mt-3 flex items-start gap-2 text-xs text-error bg-error-muted/10 p-3 rounded-md border border-error-muted">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <p>Ollama is required for embeddings. Make sure it's running.</p>
          </div>
        )}
      </div>
      
      {/* CLaRa */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="font-medium text-text">CLaRa</span>
            {!status.clara.enabled ? (
              <span className="text-xs text-text-muted">(Disabled)</span>
            ) : status.clara.connected ? (
              <CheckCircle className="w-4 h-4 text-success" />
            ) : (
              <AlertCircle className="w-4 h-4 text-warning" />
            )}
          </div>
          {!status.clara.enabled ? (
            <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-surface-raised text-text-muted">
              Disabled
            </span>
          ) : (
            <span className={cn(
              "text-xs px-2 py-0.5 rounded-full font-medium",
              status.clara.connected 
                ? "bg-success-muted text-success" 
                : "bg-warning-muted text-warning"
            )}>
              {status.clara.connected ? 'Connected' : 'Not Connected'}
            </span>
          )}
        </div>
        
        <p className="text-xs font-mono text-text-subtle mb-2 bg-surface-raised px-2 py-1 rounded w-fit">
          {status.clara.url}
        </p>
        
        <p className="text-xs text-text-muted">
          Optional context compression service
        </p>
      </div>
    </div>
  );
}
