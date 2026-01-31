import * as React from 'react';
import { TextInput } from '@tremor/react';
import { cn } from '../../lib/utils';

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
 * Wireframe component - provides:
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
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && onSubmit) {
      onSubmit();
    }
  };

  return (
    <div className={cn('codrag-search-input', 'relative', className)}>
      <TextInput
        value={value}
        onValueChange={onChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={loading}
      />
      {loading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <span className="text-sm text-gray-400">Searching...</span>
        </div>
      )}
    </div>
  );
}
