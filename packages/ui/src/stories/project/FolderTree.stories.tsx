import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { FolderTree, sampleFileTree, TreeNode } from '../../components/project';

const meta: Meta<typeof FolderTree> = {
  title: 'Dashboard/Widgets/FolderTree',
  component: FolderTree,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof FolderTree>;

export const Default: Story = {
  args: {
    data: sampleFileTree,
  },
};

export const Compact: Story = {
  args: {
    data: sampleFileTree,
    compact: true,
  },
};

export const RagInclusion: Story = {
  render: () => {
    // Initialize with paths that have indexed/pending status in the sample data
    const [includedPaths, setIncludedPaths] = useState<Set<string>>(new Set([
      'src',
      'src/codrag',
      'src/codrag/server.py',
      'src/codrag/cli.py',
      'src/codrag/__init__.py',
      'src/codrag/core',
      'src/codrag/core/registry.py',
      'src/codrag/core/embedding.py',
      'src/codrag/core/trace.py',
      'src/codrag/core/watcher.py',
      'src/codrag/api',
      'src/codrag/api/routes.py',
      'src/codrag/api/auth.py',
      'docs',
      'docs/ARCHITECTURE.md',
      'docs/API.md',
      'docs/ROADMAP.md',
    ]));

    const handleToggleInclude = (paths: string[], action: 'add' | 'remove') => {
      setIncludedPaths((prev) => {
        const next = new Set(prev);
        for (const path of paths) {
          if (action === 'remove') {
            next.delete(path);
          } else {
            next.add(path);
          }
        }
        return next;
      });
    };

    return (
      <div className="space-y-4">
        <div className="p-3 bg-surface-raised rounded-lg border border-border">
          <div className="text-xs text-text-subtle mb-1">Folder Selection Behavior</div>
          <div className="text-sm text-text-muted space-y-1">
            <div>• <strong>Click folder row</strong> → selects/deselects ALL children recursively</div>
            <div>• <strong>Click arrow (▶)</strong> → only expands/collapses folder</div>
            <div>• <strong>Click file</strong> → toggles just that file</div>
            <div>• <span className="text-primary/60">Partial selection</span> = some children selected (folder stays bold)</div>
            <div>• <span className="text-text-subtle opacity-50">Ignored items</span> (like node_modules) cannot be selected</div>
          </div>
        </div>
        <div className="text-xs text-text-subtle">
          Included: {includedPaths.size} paths
        </div>
        <FolderTree
          data={sampleFileTree}
          includedPaths={includedPaths}
          onToggleInclude={handleToggleInclude}
        />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: `
**RAG Inclusion** is the primary functionality of the FolderTree.

**Status Flow:**
- **Unselected items**: No indicator - user hasn't added them to RAG
- **Selected → Pending**: Item is queued for indexing
- **Pending → Indexed**: Item has been processed, shows chunk count
- **Ignored**: Items like node_modules that cannot be selected

**Interaction:**
- Click anywhere on a row to toggle selection (not just the icon)
- Folders expand/collapse AND toggle selection on click
- Chevron button only toggles expand/collapse
- Ignored items have no hover state and cannot be clicked
        `,
      },
    },
  },
};

const simpleTree: TreeNode[] = [
  {
    name: 'project',
    type: 'folder',
    children: [
      { name: 'README.md', type: 'file', status: 'indexed', chunks: 5 },
      { name: 'package.json', type: 'file', status: 'indexed', chunks: 2 },
      {
        name: 'src',
        type: 'folder',
        children: [
          { name: 'index.ts', type: 'file', status: 'indexed', chunks: 10 },
          { name: 'utils.ts', type: 'file', status: 'pending' },
        ],
      },
    ],
  },
];

export const SimpleTree: Story = {
  args: {
    data: simpleTree,
  },
};

const statusShowcase: TreeNode[] = [
  {
    name: 'files',
    type: 'folder',
    children: [
      { name: 'indexed-file.py', type: 'file', status: 'indexed', chunks: 15 },
      { name: 'pending-file.py', type: 'file', status: 'pending', chunks: 0 },
      { name: 'ignored-file.py', type: 'file', status: 'ignored' },
      { name: 'error-file.py', type: 'file', status: 'error' },
    ],
  },
];

export const StatusShowcase: Story = {
  args: {
    data: statusShowcase,
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows all possible file status states: indexed, pending, ignored, and error.',
      },
    },
  },
};

export const FullHeight: Story = {
  args: {
    data: sampleFileTree,
    className: 'h-[400px] overflow-y-auto',
  },
  decorators: [
    (Story) => (
      <div className="h-[500px] bg-gray-800 rounded-lg p-4">
        <div className="text-sm font-medium text-gray-300 mb-3">Project Files</div>
        <Story />
      </div>
    ),
  ],
};
