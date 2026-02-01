import { cn } from '../../lib/utils';
import { FileText } from 'lucide-react';

export interface ContextMeta {
  chunks?: { source_path: string; section: string; score: number; truncated: boolean }[];
  total_chars?: number;
  estimated_tokens?: number;
}

export interface ContextOutputProps {
  context: string;
  meta?: ContextMeta | null;
  className?: string;
}

/**
 * ContextOutput - Displays assembled context with metadata.
 * 
 * Features:
 * - Monospace code display
 * - Metadata bar (chunks, chars, tokens)
 * - Scrollable content area
 */
export function ContextOutput({
  context,
  meta,
  className,
}: ContextOutputProps) {
  if (!context) {
    return null;
  }

  return (
    <div className={cn('mt-4 space-y-2', className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" />
          Assembled Context
        </h3>
        {meta && (
          <div className="text-xs text-text-muted bg-surface-raised px-2 py-0.5 rounded border border-border">
            chunks={meta.chunks?.length ?? 0} · chars={meta.total_chars?.toLocaleString()} · est_tokens={meta.estimated_tokens?.toLocaleString()}
          </div>
        )}
      </div>
      <div className="bg-surface-raised border border-border rounded-lg overflow-hidden">
        <pre className="p-4 text-xs whitespace-pre-wrap font-mono text-text max-h-96 overflow-y-auto">
          {context}
        </pre>
      </div>
    </div>
  );
}
