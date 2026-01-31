import { Card, Badge, Button } from '@tremor/react';
import { cn } from '../../lib/utils';
import type { TraceStatus } from '../../types';

export interface TraceStatusCardProps {
  status: TraceStatus;
  onEnableTrace?: () => void;
  onBuildTrace?: () => void;
  className?: string;
}

export function TraceStatusCard({
  status,
  onEnableTrace,
  onBuildTrace,
  className,
}: TraceStatusCardProps) {
  return (
    <Card className={cn('codrag-trace-status-card', className)}>
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold">Trace Index</h3>
          <p className="text-xs text-gray-500 mt-1">
            Structural index for symbols and imports
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {!status.enabled && (
            <Badge color="gray">Disabled</Badge>
          )}
          {status.enabled && !status.exists && (
            <Badge color="yellow">Not Built</Badge>
          )}
          {status.enabled && status.exists && !status.building && (
            <Badge color="green">Ready</Badge>
          )}
          {status.building && (
            <Badge color="blue">Building</Badge>
          )}
        </div>
      </div>

      {status.enabled && status.exists && (
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <p className="text-2xl font-bold">{status.counts.nodes.toLocaleString()}</p>
            <p className="text-xs text-gray-500">Nodes</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{status.counts.edges.toLocaleString()}</p>
            <p className="text-xs text-gray-500">Edges</p>
          </div>
        </div>
      )}

      {status.last_build_at && (
        <p className="mt-3 text-xs text-gray-500">
          Last built: {status.last_build_at}
        </p>
      )}

      {status.last_error && (
        <div className="mt-3 rounded bg-red-50 p-2 text-xs text-red-700 dark:bg-red-900/20 dark:text-red-400">
          {status.last_error}
        </div>
      )}

      <div className="mt-4 flex gap-2">
        {!status.enabled && onEnableTrace && (
          <Button size="xs" onClick={onEnableTrace}>
            Enable Trace
          </Button>
        )}
        {status.enabled && !status.building && onBuildTrace && (
          <Button size="xs" variant="secondary" onClick={onBuildTrace}>
            {status.exists ? 'Rebuild Trace' : 'Build Trace'}
          </Button>
        )}
      </div>
    </Card>
  );
}
