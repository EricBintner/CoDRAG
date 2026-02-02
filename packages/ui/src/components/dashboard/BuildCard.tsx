import { FolderOpen, Play, Loader2 } from 'lucide-react';
import { Card, Title, TextInput, Button } from '@tremor/react';
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
    <Card className={cn('border border-border bg-surface shadow-sm', className)}>
      <Title className="text-text mb-4 flex items-center gap-2">
        <FolderOpen className="w-5 h-5 text-primary" />
        Build Index
      </Title>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-text-muted mb-2">
            Repository Root
          </label>
          <TextInput
            value={repoRoot}
            onValueChange={onRepoRootChange}
            placeholder="/path/to/repo"
            disabled={disabled || building}
            className="w-full"
          />
        </div>

        <Button
          onClick={onBuild}
          disabled={building || disabled || !repoRoot.trim()}
          className="w-full bg-primary hover:bg-primary-hover text-white border-none"
          icon={building ? Loader2 : Play}
        >
          {building ? 'Building...' : 'Start Build'}
        </Button>
      </div>
    </Card>
  );
}
