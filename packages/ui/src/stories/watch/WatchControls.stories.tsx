import type { Meta, StoryObj } from '@storybook/react';
import { WatchControlPanel } from '../../components/watch/WatchControlPanel';
import { WatchStatusIndicator } from '../../components/watch/WatchStatusIndicator';
import type { WatchStatus } from '../../types';

const meta: Meta<typeof WatchControlPanel> = {
  title: 'Dashboard/Widgets/WatchControls',
  component: WatchControlPanel,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof WatchControlPanel>;

const disabledStatus: WatchStatus = {
  enabled: false,
  state: 'disabled',
  stale: false,
  pending: false,
};

const idleStatus: WatchStatus = {
  enabled: true,
  state: 'idle',
  stale: false,
  pending: false,
};

const staleStatus: WatchStatus = {
  enabled: true,
  state: 'idle',
  stale: true,
  pending: false,
  pending_paths_count: 3,
};

const debouncingStatus: WatchStatus = {
  enabled: true,
  state: 'debouncing',
  stale: true,
  pending: true,
  pending_paths_count: 5,
  next_rebuild_at: '2026-02-05T15:01:00Z',
};

const buildingStatus: WatchStatus = {
  enabled: true,
  state: 'building',
  stale: false,
  pending: false,
};

export const Disabled: Story = {
  args: {
    status: disabledStatus,
    onStartWatch: () => console.log('start'),
    onStopWatch: () => console.log('stop'),
  },
};

export const Watching: Story = {
  args: {
    status: idleStatus,
    onStartWatch: () => console.log('start'),
    onStopWatch: () => console.log('stop'),
  },
};

export const Stale: Story = {
  args: {
    status: staleStatus,
    onStartWatch: () => console.log('start'),
    onStopWatch: () => console.log('stop'),
    onRebuildNow: () => console.log('rebuild'),
  },
};

export const Debouncing: Story = {
  args: {
    status: debouncingStatus,
    onStartWatch: () => console.log('start'),
    onStopWatch: () => console.log('stop'),
    onRebuildNow: () => console.log('rebuild'),
  },
};

export const Building: Story = {
  args: {
    status: buildingStatus,
    onStartWatch: () => console.log('start'),
    onStopWatch: () => console.log('stop'),
  },
};

export const Loading: Story = {
  args: {
    status: disabledStatus,
    onStartWatch: () => console.log('start'),
    onStopWatch: () => console.log('stop'),
    loading: true,
  },
};

export const IndicatorOnly: StoryObj<typeof WatchStatusIndicator> = {
  render: () => (
    <div className="space-y-4">
      <WatchStatusIndicator status={disabledStatus} />
      <WatchStatusIndicator status={idleStatus} />
      <WatchStatusIndicator status={staleStatus} onRebuildNow={() => {}} showDetails />
      <WatchStatusIndicator status={debouncingStatus} showDetails />
      <WatchStatusIndicator status={buildingStatus} />
    </div>
  ),
};
