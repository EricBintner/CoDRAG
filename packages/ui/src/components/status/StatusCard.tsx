import type { StatusState } from '../../types';
import { StatusBadge } from './StatusBadge';
import { cn } from '../../lib/utils';
import { AlertTriangle, Clock, Database } from 'lucide-react';

export interface StatusCardProps {
  projectName: string;
  status: StatusState;
  lastBuildAt?: string;
  chunkCount?: number;
  error?: {
    code: string;
    message: string;
    hint?: string;
  };
  className?: string;
}

/**
 * StatusCard - Project index status overview
 * 
 * Displays:
 * - Project name and status badge
 * - Last build timestamp
 * - Chunk count (when indexed)
 * - Error details (when applicable)
 */
export function StatusCard({
  projectName,
  status,
  lastBuildAt,
  chunkCount,
  error,
  className,
}: StatusCardProps) {
  return (
    <div className={cn('rounded-lg border border-border bg-surface p-6 shadow-sm', className)}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-text">{projectName}</h3>
          
          <div className="mt-2 space-y-1">
            {lastBuildAt && (
              <div className="flex items-center gap-2 text-xs text-text-muted">
                <Clock className="w-3.5 h-3.5" />
                <span>Last build: {lastBuildAt}</span>
              </div>
            )}
            {chunkCount !== undefined && status === 'fresh' && (
              <div className="flex items-center gap-2 text-xs text-text-muted">
                <Database className="w-3.5 h-3.5" />
                <span>{chunkCount.toLocaleString()} chunks indexed</span>
              </div>
            )}
          </div>
        </div>
        <StatusBadge status={status} />
      </div>
      
      {error && status === 'error' && (
        <div className="mt-4 p-3 rounded-md bg-error-muted/10 border border-error-muted/20">
          <div className="flex gap-2">
            <AlertTriangle className="w-4 h-4 text-error shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-error">
                {error.code}: {error.message}
              </p>
              {error.hint && (
                <p className="mt-1 text-error/80 text-xs">
                  {error.hint}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
