import type { LucideIcon } from 'lucide-react';

/**
 * Panel configuration for user-saved layout
 */
export interface PanelConfig {
  id: string;
  visible: boolean;
  height: number;      // Grid row units
  collapsed: boolean;
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
  x: number;      // Always 0 (single column)
  y: number;      // Row position
  w: number;      // Always 12 (full width)
  h: number;      // Height in grid units
  minH?: number;  // Minimum height
  static?: boolean;
}

/**
 * Default layout configuration
 */
export const DEFAULT_LAYOUT: DashboardLayout = {
  version: 1,
  panels: [
    { id: 'status', visible: true, height: 2, collapsed: false },
    { id: 'build', visible: true, height: 2, collapsed: false },
    { id: 'search', visible: true, height: 3, collapsed: false },
    { id: 'context-options', visible: true, height: 2, collapsed: false },
    { id: 'results', visible: true, height: 4, collapsed: false },
    { id: 'context-output', visible: true, height: 4, collapsed: false },
    { id: 'roots', visible: true, height: 5, collapsed: false },
    { id: 'settings', visible: true, height: 4, collapsed: true },
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
  let y = 0;
  return layout.panels
    .filter(p => p.visible)
    .map(panel => {
      const item: GridLayoutItem = {
        i: panel.id,
        x: 0,
        y,
        w: 12,
        h: panel.collapsed ? 1 : panel.height,
        minH: 1,
      };
      y += item.h;
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
  const sorted = [...gridItems].sort((a, b) => a.y - b.y);
  
  // Build new panels array preserving hidden panels
  const visibleIds = new Set(sorted.map(item => item.i));
  const hiddenPanels = current.panels.filter(p => !visibleIds.has(p.id));
  
  const updatedPanels: PanelConfig[] = sorted.map(item => {
    const existing = current.panels.find(p => p.id === item.i);
    return {
      id: item.i,
      visible: true,
      height: item.h,
      collapsed: existing?.collapsed ?? false,
    };
  });
  
  // Append hidden panels at the end
  hiddenPanels.forEach(p => updatedPanels.push({ ...p, visible: false }));
  
  return {
    version: current.version,
    panels: updatedPanels,
  };
}
