import { useState } from 'react';
import { ChevronRight, ChevronDown, Folder, File } from 'lucide-react';
import { cn } from '../../lib/utils';

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
  indexed: 'bg-green-500',
  pending: 'bg-yellow-500',
  ignored: 'bg-gray-400',
  error: 'bg-red-500',
};

const statusLabels: Record<FileStatus, string> = {
  indexed: 'Indexed',
  pending: 'Pending',
  ignored: 'Ignored',
  error: 'Error',
};

export interface FolderTreeProps {
  data: TreeNode[];
  compact?: boolean;
  selectable?: boolean;
  onSelect?: (node: TreeNode, path: string) => void;
  selectedPaths?: Set<string>;
  className?: string;
}

interface TreeItemProps {
  node: TreeNode;
  depth?: number;
  path?: string;
  selectable?: boolean;
  onSelect?: (node: TreeNode, path: string) => void;
  selectedPaths?: Set<string>;
}

function TreeItem({ node, depth = 0, path = '', selectable, onSelect, selectedPaths }: TreeItemProps) {
  const [expanded, setExpanded] = useState(depth < 2);
  const hasChildren = node.children && node.children.length > 0;
  const isFolder = node.type === 'folder';
  const currentPath = path ? `${path}/${node.name}` : node.name;
  const isSelected = selectedPaths?.has(currentPath) ?? node.selected;

  const handleClick = () => {
    if (isFolder) {
      setExpanded(!expanded);
    }
    if (selectable && onSelect) {
      onSelect(node, currentPath);
    }
  };

  return (
    <div>
      <div
        className={cn(
          'group flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors cursor-pointer',
          'hover:bg-gray-700/50',
          isSelected && 'bg-blue-900/30 border-l-2 border-blue-500',
          depth > 0 && 'ml-4'
        )}
        onClick={handleClick}
      >
        {isFolder ? (
          <span className="text-gray-400 flex-shrink-0">
            {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </span>
        ) : (
          <span className="w-4 flex-shrink-0" />
        )}

        {selectable && (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelect?.(node, currentPath)}
            onClick={(e) => e.stopPropagation()}
            className="accent-blue-500 flex-shrink-0"
          />
        )}

        <span
          className={cn(
            'text-sm flex items-center gap-2 truncate',
            isFolder ? 'text-gray-100 font-medium' : 'text-gray-400 font-mono'
          )}
        >
          {isFolder ? (
            <Folder className="w-4 h-4 text-blue-400 flex-shrink-0" />
          ) : (
            <File className="w-4 h-4 flex-shrink-0" />
          )}
          <span className="truncate">{node.name}</span>
        </span>

        {node.status && (
          <span className="ml-auto flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full bg-gray-700/50 flex-shrink-0">
            <span className={cn('w-1.5 h-1.5 rounded-full', statusColors[node.status])} />
            <span className="text-gray-400">{statusLabels[node.status]}</span>
          </span>
        )}

        {node.chunks !== undefined && (
          <span className="text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
            {node.chunks} chunks
          </span>
        )}
      </div>

      {hasChildren && expanded && (
        <div className="border-l border-gray-700 ml-4">
          {node.children!.map((child, i) => (
            <TreeItem
              key={`${child.name}-${i}`}
              node={child}
              depth={depth + 1}
              path={currentPath}
              selectable={selectable}
              onSelect={onSelect}
              selectedPaths={selectedPaths}
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
  selectable,
  onSelect,
  selectedPaths,
  className,
}: FolderTreeProps) {
  return (
    <div className={cn(compact && 'text-sm', className)}>
      {data.map((node, i) => (
        <TreeItem
          key={`${node.name}-${i}`}
          node={node}
          selectable={selectable}
          onSelect={onSelect}
          selectedPaths={selectedPaths}
        />
      ))}
    </div>
  );
}

export const sampleFileTree: TreeNode[] = [
  {
    name: 'src',
    type: 'folder',
    children: [
      {
        name: 'codrag',
        type: 'folder',
        children: [
          { name: 'server.py', type: 'file', status: 'indexed', chunks: 24 },
          { name: 'cli.py', type: 'file', status: 'indexed', chunks: 18 },
          { name: '__init__.py', type: 'file', status: 'indexed', chunks: 2 },
          {
            name: 'core',
            type: 'folder',
            children: [
              { name: 'registry.py', type: 'file', status: 'indexed', chunks: 31 },
              { name: 'embedding.py', type: 'file', status: 'pending', chunks: 0 },
              { name: 'trace.py', type: 'file', status: 'indexed', chunks: 45 },
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
      { name: 'ROADMAP.md', type: 'file', status: 'pending', chunks: 0 },
    ],
  },
  {
    name: 'tests',
    type: 'folder',
    children: [
      { name: 'test_registry.py', type: 'file', status: 'ignored' },
      { name: 'test_search.py', type: 'file', status: 'ignored' },
    ],
  },
];
