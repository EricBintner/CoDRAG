import { Card, Flex, Title, Badge } from '@tremor/react';
import { cn } from '../../lib/utils';
import { FolderTree } from './FolderTree';
import type { TreeNode } from './FolderTree';

export interface FolderTreePanelProps {
  data: TreeNode[];
  /** Paths included in the RAG index */
  includedPaths?: Set<string>;
  /** Called when user toggles inclusion of paths (array for bulk operations) */
  onToggleInclude?: (paths: string[], action: 'add' | 'remove') => void;
  /** Called when user clicks a node (for navigation/preview in detail view) */
  onNodeClick?: (node: TreeNode, path: string) => void;
  title?: string;
  className?: string;
  bare?: boolean;
}

export function FolderTreePanel({
  data,
  includedPaths,
  onToggleInclude,
  onNodeClick,
  title = 'Index Scope',
  className,
  bare = false,
}: FolderTreePanelProps) {
  const Container = bare ? 'div' : Card;
  const includedCount = includedPaths?.size ?? 0;

  return (
    <Container className={cn(!bare && 'border border-border bg-surface shadow-sm', 'flex flex-col', className)}>
      {!bare && (
        <Flex justifyContent="between" alignItems="center" className="mb-4 gap-2">
          <Title className="text-text">{title}</Title>
          {includedCount > 0 && (
            <Badge color="blue" size="xs">{includedCount} included</Badge>
          )}
        </Flex>
      )}

      <div className="flex-1 min-h-0 overflow-y-auto -mx-2 custom-scrollbar">
        <div className="px-2">
          <FolderTree
            data={data}
            compact
            includedPaths={includedPaths}
            onToggleInclude={onToggleInclude}
            onNodeClick={onNodeClick}
          />
        </div>
      </div>
    </Container>
  );
}
