import { CheckCircle, AlertCircle, Loader2, Database, Box, Calendar, Activity } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface IndexStats {
  loaded: boolean;
  index_dir?: string;
  model?: string;
  built_at?: string;
  total_documents?: number;
  embedding_dim?: number;
}

export interface IndexStatusCardProps {
  stats: IndexStats;
  building?: boolean;
  lastError?: string | null;
  className?: string;
}

/**
 * IndexStatusCard - Shows the current state of the code index.
 * 
 * Displays:
 * - Loaded status with icon
 * - Total documents indexed
 * - Embedding model name
 * - Last build timestamp
 * - Building spinner when index is being built
 * - Error message if last build failed
 */
export function IndexStatusCard({
  stats,
  building = false,
  lastError,
  className,
}: IndexStatusCardProps) {
  return (
    <div className={cn(
      'rounded-lg border border-border bg-surface p-6 shadow-sm',
      className
    )}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-text flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          Index Status
        </h2>
        {stats.loaded ? (
          <span className="flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full bg-success-muted/10 text-success border border-success-muted/20">
            <CheckCircle className="w-3.5 h-3.5" />
            Active
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full bg-warning-muted/10 text-warning border border-warning-muted/20">
            <AlertCircle className="w-3.5 h-3.5" />
            Inactive
          </span>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 rounded-md bg-surface-raised border border-border">
          <div className="flex items-center gap-2.5 text-sm text-text-muted">
            <Database className="w-4 h-4 text-text-subtle" />
            Documents
          </div>
          <span className="text-sm font-medium text-text">
            {stats.total_documents?.toLocaleString() ?? '-'}
          </span>
        </div>

        <div className="flex items-center justify-between p-3 rounded-md bg-surface-raised border border-border">
          <div className="flex items-center gap-2.5 text-sm text-text-muted">
            <Box className="w-4 h-4 text-text-subtle" />
            Model
          </div>
          <span className="text-sm font-medium text-text truncate max-w-[150px]" title={stats.model}>
            {stats.model ?? '-'}
          </span>
        </div>

        <div className="flex items-center justify-between p-3 rounded-md bg-surface-raised border border-border">
          <div className="flex items-center gap-2.5 text-sm text-text-muted">
            <Calendar className="w-4 h-4 text-text-subtle" />
            Built
          </div>
          <span className="text-sm font-medium text-text truncate max-w-[150px]">
            {stats.built_at
              ? new Date(stats.built_at).toLocaleString()
              : '-'}
          </span>
        </div>

        {building && (
          <div className="flex items-center gap-2 text-primary bg-primary-muted/10 p-3 rounded-md border border-primary/20 animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm font-medium">Building Index...</span>
          </div>
        )}

        {lastError && (
          <div className="flex gap-2 p-3 rounded-md bg-error-muted/10 border border-error-muted/20 text-error">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="text-sm font-medium break-all">
              {lastError}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
