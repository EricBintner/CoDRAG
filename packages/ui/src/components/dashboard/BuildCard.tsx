import { Loader2, FolderOpen, Play } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface BuildCardProps {
  repoRoot: string;
  onRepoRootChange: (value: string) => void;
  onBuild: () => void;
  building?: boolean;
  disabled?: boolean;
  className?: string;
}

/**
 * BuildCard - Controls for triggering an index build.
 * 
 * Provides:
 * - Repository root path input
 * - Build button with loading state
 */
export function BuildCard({
  repoRoot,
  onRepoRootChange,
  onBuild,
  building = false,
  disabled = false,
  className,
}: BuildCardProps) {
  return (
    <div className={cn(
      'rounded-lg border border-border bg-surface p-6 space-y-4 shadow-sm',
      className
    )}>
      <h2 className="text-lg font-semibold text-text flex items-center gap-2">
        <FolderOpen className="w-5 h-5 text-primary" />
        Build Index
      </h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-muted mb-1.5">
            Repository Root
          </label>
          <div className="relative">
            <input
              type="text"
              value={repoRoot}
              onChange={(e) => onRepoRootChange(e.target.value)}
              placeholder="/path/to/repo"
              disabled={disabled || building}
              className="w-full bg-surface-raised border border-border rounded-md px-3 py-2 text-sm text-text placeholder:text-text-subtle focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 transition-all"
            />
          </div>
        </div>

        <button
          onClick={onBuild}
          disabled={building || disabled || !repoRoot.trim()}
          className="w-full bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed rounded-md px-4 py-2 font-medium text-white transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          {building ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Play className="w-4 h-4" />
          )}
          {building ? 'Building...' : 'Start Build'}
        </button>
      </div>
    </div>
  );
}
