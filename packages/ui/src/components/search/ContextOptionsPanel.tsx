import { Copy, Settings2 } from 'lucide-react';
import { Card, Flex, Title, NumberInput, Switch, Button, Text } from '@tremor/react';
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
      <Flex justifyContent="between" alignItems="center" className="mb-4">
        <Flex className="gap-2" justifyContent="start">
          <Settings2 className="w-5 h-5 text-primary" />
          <Title className="text-text">Context Options</Title>
        </Flex>
        <Flex className="gap-2" justifyContent="end">
          <Button
            size="xs"
            onClick={onGetContext}
            disabled={disabled}
            className="bg-primary hover:bg-primary-hover text-white border-none"
          >
            Get Context
          </Button>
          {onCopyContext && (
            <Button
              size="xs"
              variant="secondary"
              onClick={onCopyContext}
              disabled={!hasContext}
              className="border border-border"
              icon={Copy}
            >
              Copy
            </Button>
          )}
        </Flex>
      </Flex>

      <div className="space-y-6">
        <Flex className="gap-4 flex-wrap" justifyContent="start" alignItems="start">
          <div className="w-32">
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

          <div className="w-32">
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
    </Card>
  );
}
