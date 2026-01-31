import * as React from 'react';
import { Card, Title, Text, Flex } from '@tremor/react';
import type { StatusState } from '../../types';
import { StatusBadge } from './StatusBadge';
import { cn } from '../../lib/utils';

export interface StatusCardProps {
  projectName: string;
  status: StatusState;
  lastBuildAt?: string;
  chunkCount?: number;
  error?: {
    code: string;
    message: string;
    hint?: string;
  };
  className?: string;
}

/**
 * StatusCard - Project index status overview
 * 
 * Wireframe component - displays:
 * - Project name and status badge
 * - Last build timestamp
 * - Chunk count (when indexed)
 * - Error details (when applicable)
 */
export function StatusCard({
  projectName,
  status,
  lastBuildAt,
  chunkCount,
  error,
  className,
}: StatusCardProps) {
  return (
    <Card className={cn('codrag-status-card', className)}>
      <Flex justifyContent="between" alignItems="start">
        <div>
          <Title>{projectName}</Title>
          {lastBuildAt && (
            <Text className="mt-1">Last build: {lastBuildAt}</Text>
          )}
          {chunkCount !== undefined && status === 'fresh' && (
            <Text className="mt-1">{chunkCount.toLocaleString()} chunks indexed</Text>
          )}
        </div>
        <StatusBadge status={status} />
      </Flex>
      
      {error && status === 'error' && (
        <div className="mt-4 p-3 rounded bg-red-50 dark:bg-red-900/20">
          <Text className="font-medium text-red-800 dark:text-red-200">
            {error.code}: {error.message}
          </Text>
          {error.hint && (
            <Text className="mt-1 text-red-700 dark:text-red-300">
              {error.hint}
            </Text>
          )}
        </div>
      )}
    </Card>
  );
}
