import { cn } from '../../lib/utils';
import { FileText } from 'lucide-react';
import { Flex } from '@tremor/react';
import type { SearchResult } from '../../types';

export type { SearchResult };

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
      <div className="space-y-3">
        {results.map((result) => (
          <div
            key={result.chunk_id}
            onClick={() => onSelect(result)}
            className={cn(
              "group rounded-lg border p-4 transition-all hover:shadow-md cursor-pointer",
              selectedId === result.chunk_id
                ? "border-primary bg-primary/5 shadow-md"
                : "border-border-subtle bg-surface-raised hover:border-primary/50"
            )}
          >
            <Flex justifyContent="between" alignItems="start" className="gap-4">
              <div className="flex-1 min-w-0">
                <Flex className="gap-2" alignItems="center">
                  <FileText className={cn(
                    "w-5 h-5 transition-colors",
                    selectedId === result.chunk_id ? "text-primary" : "text-text-muted group-hover:text-primary"
                  )} />
                  <div className="font-mono text-sm text-text truncate">{result.source_path}</div>
                </Flex>
                <div className="mt-1 text-xs text-text-subtle ml-7">
                  {result.section ? `Section: ${result.section}` : `Lines ${result.span?.start_line}-${result.span?.end_line}`}
                </div>
              </div>
              <Flex className="gap-2 shrink-0" alignItems="center">
                 <div className={`px-2 py-1 rounded-full text-xs font-semibold ${
                   result.score > 0.85 ? 'bg-success/20 text-success' : 
                   result.score > 0.75 ? 'bg-info/20 text-info' : 'bg-text-subtle/20 text-text-subtle'
                 }`}>
                   {Math.round(result.score * 100)}%
                 </div>
              </Flex>
            </Flex>
            {result.preview && (
              <pre className="mt-3 overflow-x-auto rounded-md border border-border-subtle bg-background p-3 text-xs font-mono">
                <code className="text-text-muted">{result.preview}</code>
              </pre>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
