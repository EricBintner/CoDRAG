import { Copy, Settings2 } from 'lucide-react';
import { Card, Title, NumberInput, Button, Text } from '@tremor/react';
import { Toggle } from '../primitives/Toggle';
import { cn } from '../../lib/utils';

export interface ContextOptionsPanelProps {
  k: number;
  onKChange: (value: number) => void;
  maxChars: number;
  onMaxCharsChange: (value: number) => void;
  includeSources: boolean;
  onIncludeSourcesChange: (value: boolean) => void;
  includeScores: boolean;
  onIncludeScoresChange: (value: boolean) => void;
  structured: boolean;
  onStructuredChange: (value: boolean) => void;
  onGetContext: () => void;
  onCopyContext?: () => void;
  hasContext?: boolean;
  disabled?: boolean;
  className?: string;
}

/**
 * ContextOptionsPanel - Controls for context assembly.
 * 
 * Provides:
 * - k (number of chunks) input
 * - max_chars limit input
 * - include_sources toggle
 * - include_scores toggle
 * - structured response toggle
 * - Get Context / Copy buttons
 */
export function ContextOptionsPanel({
  k,
  onKChange,
  maxChars,
  onMaxCharsChange,
  includeSources,
  onIncludeSourcesChange,
  includeScores,
  onIncludeScoresChange,
  structured,
  onStructuredChange,
  onGetContext,
  onCopyContext,
  hasContext = false,
  disabled = false,
  className,
}: ContextOptionsPanelProps) {
  return (
    <Card className={cn('border border-border bg-surface shadow-sm', className)}>
      <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
        <div className="flex items-center gap-2">
          <Settings2 className="w-5 h-5 text-primary shrink-0" />
          <Title className="text-text truncate">Context Options</Title>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="xs"
            onClick={onGetContext}
            disabled={disabled}
            className="bg-primary hover:bg-primary-hover text-white border-none whitespace-nowrap"
          >
            Get Context
          </Button>
          {onCopyContext && (
            <Button
              size="xs"
              variant="secondary"
              onClick={onCopyContext}
              disabled={!hasContext}
              className="border border-border whitespace-nowrap"
              icon={Copy}
            >
              Copy
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-muted mb-2">
              Chunks (k)
            </label>
            <NumberInput
              value={k}
              onValueChange={onKChange}
              min={1}
              max={50}
              disabled={disabled}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-muted mb-2">
              Max Chars
            </label>
            <NumberInput
              value={maxChars}
              onValueChange={onMaxCharsChange}
              min={200}
              max={200000}
              disabled={disabled}
              className="w-full"
            />
          </div>
        </div>

        <div className="border-t border-border" />

        <div className="space-y-3">
          <label className="block text-sm font-medium text-text-muted">
            Inclusions
          </label>
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            <label className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
              <Toggle
                checked={includeSources}
                onChange={onIncludeSourcesChange}
                disabled={disabled}
                size="sm"
              />
              <Text className="text-sm text-text whitespace-nowrap">Sources</Text>
            </label>

            <label className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
              <Toggle
                checked={includeScores}
                onChange={onIncludeScoresChange}
                disabled={disabled}
                size="sm"
              />
              <Text className="text-sm text-text whitespace-nowrap">Scores</Text>
            </label>

            <label className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
              <Toggle
                checked={structured}
                onChange={onStructuredChange}
                disabled={disabled}
                size="sm"
              />
              <Text className="text-sm text-text whitespace-nowrap">Structured</Text>
            </label>
          </div>
        </div>
      </div>
    </Card>
  );
}
