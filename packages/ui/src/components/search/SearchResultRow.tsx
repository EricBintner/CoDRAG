import * as React from 'react';
import { TableRow, TableCell, Badge } from '@tremor/react';
import type { SearchResult } from '../../types';
import { cn } from '../../lib/utils';

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
 * Wireframe component - displays:
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
    <TableRow
      className={cn(
        'codrag-search-result-row',
        'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800',
        selected && 'bg-gray-100 dark:bg-gray-800',
        className
      )}
      onClick={onClick}
    >
      <TableCell>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm text-gray-600 dark:text-gray-300">
              {result.source_path}
            </span>
            {result.span && (
              <Badge color="gray" size="xs">
                L{result.span.start_line}–{result.span.end_line}
              </Badge>
            )}
          </div>
          <p className="text-sm text-gray-500 line-clamp-2">
            {result.preview}
          </p>
        </div>
      </TableCell>
      {showScore && (
        <TableCell className="text-right">
          <span className="text-sm text-gray-400">
            {(result.score * 100).toFixed(0)}%
          </span>
        </TableCell>
      )}
    </TableRow>
  );
}
