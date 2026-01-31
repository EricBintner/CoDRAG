import * as React from 'react';
import { Card, Title, Text, Flex, Button } from '@tremor/react';
import type { CodeChunk } from '../../types';
import { CopyButton } from '../context/CopyButton';
import { cn } from '../../lib/utils';

export interface ChunkViewerProps {
  chunk: CodeChunk;
  onClose?: () => void;
  className?: string;
}

/**
 * ChunkViewer - Full chunk detail view (drawer/panel)
 * 
 * Wireframe component - displays:
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
    <Card className={cn('codrag-chunk-viewer', className)}>
      <Flex justifyContent="between" alignItems="start">
        <div>
          <Title className="font-mono text-sm">{chunk.source_path}</Title>
          {chunk.span && (
            <Text className="mt-1">
              Lines {chunk.span.start_line}–{chunk.span.end_line}
            </Text>
          )}
        </div>
        <Flex className="gap-2">
          <CopyButton text={chunk.content} />
          {onClose && (
            <Button variant="secondary" size="xs" onClick={onClose}>
              Close
            </Button>
          )}
        </Flex>
      </Flex>
      
      <div className="mt-4 bg-gray-50 dark:bg-gray-900 rounded-lg overflow-auto max-h-[60vh]">
        <pre className="p-4 text-sm font-mono">
          <code>
            {lines.map((line, idx) => (
              <div key={idx} className="flex">
                <span className="w-12 text-right pr-4 text-gray-400 select-none">
                  {startLine + idx}
                </span>
                <span className="flex-1">{line || ' '}</span>
              </div>
            ))}
          </code>
        </pre>
      </div>
    </Card>
  );
}
