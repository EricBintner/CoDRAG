import * as React from 'react';
import { Card, Title, Text, Flex, Divider } from '@tremor/react';
import { CopyButton } from './CopyButton';
import { CitationBlock } from './CitationBlock';
import { cn } from '../../lib/utils';

export interface ContextChunk {
  chunk_id: string;
  source_path: string;
  span?: {
    start_line: number;
    end_line: number;
  };
  score?: number;
  truncated?: boolean;
}

export interface ContextViewerProps {
  context: string;
  chunks?: ContextChunk[];
  totalChars?: number;
  estimatedTokens?: number;
  showSources?: boolean;
  showScores?: boolean;
  className?: string;
}

/**
 * ContextViewer - Assembled context output display
 * 
 * Wireframe component - displays:
 * - Full context text (copyable)
 * - Citation headers per chunk
 * - Sources list view
 * - Token/char estimates
 */
export function ContextViewer({
  context,
  chunks = [],
  totalChars,
  estimatedTokens,
  showSources = true,
  showScores = false,
  className,
}: ContextViewerProps) {
  return (
    <Card className={cn('codrag-context-viewer', className)}>
      <Flex justifyContent="between" alignItems="start">
        <div>
          <Title>Generated Context</Title>
          {(totalChars || estimatedTokens) && (
            <Text className="mt-1">
              {totalChars && `${totalChars.toLocaleString()} chars`}
              {totalChars && estimatedTokens && ' · '}
              {estimatedTokens && `~${estimatedTokens.toLocaleString()} tokens`}
            </Text>
          )}
        </div>
        <CopyButton text={context} label="Copy Context" />
      </Flex>

      {/* Sources list */}
      {showSources && chunks.length > 0 && (
        <>
          <Divider className="my-4" />
          <Text className="font-medium mb-2">Sources ({chunks.length})</Text>
          <div className="space-y-2">
            {chunks.map((chunk) => (
              <CitationBlock
                key={chunk.chunk_id}
                sourcePath={chunk.source_path}
                span={chunk.span}
                score={chunk.score}
                showScore={showScores}
              />
            ))}
          </div>
        </>
      )}

      {/* Context content */}
      <Divider className="my-4" />
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg overflow-auto max-h-[50vh]">
        <pre className="p-4 text-sm font-mono whitespace-pre-wrap">
          {context}
        </pre>
      </div>
    </Card>
  );
}
