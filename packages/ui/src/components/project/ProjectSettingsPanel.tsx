import { useState } from 'react';
import { cn } from '../../lib/utils';
import type { ProjectConfig } from '../../types';
import { Plus, X, Save } from 'lucide-react';

export interface ProjectSettingsPanelProps {
  config: ProjectConfig;
  onChange: (config: ProjectConfig) => void;
  onSave: () => void;
  isDirty?: boolean;
  className?: string;
}

export function ProjectSettingsPanel({
  config,
  onChange,
  onSave,
  isDirty = false,
  className,
}: ProjectSettingsPanelProps) {
  const [includeInput, setIncludeInput] = useState('');
  const [excludeInput, setExcludeInput] = useState('');

  const addIncludeGlob = () => {
    if (includeInput.trim() && !config.include_globs.includes(includeInput.trim())) {
      onChange({
        ...config,
        include_globs: [...config.include_globs, includeInput.trim()],
      });
      setIncludeInput('');
    }
  };

  const removeIncludeGlob = (glob: string) => {
    onChange({
      ...config,
      include_globs: config.include_globs.filter((g) => g !== glob),
    });
  };

  const addExcludeGlob = () => {
    if (excludeInput.trim() && !config.exclude_globs.includes(excludeInput.trim())) {
      onChange({
        ...config,
        exclude_globs: [...config.exclude_globs, excludeInput.trim()],
      });
      setExcludeInput('');
    }
  };

  const removeExcludeGlob = (glob: string) => {
    onChange({
      ...config,
      exclude_globs: config.exclude_globs.filter((g) => g !== glob),
    });
  };

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) => (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
        checked ? 'bg-primary' : 'bg-surface-raised border-border'
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
          checked ? 'translate-x-5' : 'translate-x-0'
        )}
      />
    </button>
  );

  return (
    <div className={cn('codrag-card space-y-8 bg-surface p-6 rounded-lg border border-border', className)}>
      {/* Include Globs */}
      <section>
        <h3 className="text-sm font-semibold text-text mb-1">Include Patterns</h3>
        <p className="text-xs text-text-muted mb-3">
          Glob patterns for files to include in the index
        </p>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            placeholder="**/*.py"
            value={includeInput}
            onChange={(e) => setIncludeInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addIncludeGlob()}
            className="flex-1 bg-surface-raised border border-border rounded-md px-3 py-1.5 text-sm text-text placeholder:text-text-subtle focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
          <button 
            onClick={addIncludeGlob}
            disabled={!includeInput.trim()}
            className="px-3 py-1.5 bg-surface hover:bg-surface-raised border border-border rounded-md text-sm font-medium text-text disabled:opacity-50 transition-colors flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {config.include_globs.map((glob) => (
            <span
              key={glob}
              className="inline-flex items-center gap-1.5 rounded-md bg-surface-raised border border-border px-2.5 py-1 text-xs text-text font-mono"
            >
              {glob}
              <button
                onClick={() => removeIncludeGlob(glob)}
                className="text-text-subtle hover:text-error transition-colors rounded-full hover:bg-error-muted/10 p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      </section>

      {/* Exclude Globs */}
      <section>
        <h3 className="text-sm font-semibold text-text mb-1">Exclude Patterns</h3>
        <p className="text-xs text-text-muted mb-3">
          Glob patterns for files to exclude from the index
        </p>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            placeholder="**/node_modules/**"
            value={excludeInput}
            onChange={(e) => setExcludeInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addExcludeGlob()}
            className="flex-1 bg-surface-raised border border-border rounded-md px-3 py-1.5 text-sm text-text placeholder:text-text-subtle focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
          <button 
            onClick={addExcludeGlob}
            disabled={!excludeInput.trim()}
            className="px-3 py-1.5 bg-surface hover:bg-surface-raised border border-border rounded-md text-sm font-medium text-text disabled:opacity-50 transition-colors flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {config.exclude_globs.map((glob) => (
            <span
              key={glob}
              className="inline-flex items-center gap-1.5 rounded-md bg-surface-raised border border-border px-2.5 py-1 text-xs text-text font-mono"
            >
              {glob}
              <button
                onClick={() => removeExcludeGlob(glob)}
                className="text-text-subtle hover:text-error transition-colors rounded-full hover:bg-error-muted/10 p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      </section>

      <div className="h-px bg-border my-6" />

      {/* Max File Size */}
      <section>
        <h3 className="text-sm font-semibold text-text mb-1">Max File Size</h3>
        <p className="text-xs text-text-muted mb-3">
          Maximum file size in bytes to include (default: 200KB)
        </p>
        <input
          type="number"
          value={config.max_file_bytes}
          onChange={(e) => onChange({ ...config, max_file_bytes: parseInt(e.target.value) || 0 })}
          min={1000}
          max={10000000}
          step={10000}
          className="w-full bg-surface-raised border border-border rounded-md px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
        />
      </section>

      {/* Trace Index Toggle */}
      <section className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-text">Trace Index</h3>
          <p className="text-xs text-text-muted mt-0.5">
            Enable structural indexing (symbols, imports)
          </p>
        </div>
        <Toggle
          checked={config.trace.enabled}
          onChange={(checked) =>
            onChange({ ...config, trace: { ...config.trace, enabled: checked } })
          }
        />
      </section>

      {/* Auto-Rebuild Toggle */}
      <section className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-text">Auto-Rebuild</h3>
          <p className="text-xs text-text-muted mt-0.5">
            Automatically rebuild index on file changes
          </p>
        </div>
        <Toggle
          checked={config.auto_rebuild.enabled}
          onChange={(checked) =>
            onChange({
              ...config,
              auto_rebuild: { ...config.auto_rebuild, enabled: checked },
            })
          }
        />
      </section>

      {/* Debounce (if auto-rebuild enabled) */}
      {config.auto_rebuild.enabled && (
        <section className="animate-in fade-in slide-in-from-top-2 duration-200">
          <h3 className="text-sm font-semibold text-text mb-1">Debounce Interval</h3>
          <p className="text-xs text-text-muted mb-3">
            Wait time before triggering rebuild (ms)
          </p>
          <input
            type="number"
            value={config.auto_rebuild.debounce_ms || 5000}
            onChange={(e) =>
              onChange({
                ...config,
                auto_rebuild: { ...config.auto_rebuild, debounce_ms: parseInt(e.target.value) || 5000 },
              })
            }
            min={1000}
            max={60000}
            step={1000}
            className="w-full bg-surface-raised border border-border rounded-md px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
        </section>
      )}

      {/* Save Button */}
      {isDirty && (
        <div className="pt-6 border-t border-border sticky bottom-0 bg-surface -mb-6 pb-6">
          <button 
            onClick={onSave}
            className="w-full bg-primary hover:bg-primary-hover text-white rounded-md px-4 py-2 font-medium text-sm transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      )}
    </div>
  );
}
