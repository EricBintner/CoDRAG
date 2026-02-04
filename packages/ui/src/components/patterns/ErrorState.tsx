import { useState } from 'react';
import { cn } from '../../lib/utils';
import { AlertCircle, ChevronDown, ChevronUp, RefreshCw, X } from 'lucide-react';
import { Button } from '../primitives/Button';

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
 * Displays:
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
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div
      className={cn(
        'rounded-lg border border-error/20 bg-error-muted/5 p-6 shadow-sm',
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-full bg-error-muted/10 text-error shrink-0">
          <AlertCircle className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-error mb-1">{title}</h3>
          
          <p className="text-sm text-text-muted mb-2">{error.message}</p>
          
          {error.hint && (
            <div className="text-xs text-text-subtle mb-3 p-2 bg-surface/50 rounded border border-border/50">
              <span className="font-medium text-text-muted">Hint: </span>
              {error.hint}
            </div>
          )}

          {/* Details toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
            className="text-text-muted hover:text-text h-auto p-0 hover:bg-transparent mb-3"
          >
            {showDetails ? (
              <>
                <ChevronUp className="w-3 h-3 mr-1" />
                Hide details
              </>
            ) : (
              <>
                <ChevronDown className="w-3 h-3 mr-1" />
                Show details
              </>
            )}
          </Button>

          {showDetails && (
            <div className="mb-4 p-3 bg-surface border border-border rounded-md font-mono text-xs text-text overflow-x-auto">
              <span className="text-text-subtle">Code:</span> {error.code}
            </div>
          )}

          {/* Actions */}
          {(onRetry || onDismiss) && (
            <div className="flex gap-2">
              {onRetry && (
                <Button 
                  onClick={onRetry} 
                  variant="destructive"
                  size="sm"
                  icon={RefreshCw}
                >
                  Retry
                </Button>
              )}
              {onDismiss && (
                <Button 
                  onClick={onDismiss} 
                  variant="outline"
                  size="sm"
                  icon={X}
                >
                  Dismiss
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
