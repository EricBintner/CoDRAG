import type { LucideIcon } from 'lucide-react';
import { getPanelDefinition } from '../config/panelRegistry';

/**
 * Panel configuration for user-saved layout
 */
export interface PanelConfig {
  id: string;
  visible: boolean;
  height: number;      // Grid row units
  collapsed: boolean;
  x?: number;          // Grid column position (0-11)
  y?: number;          // Grid row position
  w?: number;          // Grid column span (1-12)
}

/**
 * Full dashboard layout schema
 */
export interface DashboardLayout {
  version: number;
  panels: PanelConfig[];
}

/**
 * Panel category for grouping in picker
 */
export type PanelCategory = 'status' | 'search' | 'context' | 'config';

/**
 * Panel definition for registry
 */
export interface PanelDefinition {
  id: string;
  title: string;
  icon: LucideIcon;
  minHeight: number;
  defaultHeight: number;
  category: PanelCategory;
  closeable?: boolean;  // Can be hidden (default true)
}

/**
 * Props passed to panel content components
 */
export interface PanelProps {
  panelId: string;
  collapsed: boolean;
}

/**
 * Grid layout item (react-grid-layout format)
 */
export interface GridLayoutItem {
  i: string;      // Panel ID
  x: number;      // Column position
  y: number;      // Row position
  w: number;      // Column span
  h: number;      // Height in grid units
  minH?: number;  // Minimum height
  static?: boolean;
}

/**
 * Default layout configuration
 */
export const DEFAULT_LAYOUT: DashboardLayout = {
  version: 4,
  panels: [
    { id: 'status', visible: true, height: 8, collapsed: false, x: 0, y: 0, w: 8 },
    { id: 'build', visible: true, height: 10, collapsed: false, x: 0, y: 8, w: 8 },
    { id: 'search', visible: true, height: 12, collapsed: false, x: 0, y: 18, w: 8 },
    { id: 'results', visible: true, height: 10, collapsed: false, x: 0, y: 30, w: 8 },
    { id: 'roots', visible: true, height: 14, collapsed: false, x: 8, y: 0, w: 4 },
    { id: 'context-options', visible: true, height: 16, collapsed: false, x: 8, y: 14, w: 4 },
    { id: 'context-output', visible: true, height: 10, collapsed: false, x: 8, y: 30, w: 4 },
    { id: 'settings', visible: true, height: 8, collapsed: true, x: 8, y: 40, w: 4 },
  ],
};

/**
 * Storage key for localStorage
 */
export const LAYOUT_STORAGE_KEY = 'codrag_dashboard_layout';

/**
 * Convert DashboardLayout to react-grid-layout format
 */
export function toGridLayout(layout: DashboardLayout): GridLayoutItem[] {
  let fallbackY = 0;
  return layout.panels
    .filter(p => p.visible)
    .map(panel => {
      const defaultPanel = DEFAULT_LAYOUT.panels.find((p) => p.id === panel.id);
      const x = typeof panel.x === 'number' ? panel.x : (defaultPanel?.x ?? 0);
      const w = typeof panel.w === 'number' ? panel.w : (defaultPanel?.w ?? 12);

      const resolvedY =
        typeof panel.y === 'number'
          ? panel.y
          : typeof defaultPanel?.y === 'number'
            ? defaultPanel.y
            : fallbackY;

      const panelDef = getPanelDefinition(panel.id);
      const minH = panelDef?.minHeight ?? 1;

      const item: GridLayoutItem = {
        i: panel.id,
        x,
        y: resolvedY,
        w,
        h: panel.collapsed ? 1 : panel.height,
        minH: panel.collapsed ? 1 : minH,
      };

      fallbackY = Math.max(fallbackY, item.y + item.h);
      return item;
    });
}

/**
 * Update DashboardLayout from react-grid-layout changes
 */
export function fromGridLayout(
  current: DashboardLayout,
  gridItems: GridLayoutItem[]
): DashboardLayout {
  // Sort by y position to get order
  const sorted = [...gridItems].sort((a, b) => (a.y - b.y) || (a.x - b.x));
  
  // Build new panels array preserving hidden panels
  const visibleIds = new Set(sorted.map(item => item.i));
  const hiddenPanels = current.panels.filter(p => !visibleIds.has(p.id));
  
  const updatedPanels: PanelConfig[] = sorted.map(item => {
    const existing = current.panels.find(p => p.id === item.i);
    const defaultPanel = DEFAULT_LAYOUT.panels.find((p) => p.id === item.i);
    const collapsed = existing?.collapsed ?? false;
    const nextHeight = collapsed
      ? (existing?.height ?? defaultPanel?.height ?? item.h)
      : item.h;

    return {
      id: item.i,
      visible: true,
      height: nextHeight,
      collapsed,
      x: item.x,
      y: item.y,
      w: item.w,
    };
  });
  
  // Append hidden panels at the end
  hiddenPanels.forEach(p => updatedPanels.push({ ...p, visible: false }));
  
  return {
    version: current.version,
    panels: updatedPanels,
  };
}
