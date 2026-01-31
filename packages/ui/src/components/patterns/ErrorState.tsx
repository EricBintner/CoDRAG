import * as React from 'react';
import { Card, Title, Text, Button, Flex } from '@tremor/react';
import { cn } from '../../lib/utils';

export interface ErrorStateProps {
  title?: string;
  error: {
    code: string;
    message: string;
    hint?: string;
  };
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

/**
 * ErrorState - Error display with actionable recovery
 * 
 * Wireframe component - displays:
 * - Error title
 * - Error code and message
 * - Hint/recommendation
 * - Retry/dismiss actions
 * 
 * Follows Phase 02 spec: every error has code + message + hint
 */
export function ErrorState({
  title = 'Something went wrong',
  error,
  onRetry,
  onDismiss,
  className,
}: ErrorStateProps) {
  const [showDetails, setShowDetails] = React.useState(false);

  return (
    <Card
      className={cn(
        'codrag-error-state',
        'border-red-200 dark:border-red-800',
        className
      )}
    >
      <Title className="text-red-600 dark:text-red-400">{title}</Title>
      
      <Text className="mt-2">{error.message}</Text>
      
      {error.hint && (
        <Text className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {error.hint}
        </Text>
      )}

      {/* Details toggle */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="mt-3 text-sm text-gray-500 underline"
      >
        {showDetails ? 'Hide details' : 'Show details'}
      </button>

      {showDetails && (
        <div className="mt-2 p-3 bg-gray-100 dark:bg-gray-800 rounded font-mono text-sm">
          <Text>Code: {error.code}</Text>
        </div>
      )}

      {/* Actions */}
      {(onRetry || onDismiss) && (
        <Flex className="mt-4 gap-2">
          {onRetry && (
            <Button onClick={onRetry} size="sm">
              Retry
            </Button>
          )}
          {onDismiss && (
            <Button onClick={onDismiss} variant="secondary" size="sm">
              Dismiss
            </Button>
          )}
        </Flex>
      )}
    </Card>
  );
}
