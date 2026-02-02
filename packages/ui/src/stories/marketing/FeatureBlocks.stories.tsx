import type { Meta, StoryObj } from '@storybook/react';
import { FeatureBlocks } from '../../components/marketing/FeatureBlocks';
import { codragFeatures, marketingFeatures } from '../../components/marketing/FeatureBlocks';

const meta: Meta<typeof FeatureBlocks> = {
  title: 'Marketing/FeatureBlocks',
  component: FeatureBlocks,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof FeatureBlocks>;

export const Cards: Story = {
  args: {
    features: codragFeatures,
    variant: 'cards',
  },
};

export const List: Story = {
  args: {
    features: marketingFeatures,
    variant: 'list',
  },
};

export const Bento: Story = {
  args: {
    features: codragFeatures.slice(0, 4), // Bento looks best with 4 items
    variant: 'bento',
  },
};
