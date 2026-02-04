import { cn } from '../../lib/utils';

export interface NumberFieldProps {
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function NumberField({
  value,
  onValueChange,
  min,
  max,
  step,
  placeholder,
  disabled = false,
  className,
}: NumberFieldProps) {
  return (
    <input
      type="number"
      inputMode="numeric"
      value={Number.isFinite(value) ? value : ''}
      onChange={(e) => {
        const next = e.target.value;
        const parsed = next === '' ? NaN : Number(next);
        if (!Number.isNaN(parsed)) onValueChange(parsed);
      }}
      min={min}
      max={max}
      step={step}
      placeholder={placeholder}
      disabled={disabled}
      className={cn(
        'w-full min-w-0 rounded-md border border-border bg-surface-raised px-3 py-2 text-sm text-text',
        'placeholder:text-text-muted',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
        'disabled:cursor-not-allowed disabled:opacity-60',
        className
      )}
    />
  );
}
