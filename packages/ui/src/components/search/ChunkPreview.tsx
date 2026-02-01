import { FileText } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface ChunkPreviewProps {
  content?: string | null;
  sourcePath?: string;
  section?: string;
  placeholder?: string;
  className?: string;
}

/**
 * ChunkPreview - Displays the content of a selected chunk.
 * 
 * Features:
 * - Monospace code display
 * - Scrollable content area
 * - Empty state placeholder
 */
export function ChunkPreview({
  content,
  sourcePath,
  section,
  placeholder = 'Select a result to view its content',
  className,
}: ChunkPreviewProps) {
  return (
    <div className={cn(
      'bg-surface-raised border border-border rounded-lg p-4 max-h-96 overflow-y-auto shadow-sm',
      className
    )}>
      <h3 className="text-sm font-semibold text-text-muted mb-3 flex items-center gap-2 sticky top-0 bg-surface-raised pb-2 border-b border-border/50">
        <FileText className="w-4 h-4 text-primary" />
        {content ? 'Chunk Content' : 'Preview'}
      </h3>
      {sourcePath && (
        <div className="text-xs text-text mb-3 truncate font-mono bg-surface px-2 py-1.5 rounded border border-border">
          {sourcePath}
          {section && <span className="text-text-muted"> · {section}</span>}
        </div>
      )}
      {content ? (
        <pre className="text-xs whitespace-pre-wrap font-mono text-text p-2">
          {content}
        </pre>
      ) : (
        <div className="h-32 flex items-center justify-center text-text-subtle text-sm italic border-2 border-dashed border-border-subtle rounded-md bg-surface/50">
          {placeholder}
        </div>
      )}
    </div>
  );
}
