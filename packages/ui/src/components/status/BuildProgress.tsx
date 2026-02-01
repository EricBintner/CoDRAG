import { cn } from '../../lib/utils';
import { Loader2, FileText, Puzzle } from 'lucide-react';

export interface BuildProgressProps {
  phase: 'scanning' | 'chunking' | 'embedding' | 'writing' | 'complete';
  percent?: number;
  counts?: {
    files_total?: number;
    files_done?: number;
    chunks_total?: number;
    chunks_done?: number;
  };
  className?: string;
}

const phaseLabels: Record<BuildProgressProps['phase'], string> = {
  scanning: 'Scanning files...',
  chunking: 'Chunking code...',
  embedding: 'Generating embeddings...',
  writing: 'Writing index...',
  complete: 'Build complete',
};

/**
 * BuildProgress - Shows build progress with phase and counters
 * 
 * Displays:
 * - Current build phase
 * - Progress bar (when percent available)
 * - File/chunk counters (when available)
 */
export function BuildProgress({
  phase,
  percent,
  counts,
  className,
}: BuildProgressProps) {
  const displayPercent = percent ?? (phase === 'complete' ? 100 : undefined);
  const isComplete = phase === 'complete';
  
  return (
    <div className={cn(
      'rounded-lg border border-border bg-surface p-6 shadow-sm',
      className
    )}>
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-lg font-semibold text-text">Build Progress</h3>
        {!isComplete && (
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
        )}
      </div>
      
      <p className={cn(
        "text-sm font-medium mb-3",
        isComplete ? "text-success" : "text-text-muted"
      )}>
        {phaseLabels[phase]}
      </p>
      
      {displayPercent !== undefined && (
        <div className="w-full bg-surface-raised rounded-full h-2.5 mb-4 overflow-hidden border border-border-subtle">
          <div 
            className={cn(
              "h-2.5 rounded-full transition-all duration-500 ease-out",
              isComplete ? "bg-success" : "bg-primary"
            )}
            style={{ width: `${displayPercent}%` }}
          />
        </div>
      )}
      
      {counts && (
        <div className="flex gap-6 pt-2 border-t border-border-subtle">
          {counts.files_total !== undefined && (
            <div className="flex items-center gap-2 text-sm text-text-muted">
              <FileText className="w-4 h-4 text-text-subtle" />
              <span>
                Files: <span className="font-medium text-text">{counts.files_done ?? 0}</span> / {counts.files_total}
              </span>
            </div>
          )}
          {counts.chunks_total !== undefined && (
            <div className="flex items-center gap-2 text-sm text-text-muted">
              <Puzzle className="w-4 h-4 text-text-subtle" />
              <span>
                Chunks: <span className="font-medium text-text">{counts.chunks_done ?? 0}</span> / {counts.chunks_total}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
