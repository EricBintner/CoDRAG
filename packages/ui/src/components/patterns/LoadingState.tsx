import * as React from 'react';
import { Card, Text } from '@tremor/react';
import { cn } from '../../lib/utils';

export interface LoadingStateProps {
  message?: string;
  variant?: 'card' | 'inline' | 'fullscreen';
  className?: string;
}

/**
 * LoadingState - Loading indicator component
 * 
 * Wireframe component - displays:
 * - Spinner/animation placeholder
 * - Optional loading message
 * 
 * Variants:
 * - card: contained in a card
 * - inline: minimal inline loader
 * - fullscreen: overlay loader
 */
export function LoadingState({
  message = 'Loading...',
  variant = 'card',
  className,
}: LoadingStateProps) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-3">
      {/* Placeholder spinner - will be styled later */}
      <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
      {message && <Text>{message}</Text>}
    </div>
  );

  if (variant === 'inline') {
    return (
      <div className={cn('codrag-loading-state codrag-loading-state--inline', 'py-4', className)}>
        {content}
      </div>
    );
  }

  if (variant === 'fullscreen') {
    return (
      <div
        className={cn(
          'codrag-loading-state codrag-loading-state--fullscreen',
          'fixed inset-0 bg-white/80 dark:bg-gray-900/80 flex items-center justify-center z-50',
          className
        )}
      >
        {content}
      </div>
    );
  }

  return (
    <Card className={cn('codrag-loading-state codrag-loading-state--card', 'py-12', className)}>
      {content}
    </Card>
  );
}
