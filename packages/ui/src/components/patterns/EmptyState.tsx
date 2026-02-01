import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

export interface EmptyStateProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: ReactNode;
  className?: string;
}

/**
 * EmptyState - Placeholder for empty data states
 * 
 * Displays:
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
    <div className={cn(
      'text-center py-12 px-6 rounded-lg border border-dashed border-border bg-surface-raised/30',
      className
    )}>
      {icon && (
        <div className="mb-4 text-text-subtle flex justify-center [&>svg]:w-10 [&>svg]:h-10">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-text">{title}</h3>
      {description && (
        <p className="mt-2 max-w-md mx-auto text-sm text-text-muted">{description}</p>
      )}
      {action && (
        <div className="mt-6">
          <button 
            onClick={action.onClick}
            className="px-4 py-2 rounded-md bg-primary hover:bg-primary-hover text-white text-sm font-medium transition-colors shadow-sm"
          >
            {action.label}
          </button>
        </div>
      )}
    </div>
  );
}
