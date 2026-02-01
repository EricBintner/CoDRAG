import { Search, Loader2 } from 'lucide-react';
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
    <div className={cn(
      'rounded-lg border border-border bg-surface p-6 space-y-4 shadow-sm',
      className
    )}>
      <h2 className="text-lg font-semibold flex items-center gap-2 text-text">
        <Search className="w-5 h-5 text-primary" />
        Search
      </h2>

      <div className="flex gap-3 flex-wrap">
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search query..."
          disabled={disabled}
          className="flex-1 min-w-[200px] bg-surface-raised border border-border rounded-md px-3 py-2 text-sm text-text placeholder:text-text-subtle focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 transition-all"
        />
        <input
          type="number"
          value={k}
          onChange={(e) => onKChange(parseInt(e.target.value) || 8)}
          min={1}
          max={50}
          title="Number of results"
          disabled={disabled}
          className="w-20 bg-surface-raised border border-border rounded-md px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 transition-all"
        />
        <input
          type="number"
          value={minScore}
          onChange={(e) => onMinScoreChange(parseFloat(e.target.value) || 0.15)}
          min={0}
          max={1}
          step={0.05}
          title="Minimum score"
          disabled={disabled}
          className="w-24 bg-surface-raised border border-border rounded-md px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 transition-all"
        />
        <button
          onClick={onSearch}
          disabled={loading || disabled || !query.trim()}
          className="bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed rounded-md px-4 py-2 font-medium text-white text-sm transition-colors flex items-center gap-2 shadow-sm"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Search
        </button>
      </div>
    </div>
  );
}
