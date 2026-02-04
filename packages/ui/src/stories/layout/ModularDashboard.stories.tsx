import type { Meta, StoryObj } from '@storybook/react';
import { ModularDashboard } from '../../components/layout/ModularDashboard';
import { Box, Lock, LayoutTemplate } from 'lucide-react';
import type { PanelDefinition } from '../../types/layout';

const meta: Meta<typeof ModularDashboard> = {
  title: 'Dashboard/Layouts/ModularDashboard',
  component: ModularDashboard,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof ModularDashboard>;

// Dummy Components for Layout Verification
const ScalablePanel = ({ label }: { label: string }) => (
  <div className="h-full w-full bg-blue-50/50 border-2 border-dashed border-blue-200 p-4 rounded-lg flex flex-col justify-center items-center text-blue-700">
    <LayoutTemplate className="w-8 h-8 mb-2 opacity-50" />
    <h3 className="font-bold">{label}</h3>
    <p className="text-sm font-mono mt-1">resizable: true</p>
    <p className="text-xs text-blue-600/80 mt-2 text-center">Fills grid cell<br/>(Greedy height)</p>
  </div>
);

const FixedPanel = ({ label }: { label: string }) => (
  <div className="w-full bg-amber-50/50 border-2 border-dashed border-amber-200 p-4 rounded-lg flex flex-col justify-center items-center text-amber-700">
    <Lock className="w-8 h-8 mb-2 opacity-50" />
    <h3 className="font-bold">{label}</h3>
    <p className="text-sm font-mono mt-1">resizable: false</p>
    <p className="text-xs text-amber-600/80 mt-2 text-center">Fits content<br/>(Auto height)</p>
    <div className="mt-4 h-12 w-full bg-amber-200/50 rounded flex items-center justify-center text-[10px] uppercase tracking-wider font-semibold">
      Content Block
    </div>
  </div>
);

// Define panels: Mixed scalable and fixed to test grid behavior
const DUMMY_PANELS: PanelDefinition[] = [
  { 
    id: 'scalable-1', 
    title: 'Scalable A', 
    icon: Box, 
    minHeight: 4, 
    defaultHeight: 8, 
    category: 'status', 
    resizable: true 
  },
  { 
    id: 'fixed-1', 
    title: 'Fixed A', 
    icon: Lock, 
    minHeight: 4, 
    defaultHeight: 6, 
    category: 'status', 
    resizable: false 
  },
  { 
    id: 'scalable-2', 
    title: 'Scalable B', 
    icon: Box, 
    minHeight: 4, 
    defaultHeight: 8, 
    category: 'search', 
    resizable: true 
  },
  { 
    id: 'fixed-2', 
    title: 'Fixed B', 
    icon: Lock, 
    minHeight: 4, 
    defaultHeight: 6, 
    category: 'search', 
    resizable: false 
  },
];

const DUMMY_CONTENT = {
  'scalable-1': <ScalablePanel label="Scalable A" />,
  'fixed-1': <div className="p-4"><FixedPanel label="Fixed A" /></div>,
  'scalable-2': <ScalablePanel label="Scalable B" />,
  'fixed-2': <div className="p-4"><FixedPanel label="Fixed B" /></div>,
};

export const LayoutBehavior: Story = {
  args: {
    panelDefinitions: DUMMY_PANELS,
    panelContent: DUMMY_CONTENT,
    className: 'bg-background h-screen p-4',
    headerLeft: (
      <h1 className="text-xl font-bold flex items-center gap-2 text-text">
        <LayoutTemplate className="w-6 h-6" />
        Layout Verification
      </h1>
    ),
  },
};
