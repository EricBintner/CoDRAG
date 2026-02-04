import { useCallback, useEffect, useRef, useState } from 'react';
import GridLayout from 'react-grid-layout';
import type { Layout } from 'react-grid-layout';
import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';
import type { DashboardLayout, GridLayoutItem, PanelDefinition } from '../../types/layout';
import { toGridLayout, fromGridLayout } from '../../types/layout';

import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

export interface DashboardGridProps {
  layout: DashboardLayout;
  panelDefinitions?: PanelDefinition[];
  onLayoutChange: (layout: DashboardLayout) => void;
  children: ReactNode;
  className?: string;
  rowHeight?: number;
  margin?: [number, number];
}

export function DashboardGrid({
  layout,
  panelDefinitions,
  onLayoutChange,
  children,
  className,
  rowHeight = 60,
  margin = [0, 16],
}: DashboardGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(1200);

  // Measure container width
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setWidth(entry.contentRect.width);
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Convert our layout format to react-grid-layout format
  const gridLayout = toGridLayout(layout, panelDefinitions);

  const handleLayoutCommit = useCallback(
    (newLayout: Layout[]) => {
      const items: GridLayoutItem[] = newLayout.map((item) => {
        const isResizableItem = (item as any).isResizable;
        const existing = layout.panels.find((p) => p.id === item.i);

        return {
          i: item.i,
          x: item.x,
          y: item.y,
          w: item.w,
          h: isResizableItem === false && existing && !existing.collapsed ? existing.height : item.h,
          minH: item.minH,
          isResizable: isResizableItem,
        };
      });
      const updated = fromGridLayout(layout, items);
      onLayoutChange(updated);
    },
    [layout, onLayoutChange]
  );

  return (
    <div ref={containerRef} className={cn('codrag-dashboard-grid w-full', className)}>
      <GridLayout
        className="layout"
        layout={gridLayout}
        cols={12}
        rowHeight={rowHeight}
        width={width}
        margin={margin}
        onLayoutChange={handleLayoutCommit}
        onDragStop={handleLayoutCommit}
        onResizeStop={handleLayoutCommit}
        draggableHandle=".drag-handle"
        isResizable={true}
        resizeHandles={['s']}
        compactType="vertical"
        preventCollision={false}
        useCSSTransforms={true}
      >
        {children}
      </GridLayout>
    </div>
  );
}
