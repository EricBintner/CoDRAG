import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

export interface LoadingStateProps {
  message?: string;
  variant?: 'card' | 'inline' | 'fullscreen';
  className?: string;
}

/**
 * LoadingState - Loading indicator component
 * 
 * Displays:
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
      <Loader2 className="w-8 h-8 text-primary animate-spin" />
      {message && <p className="text-sm text-text-muted font-medium">{message}</p>}
    </div>
  );

  if (variant === 'inline') {
    return (
      <div className={cn('py-4 flex items-center justify-center', className)}>
        {content}
      </div>
    );
  }

  if (variant === 'fullscreen') {
    return (
      <div
        className={cn(
          'fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50',
          className
        )}
      >
        {content}
      </div>
    );
  }

  return (
    <div className={cn(
      'py-12 rounded-lg border border-border bg-surface shadow-sm flex items-center justify-center',
      className
    )}>
      {content}
    </div>
  );
}
