import { TextInput, Select, SelectItem } from '@tremor/react';
import { cn } from '../../lib/utils';
import type { NodeKind } from '../../types';

export interface SymbolSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  kindFilter?: NodeKind | 'all';
  onKindFilterChange?: (kind: NodeKind | 'all') => void;
  loading?: boolean;
  placeholder?: string;
  className?: string;
}

export function SymbolSearchInput({
  value,
  onChange,
  onSubmit,
  kindFilter = 'all',
  onKindFilterChange,
  loading = false,
  placeholder = 'Search symbols...',
  className,
}: SymbolSearchInputProps) {
  return (
    <div className={cn('codrag-symbol-search flex gap-2', className)}>
      <div className="flex-1">
        <TextInput
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSubmit?.()}
          disabled={loading}
        />
      </div>
      
      {onKindFilterChange && (
        <Select
          value={kindFilter}
          onValueChange={(val) => onKindFilterChange(val as NodeKind | 'all')}
          className="w-32"
        >
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="symbol">Symbols</SelectItem>
          <SelectItem value="file">Files</SelectItem>
        </Select>
      )}
      
      {loading && (
        <div className="flex items-center px-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
        </div>
      )}
    </div>
  );
}
