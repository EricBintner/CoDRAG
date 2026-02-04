import type { CodeChunk } from '../../types';
import { CopyButton } from '../context/CopyButton';
import { cn } from '../../lib/utils';
import { X, FileCode } from 'lucide-react';
import { Button } from '../primitives/Button';

export interface ChunkViewerProps {
  chunk: CodeChunk;
  onClose?: () => void;
  className?: string;
}

/**
 * ChunkViewer - Full chunk detail view (drawer/panel)
 * 
 * Displays:
 * - Full chunk text with line numbers
 * - Source path and span info
 * - Copy chunk action
 * - Close button
 */
export function ChunkViewer({
  chunk,
  onClose,
  className,
}: ChunkViewerProps) {
  const lines = chunk.content.split('\n');
  const startLine = chunk.span?.start_line ?? 1;

  return (
    <div className={cn(
      'rounded-lg border border-border bg-surface p-6 shadow-lg',
      className
    )}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-mono text-sm font-semibold text-text flex items-center gap-2">
            <FileCode className="w-4 h-4 text-primary" />
            {chunk.source_path}
          </h3>
          {chunk.span && (
            <p className="mt-1 text-xs text-text-muted">
              Lines {chunk.span.start_line}–{chunk.span.end_line}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <CopyButton text={chunk.content} />
          {onClose && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onClose}
              className="text-text-muted hover:text-text"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
      
      <div className="bg-surface-raised border border-border rounded-lg overflow-auto max-h-[60vh]">
        <pre className="p-4 text-sm font-mono text-text">
          <code>
            {lines.map((line, idx) => (
              <div key={idx} className="flex hover:bg-surface/50 transition-colors">
                <span className="w-12 text-right pr-4 text-text-subtle select-none border-r border-border mr-4">
                  {startLine + idx}
                </span>
                <span className="flex-1 whitespace-pre-wrap break-all">{line || ' '}</span>
              </div>
            ))}
          </code>
        </pre>
      </div>
    </div>
  );
}
