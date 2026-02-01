import { Copy, Settings2 } from 'lucide-react';
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
    <div className={cn(
      'bg-surface border border-border rounded-lg p-4 shadow-sm',
      className
    )}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-text flex items-center gap-2">
          <Settings2 className="w-4 h-4 text-primary" />
          Context Options
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={onGetContext}
            disabled={disabled}
            className="bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed rounded-md px-3 py-1.5 text-xs font-medium text-white transition-colors shadow-sm"
          >
            Get Context
          </button>
          {onCopyContext && (
            <button
              onClick={onCopyContext}
              disabled={!hasContext}
              className="bg-surface hover:bg-surface-raised border border-border disabled:opacity-50 disabled:cursor-not-allowed rounded-md px-3 py-1.5 text-xs font-medium text-text transition-colors flex items-center gap-1.5"
              title="Copy context"
            >
              <Copy className="w-3.5 h-3.5" />
              Copy
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-4 flex-wrap items-center text-sm">
        <div className="flex items-center gap-2">
          <span className="text-text-muted font-medium text-xs">k</span>
          <input
            type="number"
            value={k}
            onChange={(e) => onKChange(parseInt(e.target.value) || 5)}
            min={1}
            max={50}
            disabled={disabled}
            className="w-16 bg-surface-raised border border-border rounded-md px-2 py-1 text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-text-muted font-medium text-xs">max_chars</span>
          <input
            type="number"
            value={maxChars}
            onChange={(e) => onMaxCharsChange(parseInt(e.target.value) || 6000)}
            min={200}
            max={200000}
            disabled={disabled}
            className="w-24 bg-surface-raised border border-border rounded-md px-2 py-1 text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 transition-all"
          />
        </div>

        <div className="h-4 w-px bg-border mx-2" />

        <label className="flex items-center gap-2 text-text cursor-pointer select-none group">
          <input
            type="checkbox"
            checked={includeSources}
            onChange={(e) => onIncludeSourcesChange(e.target.checked)}
            disabled={disabled}
            className="rounded border-border text-primary focus:ring-primary bg-surface-raised"
          />
          <span className="text-xs group-hover:text-primary transition-colors">include_sources</span>
        </label>

        <label className="flex items-center gap-2 text-text cursor-pointer select-none group">
          <input
            type="checkbox"
            checked={includeScores}
            onChange={(e) => onIncludeScoresChange(e.target.checked)}
            disabled={disabled}
            className="rounded border-border text-primary focus:ring-primary bg-surface-raised"
          />
          <span className="text-xs group-hover:text-primary transition-colors">include_scores</span>
        </label>

        <label className="flex items-center gap-2 text-text cursor-pointer select-none group">
          <input
            type="checkbox"
            checked={structured}
            onChange={(e) => onStructuredChange(e.target.checked)}
            disabled={disabled}
            className="rounded border-border text-primary focus:ring-primary bg-surface-raised"
          />
          <span className="text-xs group-hover:text-primary transition-colors">structured</span>
        </label>
      </div>
    </div>
  );
}
