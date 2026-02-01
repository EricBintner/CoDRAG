import type { Meta, StoryObj } from '@storybook/react';
import { WatchStatusIndicator } from '../../components/watch/WatchStatusIndicator';
import type { WatchStatus } from '../../types';

const meta: Meta<typeof WatchStatusIndicator> = {
  title: 'Components/Watch/WatchStatusIndicator',
  component: WatchStatusIndicator,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof WatchStatusIndicator>;

const base: WatchStatus = {
  enabled: true,
  state: 'idle',
  stale: false,
  pending: false,
  pending_paths_count: 0,
  last_rebuild_at: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
};

export const Idle: Story = {
  args: {
    status: base,
  },
};

export const Debouncing: Story = {
  args: {
    status: {
      ...base,
      state: 'debouncing',
      stale: true,
      pending_paths_count: 6,
      next_rebuild_at: new Date(Date.now() + 1000 * 12).toISOString(),
    },
    showDetails: true,
  },
};

export const Building: Story = {
  args: {
    status: {
      ...base,
      state: 'building',
      pending: true,
    },
  },
};

export const Throttled: Story = {
  args: {
    status: {
      ...base,
      state: 'throttled',
      stale: true,
      pending_paths_count: 42,
    },
    showDetails: true,
    onRebuildNow: () => console.log('Rebuild now'),
  },
};

export const Disabled: Story = {
  args: {
    status: {
      ...base,
      enabled: false,
      state: 'disabled',
    },
  },
};
