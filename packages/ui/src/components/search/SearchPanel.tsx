import { Search, Loader2 } from 'lucide-react';
import { Card, Flex, Title, TextInput, NumberInput, Button } from '@tremor/react';
import { cn } from '../../lib/utils';
import type { KeyboardEvent } from 'react';

export interface SearchPanelProps {
  query: string;
  onQueryChange: (value: string) => void;
  k: number;
  onKChange: (value: number) => void;
  minScore: number;
  onMinScoreChange: (value: number) => void;
  onSearch: () => void;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

/**
 * SearchPanel - Search input with configurable parameters.
 * 
 * Provides:
 * - Query text input with Enter key support
 * - Number of results (k) input
 * - Minimum score threshold input
 * - Search button with loading state
 */
export function SearchPanel({
  query,
  onQueryChange,
  k,
  onKChange,
  minScore,
  onMinScoreChange,
  onSearch,
  loading = false,
  disabled = false,
  className,
}: SearchPanelProps) {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !loading && !disabled && query.trim()) {
      onSearch();
    }
  };

  return (
    <Card className={cn("border border-border bg-surface shadow-sm", className)}>
      <Flex justifyContent="between" alignItems="center" className="mb-4">
        <div className="flex items-center gap-2">
          <Search className="w-5 h-5 text-primary" />
          <Title className="text-text">Semantic Search</Title>
        </div>
      </Flex>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-text-muted mb-2">
            Search Query
          </label>
          <TextInput
            icon={Search}
            value={query}
            onValueChange={onQueryChange}
            onKeyDown={handleKeyDown}
            placeholder="Search your codebase semantically..."
            disabled={disabled}
            className="w-full"
          />
        </div>
        
        <Flex className="gap-4" justifyContent="start" alignItems="end">
          <div className="w-32">
            <label className="block text-sm font-medium text-text-muted mb-2">
              Results (K)
            </label>
            <NumberInput
              value={k}
              onValueChange={onKChange}
              min={1}
              max={50}
              placeholder="K"
              disabled={disabled}
              className="w-full"
            />
          </div>
          <div className="w-32">
            <label className="block text-sm font-medium text-text-muted mb-2">
              Min Score
            </label>
             <NumberInput
              value={minScore}
              onValueChange={onMinScoreChange}
              min={0}
              max={1}
              step={0.05}
              placeholder="0.0 - 1.0"
              disabled={disabled}
              className="w-full"
            />
          </div>
          <Button
            onClick={onSearch}
            disabled={loading || disabled || !query.trim()}
            className="bg-primary hover:bg-primary-hover text-white border-none px-8"
            icon={loading ? Loader2 : undefined}
          >
            {loading ? 'Searching...' : 'Search'}
          </Button>
        </Flex>
      </div>
    </Card>
  );
}
