import { useState } from 'react';
import { Check, Plus, RotateCcw } from 'lucide-react';
import type { DashboardLayout, PanelDefinition } from '../../types/layout';
import { cn } from '../../lib/utils';

export interface PanelPickerProps {
  layout: DashboardLayout;
  panelDefinitions: PanelDefinition[];
  onTogglePanel: (panelId: string) => void;
  onResetLayout: () => void;
  className?: string;
}

export function PanelPicker({
  layout,
  panelDefinitions,
  onTogglePanel,
  onResetLayout,
  className,
}: PanelPickerProps) {
  const [open, setOpen] = useState(false);

  const visibleIds = new Set(
    layout.panels.filter((p) => p.visible).map((p) => p.id)
  );

  const handleToggle = (panelId: string) => {
    onTogglePanel(panelId);
  };

  const handleReset = () => {
    if (window.confirm('Reset layout to defaults? This will restore all panels to their original positions.')) {
      onResetLayout();
      setOpen(false);
    }
  };

  return (
    <div className={cn('relative', className)}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-surface-raised border border-border rounded-md hover:bg-muted transition-colors text-text"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <Plus className="w-4 h-4" />
        <span>Panels</span>
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 w-64 bg-surface border border-border rounded-lg shadow-lg z-50 overflow-hidden">
            <div className="p-2 border-b border-border">
              <span className="text-xs font-medium text-text-muted uppercase tracking-wide">
                Toggle Panels
              </span>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {panelDefinitions.map((def) => {
                const isVisible = visibleIds.has(def.id);
                const Icon = def.icon;

                return (
                  <button
                    key={def.id}
                    onClick={() => handleToggle(def.id)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2 text-sm text-left hover:bg-muted transition-colors',
                      isVisible ? 'text-text' : 'text-text-muted'
                    )}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="flex-1 truncate">{def.title}</span>
                    {isVisible && (
                      <Check className="w-4 h-4 text-success flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="p-2 border-t border-border">
              <button
                onClick={handleReset}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-text-muted hover:text-text hover:bg-muted rounded-md transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset Layout</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
