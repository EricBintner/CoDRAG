import type { KeyboardEvent } from 'react';
import { cn } from '../../lib/utils';
import { Search, Loader2 } from 'lucide-react';

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  loading?: boolean;
  className?: string;
}

/**
 * SearchInput - Query input for semantic search
 * 
 * Provides:
 * - Text input with search placeholder
 * - Submit on Enter
 * - Loading state indicator
 */
export function SearchInput({
  value,
  onChange,
  onSubmit,
  placeholder = 'Search code...',
  loading = false,
  className,
}: SearchInputProps) {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && onSubmit) {
      onSubmit();
    }
  };

  return (
    <div className={cn('relative', className)}>
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle pointer-events-none">
        <Search className="w-4 h-4" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={loading}
        className={cn(
          "w-full bg-surface-raised border border-border rounded-md py-2 pl-9 pr-4 text-sm text-text",
          "placeholder:text-text-subtle",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "transition-all duration-200"
        )}
      />
      {loading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
        </div>
      )}
    </div>
  );
}
