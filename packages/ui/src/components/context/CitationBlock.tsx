import * as React from 'react';
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
 * Wireframe component - displays:
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
        'codrag-citation-block',
        'flex items-center gap-2 text-sm',
        'px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded',
        'font-mono',
        className
      )}
    >
      <span className="text-gray-600 dark:text-gray-300">{sourcePath}</span>
      {span && (
        <span className="text-gray-400">
          :{span.start_line}–{span.end_line}
        </span>
      )}
      {showScore && score !== undefined && (
        <span className="ml-auto text-gray-400">
          {(score * 100).toFixed(0)}%
        </span>
      )}
    </div>
  );
}
