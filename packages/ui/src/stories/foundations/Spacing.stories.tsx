import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta = {
  title: 'Foundations/Spacing',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;

type Story = StoryObj;

const spaceVars = [
  '--space-0-5',
  '--space-1',
  '--space-1-5',
  '--space-2',
  '--space-2-5',
  '--space-3',
  '--space-3-5',
  '--space-4',
  '--space-5',
  '--space-6',
  '--space-8',
  '--space-10',
  '--space-12',
  '--space-16',
  '--space-20',
  '--space-24',
];

const radiusVars = [
  '--radius-sm',
  '--radius-md',
  '--radius-lg',
  '--radius-xl',
  '--radius-2xl',
  '--radius-3xl',
  '--radius-full',
];

function SpaceRow({ varName }: { varName: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-28 text-xs font-mono text-text-muted">{varName}</div>
      <div
        className="h-3 rounded bg-primary-muted border border-border"
        style={{ width: `calc(var(${varName}) * 12)` }}
      />
      <div className="text-xs text-text-subtle">x12 visual scale</div>
    </div>
  );
}

function RadiusRow({ varName }: { varName: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-28 text-xs font-mono text-text-muted">{varName}</div>
      <div
        className="h-10 w-10 border border-border bg-surface-raised"
        style={{ borderRadius: `var(${varName})` }}
      />
    </div>
  );
}

export const Tokens: Story = {
  render: () => (
    <div className="space-y-10">
      <section className="space-y-4">
        <h2 className="text-base font-semibold text-text">Spacing</h2>
        <div className="space-y-2">
          {spaceVars.map((v) => (
            <SpaceRow key={v} varName={v} />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-base font-semibold text-text">Radii</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {radiusVars.map((v) => (
            <RadiusRow key={v} varName={v} />
          ))}
        </div>
      </section>
    </div>
  ),
};
