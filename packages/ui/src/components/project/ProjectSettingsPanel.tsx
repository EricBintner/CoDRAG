import { useState } from 'react';
import { Button, Switch, NumberInput, TextInput } from '@tremor/react';
import { cn } from '../../lib/utils';
import type { ProjectConfig } from '../../types';

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

  return (
    <div className={cn('codrag-project-settings space-y-6', className)}>
      {/* Include Globs */}
      <section>
        <h3 className="text-sm font-semibold mb-2">Include Patterns</h3>
        <p className="text-xs text-gray-500 mb-2">
          Glob patterns for files to include in the index
        </p>
        <div className="flex gap-2 mb-2">
          <TextInput
            placeholder="**/*.py"
            value={includeInput}
            onChange={(e) => setIncludeInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addIncludeGlob()}
          />
          <Button size="xs" onClick={addIncludeGlob}>Add</Button>
        </div>
        <div className="flex flex-wrap gap-1">
          {config.include_globs.map((glob) => (
            <span
              key={glob}
              className="inline-flex items-center gap-1 rounded bg-gray-100 px-2 py-1 text-xs dark:bg-gray-800"
            >
              <code>{glob}</code>
              <button
                onClick={() => removeIncludeGlob(glob)}
                className="text-gray-400 hover:text-red-500"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </section>

      {/* Exclude Globs */}
      <section>
        <h3 className="text-sm font-semibold mb-2">Exclude Patterns</h3>
        <p className="text-xs text-gray-500 mb-2">
          Glob patterns for files to exclude from the index
        </p>
        <div className="flex gap-2 mb-2">
          <TextInput
            placeholder="**/node_modules/**"
            value={excludeInput}
            onChange={(e) => setExcludeInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addExcludeGlob()}
          />
          <Button size="xs" onClick={addExcludeGlob}>Add</Button>
        </div>
        <div className="flex flex-wrap gap-1">
          {config.exclude_globs.map((glob) => (
            <span
              key={glob}
              className="inline-flex items-center gap-1 rounded bg-gray-100 px-2 py-1 text-xs dark:bg-gray-800"
            >
              <code>{glob}</code>
              <button
                onClick={() => removeExcludeGlob(glob)}
                className="text-gray-400 hover:text-red-500"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </section>

      {/* Max File Size */}
      <section>
        <h3 className="text-sm font-semibold mb-2">Max File Size</h3>
        <p className="text-xs text-gray-500 mb-2">
          Maximum file size in bytes to include (default: 200KB)
        </p>
        <NumberInput
          value={config.max_file_bytes}
          onValueChange={(val) => onChange({ ...config, max_file_bytes: val })}
          min={1000}
          max={10000000}
          step={10000}
        />
      </section>

      {/* Trace Index Toggle */}
      <section className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">Trace Index</h3>
          <p className="text-xs text-gray-500">
            Enable structural indexing (symbols, imports)
          </p>
        </div>
        <Switch
          checked={config.trace.enabled}
          onChange={(checked) =>
            onChange({ ...config, trace: { ...config.trace, enabled: checked } })
          }
        />
      </section>

      {/* Auto-Rebuild Toggle */}
      <section className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">Auto-Rebuild</h3>
          <p className="text-xs text-gray-500">
            Automatically rebuild index on file changes
          </p>
        </div>
        <Switch
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
        <section>
          <h3 className="text-sm font-semibold mb-2">Debounce Interval</h3>
          <p className="text-xs text-gray-500 mb-2">
            Wait time before triggering rebuild (ms)
          </p>
          <NumberInput
            value={config.auto_rebuild.debounce_ms || 5000}
            onValueChange={(val) =>
              onChange({
                ...config,
                auto_rebuild: { ...config.auto_rebuild, debounce_ms: val },
              })
            }
            min={1000}
            max={60000}
            step={1000}
          />
        </section>
      )}

      {/* Save Button */}
      {isDirty && (
        <div className="pt-4 border-t">
          <Button onClick={onSave}>Save Changes</Button>
        </div>
      )}
    </div>
  );
}
