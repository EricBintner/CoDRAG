import { Badge, Callout, Button } from '@tremor/react';
import { cn } from '../../lib/utils';
import type { TeamConfigStatus as TeamConfigStatusType, TeamConfig } from '../../types';

export interface TeamConfigStatusProps {
  status: TeamConfigStatusType;
  config?: TeamConfig;
  onViewConfig?: () => void;
  onReapply?: () => void;
  className?: string;
}

const statusConfig: Record<TeamConfigStatusType, { label: string; color: 'gray' | 'green' | 'yellow' | 'red' }> = {
  none: { label: 'No Team Config', color: 'gray' },
  applied: { label: 'Team Config Applied', color: 'green' },
  overridden: { label: 'Local Overrides', color: 'yellow' },
  conflict: { label: 'Config Conflict', color: 'red' },
};

export function TeamConfigStatus({
  status,
  config,
  onViewConfig,
  onReapply,
  className,
}: TeamConfigStatusProps) {
  const { label, color } = statusConfig[status];
  
  return (
    <div className={cn('codrag-team-config-status', className)}>
      <div className="flex items-center gap-2">
        <Badge color={color}>{label}</Badge>
        
        {status !== 'none' && onViewConfig && (
          <Button size="xs" variant="secondary" onClick={onViewConfig}>
            View Config
          </Button>
        )}
      </div>
      
      {status === 'overridden' && (
        <Callout title="Local Settings Differ" color="yellow" className="mt-2">
          Your local project settings differ from the team configuration. 
          {onReapply && (
            <Button size="xs" className="mt-2" onClick={onReapply}>
              Re-apply Team Config
            </Button>
          )}
        </Callout>
      )}
      
      {status === 'conflict' && (
        <Callout title="Configuration Conflict" color="red" className="mt-2">
          The team configuration file has conflicts. Please resolve them manually.
        </Callout>
      )}
      
      {status === 'applied' && config && (
        <div className="mt-2 text-xs text-gray-500 space-y-1">
          <p>Embedding model: <code>{config.embedding_model}</code></p>
          <p>Trace enabled: {config.trace_enabled ? 'Yes' : 'No'}</p>
          <p>Include patterns: {config.include_globs.length}</p>
          <p>Exclude patterns: {config.exclude_globs.length}</p>
        </div>
      )}
    </div>
  );
}
