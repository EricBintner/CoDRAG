import * as React from 'react';
import { Badge } from '@tremor/react';
import type { StatusState } from '../../types';
import { cn } from '../../lib/utils';

export interface StatusBadgeProps {
  status: StatusState;
  className?: string;
  showLabel?: boolean;
}

const statusConfig: Record<StatusState, { label: string; variant: 'default' | 'success' | 'warning' | 'error' }> = {
  fresh: { label: 'Fresh', variant: 'success' },
  stale: { label: 'Stale', variant: 'warning' },
  building: { label: 'Building', variant: 'default' },
  pending: { label: 'Pending', variant: 'default' },
  error: { label: 'Error', variant: 'error' },
  disabled: { label: 'Disabled', variant: 'default' },
};

/**
 * StatusBadge - Displays index/build status
 * 
 * Wireframe component - final styling TBD after visual direction is chosen.
 * Maps StatusState to appropriate badge variant and label.
 */
export function StatusBadge({ status, className, showLabel = true }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <Badge
      className={cn(
        'codrag-status-badge',
        `codrag-status-badge--${status}`,
        className
      )}
      color={
        config.variant === 'success' ? 'green' :
        config.variant === 'warning' ? 'amber' :
        config.variant === 'error' ? 'red' :
        'gray'
      }
    >
      {showLabel && config.label}
    </Badge>
  );
}
