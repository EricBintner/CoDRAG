import type { Meta, StoryObj } from '@storybook/react';
import { SiteFooter } from '../../components/site/SiteFooter';

const meta: Meta<typeof SiteFooter> = {
  title: 'Website/Layout/SiteFooter',
  component: SiteFooter,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof SiteFooter>;

export const Default: Story = {
  args: {
    productName: 'CoDRAG',
    socials: {
      twitter: 'https://twitter.com/codrag',
      github: 'https://github.com/codrag',
      email: 'hello@codrag.io',
    },
  },
};
