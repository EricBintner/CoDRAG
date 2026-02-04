import type { Meta, StoryObj } from '@storybook/react';
import { MarketingHero } from '../../components/marketing/MarketingHero';

const meta: Meta<typeof MarketingHero> = {
  title: 'Website/Marketing/Hero',
  component: MarketingHero,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof MarketingHero>;

export const Centered: Story = {
  args: {
    variant: 'centered',
  },
};

export const Split: Story = {
  args: {
    variant: 'split',
  },
};

export const NeoBrutalist: Story = {
  args: {
    variant: 'neo',
  },
};

export const Swiss: Story = {
  args: {
    variant: 'swiss',
  },
};

export const Glass: Story = {
  args: {
    variant: 'glass',
  },
};

export const Retro: Story = {
  args: {
    variant: 'retro',
  },
};

export const Studio: Story = {
  args: {
    variant: 'studio',
  },
};

export const Yale: Story = {
  args: {
    variant: 'yale',
  },
};

export const Focus: Story = {
  args: {
    variant: 'focus',
  },
};

export const Enterprise: Story = {
  args: {
    variant: 'enterprise',
  },
};
