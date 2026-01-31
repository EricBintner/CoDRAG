import * as React from 'react';
import { Card, Title, Text, Button } from '@tremor/react';
import { cn } from '../../lib/utils';

export interface EmptyStateProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: React.ReactNode;
  className?: string;
}

/**
 * EmptyState - Placeholder for empty data states
 * 
 * Wireframe component - displays:
 * - Title and description
 * - Optional icon
 * - Optional primary action
 * 
 * Used for: no projects, no search results, no index, etc.
 */
export function EmptyState({
  title,
  description,
  action,
  icon,
  className,
}: EmptyStateProps) {
  return (
    <Card className={cn('codrag-empty-state', 'text-center py-12', className)}>
      {icon && (
        <div className="mb-4 text-gray-400 flex justify-center">
          {icon}
        </div>
      )}
      <Title>{title}</Title>
      {description && (
        <Text className="mt-2 max-w-md mx-auto">{description}</Text>
      )}
      {action && (
        <div className="mt-6">
          <Button onClick={action.onClick}>
            {action.label}
          </Button>
        </div>
      )}
    </Card>
  );
}
