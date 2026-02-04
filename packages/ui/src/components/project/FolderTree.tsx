import { useState } from 'react';
import { ChevronRight, ChevronDown, Folder, FolderOpen, File, FileText } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../primitives/Button';

export type FileStatus = 'indexed' | 'pending' | 'ignored' | 'error';

export interface TreeNode {
  name: string;
  type: 'file' | 'folder';
  status?: FileStatus;
  children?: TreeNode[];
  chunks?: number;
  selected?: boolean;
}

const statusColors: Record<FileStatus, string> = {
  indexed: 'bg-success',
  pending: 'bg-warning',
  ignored: 'bg-text-subtle/30',
  error: 'bg-error',
};

const statusLabels: Record<FileStatus, string> = {
  indexed: 'Indexed',
  pending: 'Pending',
  ignored: 'Ignored',
  error: 'Error',
};

/** Collect all descendant paths from a node (including the node itself) */
function collectAllPaths(node: TreeNode, basePath: string): string[] {
  const currentPath = basePath ? `${basePath}/${node.name}` : node.name;
  const paths = [currentPath];
  
  if (node.children) {
    for (const child of node.children) {
      // Skip ignored items
      if (child.status !== 'ignored') {
        paths.push(...collectAllPaths(child, currentPath));
      }
    }
  }
  
  return paths;
}

/** Check selection state of a folder's children */
function getFolderSelectionState(
  node: TreeNode, 
  basePath: string, 
  includedPaths: Set<string>
): 'none' | 'partial' | 'all' {
  if (!node.children || node.children.length === 0) return 'none';
  
  const selectableChildren = node.children.filter(c => c.status !== 'ignored');
  if (selectableChildren.length === 0) return 'none';
  
  let selectedCount = 0;
  const currentPath = basePath ? `${basePath}/${node.name}` : node.name;
  
  for (const child of selectableChildren) {
    const childPath = `${currentPath}/${child.name}`;
    if (includedPaths.has(childPath)) {
      selectedCount++;
    } else if (child.type === 'folder') {
      // Check if folder has any selected descendants
      const childState = getFolderSelectionState(child, currentPath, includedPaths);
      if (childState === 'all') selectedCount++;
      else if (childState === 'partial') return 'partial';
    }
  }
  
  if (selectedCount === 0) return 'none';
  if (selectedCount === selectableChildren.length) return 'all';
  return 'partial';
}

export interface FolderTreeProps {
  data: TreeNode[];
  compact?: boolean;
  /** Paths included in the RAG index */
  includedPaths?: Set<string>;
  /** Called when user toggles inclusion of paths (array for bulk operations) */
  onToggleInclude?: (paths: string[], action: 'add' | 'remove') => void;
  /** Called when user clicks a node (for navigation/preview) */
  onNodeClick?: (node: TreeNode, path: string) => void;
  className?: string;
}

interface TreeItemProps {
  node: TreeNode;
  depth?: number;
  path?: string;
  includedPaths?: Set<string>;
  onToggleInclude?: (paths: string[], action: 'add' | 'remove') => void;
  onNodeClick?: (node: TreeNode, path: string) => void;
}

function TreeItem({ node, depth = 0, path = '', includedPaths, onToggleInclude, onNodeClick }: TreeItemProps) {
  const [expanded, setExpanded] = useState(depth < 2);
  const hasChildren = node.children && node.children.length > 0;
  const isFolder = node.type === 'folder';
  const currentPath = path ? `${path}/${node.name}` : node.name;
  const isIncluded = includedPaths?.has(currentPath) ?? node.selected;
  const isIgnored = node.status === 'ignored';
  const isSelectable = !isIgnored;
  
  // For folders, check if partially selected (some children selected but not all)
  const folderSelectionState = isFolder && includedPaths 
    ? getFolderSelectionState(node, path, includedPaths) 
    : 'none';
  const isPartiallySelected = isFolder && folderSelectionState === 'partial';
  const isFolderFullySelected = isFolder && (isIncluded || folderSelectionState === 'all');

  const handleRowClick = () => {
    // Fire node click callback for navigation/preview
    onNodeClick?.(node, currentPath);
    
    if (!isSelectable || !onToggleInclude) return;
    
    if (isFolder) {
      // For folders: select/deselect ALL children recursively
      const allPaths = collectAllPaths(node, path);
      const isCurrentlySelected = isIncluded || folderSelectionState !== 'none';
      onToggleInclude(allPaths, isCurrentlySelected ? 'remove' : 'add');
    } else {
      // For files: just toggle this file
      onToggleInclude([currentPath], isIncluded ? 'remove' : 'add');
    }
  };

  const handleExpandToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };

  // Determine icon based on type and inclusion state
  const FolderIcon = expanded ? FolderOpen : Folder;
  const FileIcon = isIncluded ? FileText : File;
  
  // Effective inclusion for display (folder is "included" if it or all its children are)
  const effectivelyIncluded = isFolder ? (isIncluded || isFolderFullySelected) : isIncluded;

  // Only show status badge for included items (pending/indexed) or ignored items
  const showStatus = isIgnored || (isIncluded && node.status && node.status !== 'error');

  return (
    <div>
      <div
        className={cn(
          'group flex items-center gap-1 rounded-md px-2 py-1.5 transition-colors',
          depth > 0 && 'ml-4',
          // Hover state only for selectable items
          isSelectable && 'hover:bg-surface-raised cursor-pointer',
          // Ignored items are dimmed and not interactive
          isIgnored && 'opacity-50 cursor-default',
          // Selected/included items get a subtle background
          isIncluded && !isIgnored && 'bg-primary/5'
        )}
        onClick={handleRowClick}
        title={isIgnored 
          ? 'This item is excluded from indexing' 
          : isFolder
            ? (effectivelyIncluded || isPartiallySelected) 
              ? 'Click to remove folder and all contents from RAG index'
              : 'Click to add folder and all contents to RAG index'
            : isIncluded 
              ? 'Click to remove from RAG index' 
              : 'Click to add to RAG index'
        }
      >
        {isFolder ? (
          <Button
            variant="ghost"
            size="icon-sm"
            className="h-5 w-5 p-0 hover:bg-surface-raised text-text-subtle"
            onClick={handleExpandToggle}
          >
            {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </Button>
        ) : (
          <span className="w-5" />
        )}

        {/* Icon indicates inclusion state */}
        <span
          className={cn(
            'flex items-center justify-center w-5 h-5 transition-colors shrink-0',
            isIgnored 
              ? 'text-text-subtle/50'
              : effectivelyIncluded 
                ? 'text-primary' 
                : isPartiallySelected
                  ? 'text-primary/60'
                  : 'text-text-subtle'
          )}
        >
          {isFolder 
            ? <FolderIcon className={cn(
                'w-4 h-4', 
                effectivelyIncluded && !isIgnored && 'fill-primary/20',
                isPartiallySelected && !isIgnored && 'fill-primary/10'
              )} />
            : <FileIcon className={cn('w-4 h-4', isIncluded && !isIgnored && 'fill-primary/20')} />
          }
        </span>

        <span className={cn(
          "text-sm ml-1 truncate transition-all",
          isIgnored
            ? "text-text-subtle font-mono"
            : (effectivelyIncluded || isPartiallySelected)
              ? "text-text font-semibold font-mono" 
              : isFolder 
                ? "text-text font-medium" 
                : "text-text-muted font-mono"
        )}>
          {node.name}
        </span>

        {/* Right side: status badge and chunk count - always at far right */}
        <span className="ml-auto flex items-center gap-2 shrink-0">
          {/* Chunk count for indexed items */}
          {node.chunks !== undefined && node.status === 'indexed' && (
            <span className="text-xs text-text-subtle">
              {node.chunks} chunks
            </span>
          )}
          
          {/* Status badge: show for ignored items or included items with pending/indexed status */}
          {showStatus && node.status && (
            <span
              className={cn(
                "flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full",
                `${statusColors[node.status]}/20`
              )}
            >
              <span className={cn("w-1.5 h-1.5 rounded-full", statusColors[node.status])} />
              <span className="text-text-subtle hidden sm:inline">{statusLabels[node.status]}</span>
            </span>
          )}
        </span>
      </div>

      {hasChildren && expanded && (
        <div className="border-l border-border-subtle ml-[1.1rem]">
          {node.children!.map((child, i) => (
            <TreeItem 
              key={`${child.name}-${i}`} 
              node={child} 
              depth={depth + 1}
              path={currentPath}
              includedPaths={includedPaths}
              onToggleInclude={onToggleInclude}
              onNodeClick={onNodeClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function FolderTree({
  data,
  compact,
  includedPaths,
  onToggleInclude,
  onNodeClick,
  className,
}: FolderTreeProps) {
  return (
    <div className={cn(compact ? 'text-sm' : '', className)}>
      {data.map((node, i) => (
        <TreeItem
          key={`${node.name}-${i}`}
          node={node}
          includedPaths={includedPaths}
          onToggleInclude={onToggleInclude}
          onNodeClick={onNodeClick}
        />
      ))}
    </div>
  );
}

/**
 * Sample file tree demonstrating the status flow:
 * - Unselected items: no status indicator (user hasn't added them to RAG)
 * - Selected items: 'pending' until indexed, then 'indexed' with chunk count
 * - 'ignored' items: always shown, not selectable (e.g., node_modules)
 * - 'error' items: something went wrong during indexing
 */
export const sampleFileTree: TreeNode[] = [
  {
    name: 'src',
    type: 'folder',
    children: [
      {
        name: 'codrag',
        type: 'folder',
        children: [
          // These are selected and indexed
          { name: 'server.py', type: 'file', status: 'indexed', chunks: 24 },
          { name: 'cli.py', type: 'file', status: 'indexed', chunks: 18 },
          { name: '__init__.py', type: 'file', status: 'indexed', chunks: 2 },
          {
            name: 'core',
            type: 'folder',
            children: [
              { name: 'registry.py', type: 'file', status: 'indexed', chunks: 31 },
              // Selected but still indexing
              { name: 'embedding.py', type: 'file', status: 'pending' },
              { name: 'trace.py', type: 'file', status: 'indexed', chunks: 45 },
              // Error during indexing
              { name: 'watcher.py', type: 'file', status: 'error' },
            ],
          },
          {
            name: 'api',
            type: 'folder',
            children: [
              { name: 'routes.py', type: 'file', status: 'indexed', chunks: 28 },
              { name: 'auth.py', type: 'file', status: 'indexed', chunks: 15 },
            ],
          },
        ],
      },
    ],
  },
  {
    name: 'docs',
    type: 'folder',
    children: [
      { name: 'ARCHITECTURE.md', type: 'file', status: 'indexed', chunks: 42 },
      { name: 'API.md', type: 'file', status: 'indexed', chunks: 38 },
      // Just selected, waiting to be indexed
      { name: 'ROADMAP.md', type: 'file', status: 'pending' },
    ],
  },
  {
    name: 'node_modules',
    type: 'folder',
    status: 'ignored',
    children: [
      { name: 'react', type: 'folder', status: 'ignored', children: [] },
      { name: 'typescript', type: 'folder', status: 'ignored', children: [] },
    ],
  },
  {
    name: 'tests',
    type: 'folder',
    children: [
      // These are not selected (no status) - user can click to add
      { name: 'test_registry.py', type: 'file' },
      { name: 'test_search.py', type: 'file' },
      { name: 'conftest.py', type: 'file' },
    ],
  },
];
