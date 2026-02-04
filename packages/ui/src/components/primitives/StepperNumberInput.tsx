import { cn } from '../../lib/utils';
import { Button } from './Button';
import { Minus, Plus } from 'lucide-react';

export interface StepperNumberInputProps {
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  className?: string;
}

export function StepperNumberInput({
  value,
  onValueChange,
  min,
  max,
  step = 1,
  disabled = false,
  className,
}: StepperNumberInputProps) {
  const clamp = (v: number) => {
    let next = v;
    if (typeof min === 'number') next = Math.max(min, next);
    if (typeof max === 'number') next = Math.min(max, next);
    return next;
  };

  const inc = () => onValueChange(clamp(value + step));
  const dec = () => onValueChange(clamp(value - step));

  return (
    <div
      className={cn(
        'w-full min-w-0 rounded-md border border-border bg-surface-raised p-2',
        'flex flex-wrap items-stretch gap-2',
        disabled && 'opacity-60',
        className
      )}
    >
      <input
        type="number"
        inputMode="numeric"
        value={Number.isFinite(value) ? value : ''}
        onChange={(e) => {
          const raw = e.target.value;
          const parsed = raw === '' ? NaN : Number(raw);
          if (!Number.isNaN(parsed)) onValueChange(clamp(parsed));
        }}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        className={cn(
          'min-w-[5rem] flex-1 rounded-md border border-border bg-surface px-3 py-2 text-sm text-text',
          'placeholder:text-text-muted',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
          'disabled:cursor-not-allowed'
        )}
      />

      <div className="flex shrink-0 gap-2 flex-wrap">
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Decrement"
          disabled={disabled || (typeof min === 'number' && value <= min)}
          onClick={dec}
          className="bg-surface w-10 min-w-[2.5rem]"
        >
          <Minus className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Increment"
          disabled={disabled || (typeof max === 'number' && value >= max)}
          onClick={inc}
          className="bg-surface w-10 min-w-[2.5rem]"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
