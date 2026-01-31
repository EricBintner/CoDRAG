import { Badge, Callout, Button } from '@tremor/react';
import { cn } from '../../lib/utils';

export interface EmbeddedModeIndicatorProps {
  isEmbedded: boolean;
  indexExists: boolean;
  hasConflicts?: boolean;
  isCommitted?: boolean;
  onRebuild?: () => void;
  className?: string;
}

export function EmbeddedModeIndicator({
  isEmbedded,
  indexExists,
  hasConflicts = false,
  isCommitted,
  onRebuild,
  className,
}: EmbeddedModeIndicatorProps) {
  if (!isEmbedded) {
    return (
      <div className={cn('codrag-embedded-mode', className)}>
        <Badge color="gray">Standalone Mode</Badge>
        <p className="text-xs text-gray-500 mt-1">
          Index stored in application data directory
        </p>
      </div>
    );
  }

  return (
    <div className={cn('codrag-embedded-mode', className)}>
      <div className="flex items-center gap-2">
        <Badge color="blue">Embedded Mode</Badge>
        {indexExists && <Badge color="green">Index Ready</Badge>}
        {!indexExists && <Badge color="yellow">Not Built</Badge>}
        {isCommitted !== undefined && (
          <Badge color="gray">{isCommitted ? 'Committed' : 'Gitignored'}</Badge>
        )}
      </div>
      
      <p className="text-xs text-gray-500 mt-1">
        Index stored in <code>.codrag/</code> directory
      </p>
      
      {hasConflicts && (
        <Callout title="Merge Conflicts Detected" color="red" className="mt-2">
          The embedded index has git merge conflicts and is invalid.
          {onRebuild && (
            <Button size="xs" className="mt-2" onClick={onRebuild}>
              Rebuild Index
            </Button>
          )}
        </Callout>
      )}
      
      {!indexExists && !hasConflicts && (
        <Callout title="Index Not Built" color="yellow" className="mt-2">
          Build the index to enable search.
          {onRebuild && (
            <Button size="xs" className="mt-2" onClick={onRebuild}>
              Build Index
            </Button>
          )}
        </Callout>
      )}
    </div>
  );
}
