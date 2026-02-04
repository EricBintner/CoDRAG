import { Copy, Settings2 } from 'lucide-react';
import { Card, Title, Text } from '@tremor/react';
import { Button } from '../primitives/Button';
import { Toggle } from '../primitives/Toggle';
import { StepperNumberInput } from '../primitives/StepperNumberInput';
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
  bare?: boolean;
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
  bare = false,
}: ContextOptionsPanelProps) {
  const Container = bare ? 'div' : Card;

  return (
    <Container className={cn(!bare && 'border border-border bg-surface shadow-sm', className)}>
      {!bare && (
        <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
          <div className="flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-primary shrink-0" />
            <Title className="text-text truncate">Context Options</Title>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              onClick={onGetContext}
              disabled={disabled}
              className="whitespace-nowrap"
            >
              Get Context
            </Button>
            {onCopyContext && (
              <Button
                size="sm"
                variant="outline"
                onClick={onCopyContext}
                disabled={!hasContext}
                className="whitespace-nowrap"
                icon={Copy}
              >
                Copy
              </Button>
            )}
          </div>
        </div>
      )}

      <div className="space-y-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[12rem]">
            <label className="block text-sm font-medium text-text-muted mb-2">
              Chunks (k)
            </label>
            <StepperNumberInput value={k} onValueChange={onKChange} min={1} max={50} disabled={disabled} />
          </div>

          <div className="flex-1 min-w-[12rem]">
            <label className="block text-sm font-medium text-text-muted mb-2">
              Max Chars
            </label>
            <StepperNumberInput value={maxChars} onValueChange={onMaxCharsChange} min={200} max={200000} step={100} disabled={disabled} />
          </div>
        </Flex>

        <div className="border-t border-border" />

        <div className="space-y-3">
          <label className="block text-sm font-medium text-text-muted">
            Inclusions
          </label>
          <Flex className="gap-6 w-auto" justifyContent="start">
            <label className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
              <Switch
                checked={includeSources}
                onChange={onIncludeSourcesChange}
                disabled={disabled}
              />
              <Text className="text-sm text-text">Sources</Text>
            </label>

            <label className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
              <Switch
                checked={includeScores}
                onChange={onIncludeScoresChange}
                disabled={disabled}
              />
              <Text className="text-sm text-text">Scores</Text>
            </label>

            <label className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
              <Switch
                checked={structured}
                onChange={onStructuredChange}
                disabled={disabled}
              />
              <Text className="text-sm text-text">Structured</Text>
            </label>
          </Flex>
        </div>
      </div>
    </Container>
  );
}
