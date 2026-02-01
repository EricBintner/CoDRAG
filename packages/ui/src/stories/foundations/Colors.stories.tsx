import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta = {
  title: 'Foundations/Colors',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;

type Story = StoryObj;

function ColorSwatch({
  name,
  className,
}: {
  name: string;
  className: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className={`h-10 w-10 rounded-md border border-border ${className}`} />
      <div className="min-w-0">
        <div className="text-sm font-medium text-text">{name}</div>
        <div className="text-xs font-mono text-text-muted">{className}</div>
      </div>
    </div>
  );
}

function TextSwatch({
  name,
  className,
}: {
  name: string;
  className: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-10 w-10 rounded-md border border-border bg-surface flex items-center justify-center">
        <span className={`text-sm font-semibold ${className}`}>Aa</span>
      </div>
      <div className="min-w-0">
        <div className="text-sm font-medium text-text">{name}</div>
        <div className="text-xs font-mono text-text-muted">{className}</div>
      </div>
    </div>
  );
}

export const Overview: Story = {
  render: () => (
    <div className="space-y-10">
      <section className="space-y-4">
        <h2 className="text-base font-semibold text-text">Surfaces</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ColorSwatch name="Background" className="bg-background" />
          <ColorSwatch name="Surface" className="bg-surface" />
          <ColorSwatch name="Surface (Raised)" className="bg-surface-raised" />
          <ColorSwatch name="Muted" className="bg-muted" />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-base font-semibold text-text">Text</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextSwatch name="Text" className="text-text" />
          <TextSwatch name="Text (Muted)" className="text-text-muted" />
          <TextSwatch name="Text (Subtle)" className="text-text-subtle" />
          <TextSwatch name="Foreground" className="text-foreground" />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-base font-semibold text-text">Borders + Focus</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ColorSwatch name="Border" className="bg-border" />
          <ColorSwatch name="Border (Subtle)" className="bg-border-subtle" />
          <ColorSwatch name="Ring" className="bg-[hsl(var(--ring))]" />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-base font-semibold text-text">Accent</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ColorSwatch name="Primary" className="bg-primary" />
          <ColorSwatch name="Primary (Hover)" className="bg-primary-hover" />
          <ColorSwatch name="Primary (Muted)" className="bg-primary-muted" />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-base font-semibold text-text">Semantic</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ColorSwatch name="Success" className="bg-success" />
          <ColorSwatch name="Success (Muted)" className="bg-success-muted" />
          <ColorSwatch name="Warning" className="bg-warning" />
          <ColorSwatch name="Warning (Muted)" className="bg-warning-muted" />
          <ColorSwatch name="Error" className="bg-error" />
          <ColorSwatch name="Error (Muted)" className="bg-error-muted" />
          <ColorSwatch name="Info" className="bg-info" />
          <ColorSwatch name="Info (Muted)" className="bg-info-muted" />
        </div>
      </section>
    </div>
  ),
};
