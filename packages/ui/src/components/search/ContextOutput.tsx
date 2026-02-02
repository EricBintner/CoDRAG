import { cn } from '../../lib/utils';
import { FileText } from 'lucide-react';
import { Card, Title, Flex, Badge } from '@tremor/react';

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
    <Card className={cn('border border-border bg-surface shadow-sm', className)}>
      <Flex justifyContent="between" alignItems="center" className="mb-4">
        <Flex justifyContent="start" alignItems="center" className="gap-2">
          <FileText className="w-5 h-5 text-primary" />
          <Title className="text-text">Assembled Context</Title>
        </Flex>
        {meta && (
          <Flex justifyContent="end" className="gap-2">
             <Badge color="gray" size="xs">{meta.chunks?.length ?? 0} chunks</Badge>
             <Badge color="gray" size="xs">{meta.total_chars?.toLocaleString()} chars</Badge>
             <Badge color="blue" size="xs">~{meta.estimated_tokens?.toLocaleString()} tokens</Badge>
          </Flex>
        )}
      </Flex>
      
      <div className="bg-surface-raised border border-border rounded-lg overflow-hidden">
        <pre className="p-4 text-xs whitespace-pre-wrap font-mono text-text max-h-96 overflow-y-auto custom-scrollbar">
          {context}
        </pre>
      </div>
    </Card>
  );
}
