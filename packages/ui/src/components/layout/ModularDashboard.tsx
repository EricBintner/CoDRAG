import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { DashboardGrid } from './DashboardGrid';
import { PanelChrome } from './PanelChrome';
import { PanelPicker } from './PanelPicker';
import { useLayoutPersistence } from './useLayoutPersistence';
import type { PanelDefinition } from '../../types/layout';
import { cn } from '../../lib/utils';
import { AutoHeightPanel } from './AutoHeightPanel';

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
  margin?: [number, number];
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
  rowHeight = 20,
  margin = [12, 12],
}: ModularDashboardProps) {
  const {
    layout,
    updateLayout,
    togglePanelVisibility,
    togglePanelCollapsed,
    resetLayout,
    setPanelHeight,
  } = useLayoutPersistence({});

  const [pendingHeights, setPendingHeights] = useState<Record<string, number>>({});

  const handleAutoHeight = useCallback(
    (panelId: string, gridUnits: number) => {
      setPendingHeights((prev) => {
        if (prev[panelId] === gridUnits) return prev;
        return { ...prev, [panelId]: gridUnits };
      });
    },
    []
  );

  useEffect(() => {
    const entries = Object.entries(pendingHeights);
    if (entries.length === 0) return;

    for (const [panelId, height] of entries) {
      const panel = layout.panels.find((p) => p.id === panelId);
      if (panel && panel.height !== height && !panel.collapsed) {
        setPanelHeight(panelId, height);
      }
    }

    setPendingHeights({});
  }, [pendingHeights, layout.panels, setPanelHeight]);

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
        margin={margin}
      >
        {visiblePanels.map((panel) => {
          const def = getDefinition(panel.id);
          if (!def) return null;

          const collapsed = getCollapseState(panel.id);
          const content = panelContent[panel.id];

          const isPanelResizable = def.resizable ?? true;

          const panelNode = (
            <PanelChrome
              title={def.title}
              icon={def.icon}
              collapsed={collapsed}
              onCollapse={() => togglePanelCollapsed(panel.id)}
              closeable={def.closeable}
              onClose={def.closeable ? () => togglePanelVisibility(panel.id) : undefined}
              fillHeight={isPanelResizable}
            >
              {content ?? (
                <div className="p-4 text-sm text-text-muted">
                  Panel content not provided
                </div>
              )}
            </PanelChrome>
          );

          return (
            <div key={panel.id} className={isPanelResizable ? 'h-full' : undefined}>
              {isPanelResizable ? (
                panelNode
              ) : (
                <AutoHeightPanel
                  panelId={panel.id}
                  rowHeight={rowHeight}
                  marginY={margin[1] ?? 0}
                  minHeight={def.minHeight}
                  onHeightChange={handleAutoHeight}
                >
                  {panelNode}
                </AutoHeightPanel>
              )}
            </div>
          );
        })}
      </DashboardGrid>
    </div>
  );
}
