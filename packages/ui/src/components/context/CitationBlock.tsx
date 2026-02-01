import { cn } from '../../lib/utils';

export interface CitationBlockProps {
  sourcePath: string;
  span?: {
    start_line: number;
    end_line: number;
  };
  score?: number;
  showScore?: boolean;
  className?: string;
}

/**
 * CitationBlock - Source attribution for context chunks
 * 
 * Displays:
 * - Source file path
 * - Line range (when available)
 * - Relevance score (optional)
 */
export function CitationBlock({
  sourcePath,
  span,
  score,
  showScore = false,
  className,
}: CitationBlockProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 text-sm',
        'px-3 py-2 bg-surface-raised border border-border rounded-md',
        'font-mono text-text-muted',
        className
      )}
    >
      <span className="text-text font-medium truncate max-w-[300px]" title={sourcePath}>
        {sourcePath}
      </span>
      {span && (
        <span className="text-text-subtle">
          :{span.start_line}–{span.end_line}
        </span>
      )}
      {showScore && score !== undefined && (
        <span className="ml-auto text-xs px-1.5 py-0.5 rounded bg-surface border border-border text-text-subtle">
          {(score * 100).toFixed(0)}%
        </span>
      )}
    </div>
  );
}
