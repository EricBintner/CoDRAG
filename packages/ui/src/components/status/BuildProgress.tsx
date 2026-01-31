import * as React from 'react';
import { Card, Title, Text, ProgressBar, Flex } from '@tremor/react';
import { cn } from '../../lib/utils';

export interface BuildProgressProps {
  phase: 'scanning' | 'chunking' | 'embedding' | 'writing' | 'complete';
  percent?: number;
  counts?: {
    files_total?: number;
    files_done?: number;
    chunks_total?: number;
    chunks_done?: number;
  };
  className?: string;
}

const phaseLabels: Record<BuildProgressProps['phase'], string> = {
  scanning: 'Scanning files...',
  chunking: 'Chunking code...',
  embedding: 'Generating embeddings...',
  writing: 'Writing index...',
  complete: 'Build complete',
};

/**
 * BuildProgress - Shows build progress with phase and counters
 * 
 * Wireframe component - displays:
 * - Current build phase
 * - Progress bar (when percent available)
 * - File/chunk counters (when available)
 */
export function BuildProgress({
  phase,
  percent,
  counts,
  className,
}: BuildProgressProps) {
  const displayPercent = percent ?? (phase === 'complete' ? 100 : undefined);
  
  return (
    <Card className={cn('codrag-build-progress', className)}>
      <Title>Build Progress</Title>
      <Text className="mt-2">{phaseLabels[phase]}</Text>
      
      {displayPercent !== undefined && (
        <ProgressBar
          value={displayPercent}
          className="mt-3"
          color={phase === 'complete' ? 'green' : 'blue'}
        />
      )}
      
      {counts && (
        <Flex className="mt-3 gap-4">
          {counts.files_total !== undefined && (
            <Text>
              Files: {counts.files_done ?? 0} / {counts.files_total}
            </Text>
          )}
          {counts.chunks_total !== undefined && (
            <Text>
              Chunks: {counts.chunks_done ?? 0} / {counts.chunks_total}
            </Text>
          )}
        </Flex>
      )}
    </Card>
  );
}
