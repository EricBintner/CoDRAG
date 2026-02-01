import { cn } from '../../lib/utils';
import { FileText, Hash } from 'lucide-react';

export interface SearchResult {
  doc: {
    id: string;
    source_path: string;
    section: string;
    content: string;
  };
  score: number;
}

export interface SearchResultsListProps {
  results: SearchResult[];
  selectedId?: string | null;
  onSelect: (result: SearchResult) => void;
  className?: string;
}

/**
 * SearchResultsList - Displays search results with selection state.
 * 
 * Features:
 * - Clickable result rows with hover state
 * - Selected state highlight
 * - Score badge
 * - Source path and section display
 */
export function SearchResultsList({
  results,
  selectedId,
  onSelect,
  className,
}: SearchResultsListProps) {
  if (results.length === 0) {
    return null;
  }

  return (
    <div className={cn('space-y-3', className)}>
      <h3 className="text-sm font-semibold text-text flex items-center gap-2">
        Results
        <span className="px-1.5 py-0.5 rounded-full bg-surface-raised text-xs text-text-muted border border-border">
          {results.length}
        </span>
      </h3>
      <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
        {results.map((result, index) => (
          <div
            key={result.doc.id}
            onClick={() => onSelect(result)}
            className={cn(
              'group p-3 rounded-md cursor-pointer transition-all border text-left',
              selectedId === result.doc.id
                ? 'bg-primary-muted/10 border-primary text-primary shadow-sm'
                : 'bg-surface border-border hover:border-primary/50 hover:shadow-sm'
            )}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2 min-w-0">
                <span className={cn(
                  "text-xs font-mono px-1.5 py-0.5 rounded border",
                  selectedId === result.doc.id
                    ? "bg-primary text-white border-primary" 
                    : "bg-surface-raised text-text-muted border-border"
                )}>
                  #{index + 1}
                </span>
                <span className={cn(
                  "text-xs font-medium px-1.5 py-0.5 rounded",
                  result.score > 0.8 ? "bg-success-muted/20 text-success" :
                  result.score > 0.5 ? "bg-info-muted/20 text-info" :
                  "bg-surface-raised text-text-muted"
                )}>
                  {result.score.toFixed(3)}
                </span>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <FileText className={cn(
                "w-4 h-4 mt-0.5 shrink-0", 
                selectedId === result.doc.id ? "text-primary" : "text-text-subtle"
              )} />
              <div className="min-w-0 flex-1">
                <div className={cn(
                  "text-sm font-medium truncate",
                  selectedId === result.doc.id ? "text-primary" : "text-text"
                )}>
                  {result.doc.source_path}
                </div>
                {result.doc.section && (
                  <div className="flex items-center gap-1 text-xs text-text-muted truncate mt-0.5">
                    <Hash className="w-3 h-3" />
                    {result.doc.section}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
