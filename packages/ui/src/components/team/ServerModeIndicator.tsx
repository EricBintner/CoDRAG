import { cn } from '../../lib/utils';
import type { ServerStatus } from '../../types';
import { Globe, Lock, ShieldAlert, Wifi } from 'lucide-react';

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
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center gap-2 flex-wrap">
        <span className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border",
          isRemote 
            ? "bg-warning-muted/10 text-warning border-warning-muted/20" 
            : "bg-surface-raised text-text-muted border-border"
        )}>
          {isRemote ? <Globe className="w-3.5 h-3.5" /> : <Wifi className="w-3.5 h-3.5" />}
          {isRemote ? 'Remote Mode' : 'Local Mode'}
        </span>
        
        {isRemote && status.requires_auth && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-muted/10 text-success border border-success-muted/20">
            <Lock className="w-3.5 h-3.5" />
            Auth Required
          </span>
        )}
      </div>
      
      {isRemote && !status.requires_auth && showWarning && (
        <div className="rounded-md bg-error-muted/10 p-3 border border-error-muted/20">
          <div className="flex gap-2">
            <ShieldAlert className="w-4 h-4 text-error shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-error mb-1">Security Warning</p>
              <p className="text-error/90 text-xs">
                Server is accessible remotely without authentication. 
                Enable API key authentication for production use.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {status.bind_address && (
        <p className="text-xs text-text-subtle font-mono pl-1">
          Bound to: {status.bind_address}
        </p>
      )}
    </div>
  );
}
