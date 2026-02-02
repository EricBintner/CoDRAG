import { useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import { DashboardGrid } from './DashboardGrid';
import { PanelChrome } from './PanelChrome';
import { PanelPicker } from './PanelPicker';
import { useLayoutPersistence } from './useLayoutPersistence';
import type { PanelDefinition } from '../../types/layout';
import { cn } from '../../lib/utils';

export interface PanelContentMap {
  [panelId: string]: ReactNode;
}

export interface ModularDashboardProps {
  panelDefinitions: PanelDefinition[];
  panelContent: PanelContentMap;
  className?: string;
  headerLeft?: ReactNode;
  headerRight?: ReactNode;
  rowHeight?: number;
}

/**
 * ModularDashboard - A complete modular dashboard layout
 * 
 * Wraps DashboardGrid with panel chrome, picker, and persistence.
 * Pass panelDefinitions and panelContent to render panels.
 */
export function ModularDashboard({
  panelDefinitions,
  panelContent,
  className,
  headerLeft,
  headerRight,
  rowHeight = 60,
}: ModularDashboardProps) {
  const {
    layout,
    updateLayout,
    togglePanelVisibility,
    togglePanelCollapsed,
    resetLayout,
  } = useLayoutPersistence({});

  // Get collapse state for a panel
  const getCollapseState = useCallback(
    (panelId: string) => {
      const panel = layout.panels.find((p) => p.id === panelId);
      return panel?.collapsed ?? false;
    },
    [layout.panels]
  );


  // Get panel definition
  const getDefinition = useCallback(
    (panelId: string) => {
      return panelDefinitions.find((d) => d.id === panelId);
    },
    [panelDefinitions]
  );

  // Visible panels only
  const visiblePanels = useMemo(() => {
    return layout.panels.filter((p) => p.visible);
  }, [layout.panels]);

  return (
    <div className={cn('codrag-modular-dashboard', className)}>
      {/* Header with Panel Picker */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          {headerLeft}
        </div>
        <div className="flex items-center gap-4">
          {headerRight}
          <PanelPicker
            layout={layout}
            panelDefinitions={panelDefinitions}
            onTogglePanel={togglePanelVisibility}
            onResetLayout={resetLayout}
          />
        </div>
      </div>

      {/* Dashboard Grid */}
      <DashboardGrid
        layout={layout}
        onLayoutChange={updateLayout}
        rowHeight={rowHeight}
      >
        {visiblePanels.map((panel) => {
          const def = getDefinition(panel.id);
          if (!def) return null;

          const collapsed = getCollapseState(panel.id);
          const content = panelContent[panel.id];

          return (
            <div key={panel.id}>
              <PanelChrome
                title={def.title}
                icon={def.icon}
                collapsed={collapsed}
                onCollapse={() => togglePanelCollapsed(panel.id)}
                closeable={def.closeable}
                onClose={def.closeable ? () => togglePanelVisibility(panel.id) : undefined}
              >
                {content ?? (
                  <div className="p-4 text-sm text-text-muted">
                    Panel content not provided
                  </div>
                )}
              </PanelChrome>
            </div>
          );
        })}
      </DashboardGrid>
    </div>
  );
}
