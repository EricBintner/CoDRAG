import { FileText } from 'lucide-react';
import { Card, Title, Flex } from '@tremor/react';
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
    <Card className={cn('border border-border bg-surface shadow-sm flex flex-col', className)}>
      <Flex justifyContent="start" alignItems="center" className="mb-4 gap-2">
        <FileText className="w-5 h-5 text-primary" />
        <Title className="text-text">{content ? 'Chunk Content' : 'Preview'}</Title>
      </Flex>
      
      {sourcePath && (
        <div className="mb-4 text-xs text-text truncate font-mono bg-surface-raised px-3 py-2 rounded border border-border">
          {sourcePath}
          {section && <span className="text-text-muted"> · {section}</span>}
        </div>
      )}
      
      {content ? (
        <div className="flex-1 min-h-0 bg-surface-raised border border-border rounded-lg overflow-hidden">
          <pre className="text-xs whitespace-pre-wrap font-mono text-text p-4 h-full overflow-y-auto custom-scrollbar">
            {content}
          </pre>
        </div>
      ) : (
        <div className="h-64 flex items-center justify-center text-text-subtle text-sm italic border-2 border-dashed border-border-subtle rounded-md bg-surface/50">
          {placeholder}
        </div>
      )}
    </Card>
  );
}
