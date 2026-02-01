import type { SearchResult } from '../../types';
import { cn } from '../../lib/utils';
import { FileCode } from 'lucide-react';

export interface SearchResultRowProps {
  result: SearchResult;
  showScore?: boolean;
  onClick?: () => void;
  selected?: boolean;
  className?: string;
}

/**
 * SearchResultRow - Single search result display
 * 
 * Displays:
 * - File path (relative to project root)
 * - Preview snippet
 * - Score (optional)
 * - Line span info
 */
export function SearchResultRow({
  result,
  showScore = false,
  onClick,
  selected = false,
  className,
}: SearchResultRowProps) {
  return (
    <div
      className={cn(
        'group flex flex-col gap-2 p-3 rounded-lg border transition-all duration-200 cursor-pointer',
        selected 
          ? 'bg-surface-raised border-primary/50 shadow-sm' 
          : 'bg-surface border-border hover:bg-surface-raised hover:border-border-subtle',
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <FileCode className={cn("w-4 h-4 flex-shrink-0", selected ? "text-primary" : "text-text-subtle")} />
          <span className={cn("font-mono text-sm truncate", selected ? "text-primary font-medium" : "text-text")}>
            {result.source_path}
          </span>
          {result.span && (
            <span className="text-xs text-text-subtle bg-surface px-1.5 py-0.5 rounded border border-border">
              L{result.span.start_line}–{result.span.end_line}
            </span>
          )}
        </div>
        {showScore && (
          <span className={cn(
            "text-xs font-medium px-1.5 py-0.5 rounded",
            result.score > 0.8 ? "bg-success-muted/20 text-success" :
            result.score > 0.5 ? "bg-info-muted/20 text-info" :
            "bg-surface-raised text-text-muted"
          )}>
            {(result.score * 100).toFixed(0)}%
          </span>
        )}
      </div>
      
      {result.preview && (
        <p className="text-xs text-text-muted line-clamp-2 font-mono bg-surface-raised/50 p-2 rounded border border-border/50 group-hover:border-border transition-colors">
          {result.preview}
        </p>
      )}
    </div>
  );
}
