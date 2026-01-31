import { Badge, Button } from '@tremor/react';
import { cn } from '../../lib/utils';
import type { WatchState, WatchStatus } from '../../types';

export interface WatchStatusIndicatorProps {
  status: WatchStatus;
  onRebuildNow?: () => void;
  showDetails?: boolean;
  className?: string;
}

const stateConfig: Record<WatchState, { label: string; color: 'gray' | 'blue' | 'yellow' | 'green' | 'orange' }> = {
  disabled: { label: 'Watch Off', color: 'gray' },
  idle: { label: 'Watching', color: 'green' },
  debouncing: { label: 'Changes Detected', color: 'yellow' },
  building: { label: 'Rebuilding', color: 'blue' },
  throttled: { label: 'Throttled', color: 'orange' },
};

export function WatchStatusIndicator({
  status,
  onRebuildNow,
  showDetails = false,
  className,
}: WatchStatusIndicatorProps) {
  const config = stateConfig[status.state];

  return (
    <div className={cn('codrag-watch-status', className)}>
      <div className="flex items-center gap-2">
        <Badge color={config.color}>{config.label}</Badge>
        
        {status.stale && status.state !== 'building' && (
          <Badge color="yellow">Stale</Badge>
        )}
        
        {status.pending && (
          <Badge color="blue">Pending</Badge>
        )}
      </div>

      {showDetails && (
        <div className="mt-2 space-y-1 text-xs text-gray-500">
          {status.pending_paths_count > 0 && (
            <p>{status.pending_paths_count} files changed since last build</p>
          )}
          
          {status.state === 'debouncing' && status.next_rebuild_at && (
            <p>Auto-rebuild scheduled</p>
          )}
          
          {status.last_rebuild_at && (
            <p>Last rebuild: {status.last_rebuild_at}</p>
          )}
        </div>
      )}

      {status.stale && status.state !== 'building' && onRebuildNow && (
        <Button
          size="xs"
          variant="secondary"
          onClick={onRebuildNow}
          className="mt-2"
        >
          Rebuild Now
        </Button>
      )}
    </div>
  );
}
