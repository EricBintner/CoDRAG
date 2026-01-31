import { Badge, Callout } from '@tremor/react';
import { cn } from '../../lib/utils';
import type { ServerStatus } from '../../types';

export interface ServerModeIndicatorProps {
  status: ServerStatus;
  showWarning?: boolean;
  className?: string;
}

export function ServerModeIndicator({
  status,
  showWarning = true,
  className,
}: ServerModeIndicatorProps) {
  const isRemote = status.mode === 'remote';
  
  return (
    <div className={cn('codrag-server-mode', className)}>
      <Badge color={isRemote ? 'orange' : 'gray'}>
        {isRemote ? 'Remote Mode' : 'Local Mode'}
      </Badge>
      
      {isRemote && status.requires_auth && (
        <Badge color="green" className="ml-2">Auth Required</Badge>
      )}
      
      {isRemote && !status.requires_auth && showWarning && (
        <Callout title="Security Warning" color="red" className="mt-2">
          Server is accessible remotely without authentication. 
          Enable API key authentication for production use.
        </Callout>
      )}
      
      {status.bind_address && (
        <p className="text-xs text-gray-500 mt-1">
          Bound to: {status.bind_address}
        </p>
      )}
    </div>
  );
}
