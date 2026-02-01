import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { FolderTree, sampleFileTree, TreeNode } from '../../components/project';

const meta: Meta<typeof FolderTree> = {
  title: 'Project/FolderTree',
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

export const Selectable: Story = {
  render: () => {
    const [selectedPaths, setSelectedPaths] = useState<Set<string>>(new Set(['src/codrag/core']));

    const handleSelect = (_node: TreeNode, path: string) => {
      setSelectedPaths((prev) => {
        const next = new Set(prev);
        if (next.has(path)) {
          next.delete(path);
        } else {
          next.add(path);
        }
        return next;
      });
    };

    return (
      <div className="space-y-4">
        <div className="text-sm text-gray-400">
          Selected: {selectedPaths.size > 0 ? Array.from(selectedPaths).join(', ') : 'None'}
        </div>
        <FolderTree
          data={sampleFileTree}
          selectable
          onSelect={handleSelect}
          selectedPaths={selectedPaths}
        />
      </div>
    );
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
