import { useCallback, useEffect, useRef, useState } from 'react';
import GridLayout from 'react-grid-layout';
import type { Layout } from 'react-grid-layout';
import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';
import type { DashboardLayout, GridLayoutItem } from '../../types/layout';
import { toGridLayout, fromGridLayout } from '../../types/layout';

import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

export interface DashboardGridProps {
  layout: DashboardLayout;
  onLayoutChange: (layout: DashboardLayout) => void;
  children: ReactNode;
  className?: string;
  rowHeight?: number;
  margin?: [number, number];
  resizable?: boolean;
}

export function DashboardGrid({
  layout,
  onLayoutChange,
  children,
  className,
  rowHeight = 20,
  margin = [24, 24],
  resizable = true,
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
  const gridLayout = toGridLayout(layout);

  const handleLayoutChange = useCallback(
    (newLayout: Layout[]) => {
      const items: GridLayoutItem[] = newLayout.map((item) => ({
        i: item.i,
        x: item.x,
        y: item.y,
        w: item.w,
        h: item.h,
        minH: item.minH,
      }));
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
        onLayoutChange={handleLayoutChange}
        draggableHandle=".drag-handle"
        isResizable={resizable}
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
