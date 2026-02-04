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
export type PanelCategory = 'status' | 'search' | 'context' | 'config' | 'projects';

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
    { id: 'status', visible: true, height: 6, collapsed: false, x: 0, y: 0, w: 8 },
    { id: 'build', visible: true, height: 7, collapsed: false, x: 0, y: 6, w: 8 },
    { id: 'search', visible: true, height: 9, collapsed: false, x: 0, y: 13, w: 8 },
    { id: 'results', visible: true, height: 8, collapsed: false, x: 0, y: 22, w: 8 },
    { id: 'roots', visible: true, height: 10, collapsed: false, x: 8, y: 0, w: 4 },
    { id: 'context-options', visible: true, height: 12, collapsed: false, x: 8, y: 10, w: 4 },
    { id: 'context-output', visible: true, height: 8, collapsed: false, x: 8, y: 22, w: 4 },
    { id: 'llm-status', visible: true, height: 4, collapsed: false, x: 0, y: 30, w: 4 },
    { id: 'settings', visible: true, height: 2, collapsed: true, x: 4, y: 30, w: 4 },
    { id: 'file-tree', visible: false, height: 10, collapsed: false, x: 8, y: 32, w: 4 },
    { id: 'pinned-files', visible: false, height: 10, collapsed: false, x: 0, y: 34, w: 8 },
  ],
};

/**
 * Storage key for localStorage
 */
export const LAYOUT_STORAGE_KEY = 'codrag_dashboard_layout';

/**
 * Convert DashboardLayout to react-grid-layout format
 */
export function toGridLayout(layout: DashboardLayout, definitions?: PanelDefinition[]): GridLayoutItem[] {
  // Group panels by column (x position) to maintain order within columns
  const panelsByColumn = new Map<number, typeof layout.panels>();
  
  for (const panel of layout.panels.filter(p => p.visible)) {
    const defaultPanel = DEFAULT_LAYOUT.panels.find((p) => p.id === panel.id);
    const x = typeof panel.x === 'number' ? panel.x : (defaultPanel?.x ?? 0);
    const list = panelsByColumn.get(x) ?? [];
    list.push(panel);
    panelsByColumn.set(x, list);
  }

  // Sort each column by the default order (y position in DEFAULT_LAYOUT)
  const getDefaultY = (id: string): number => {
    const def = DEFAULT_LAYOUT.panels.find(p => p.id === id);
    return def?.y ?? 999;
  };

  const result: GridLayoutItem[] = [];
  
  for (const [x, panels] of panelsByColumn) {
    // Sort by default y position to maintain intended order
    const sorted = [...panels].sort((a, b) => getDefaultY(a.id) - getDefaultY(b.id));
    
    // Stack items in this column - let compactType handle actual positioning
    let columnY = 0;
    for (const panel of sorted) {
      const defaultPanel = DEFAULT_LAYOUT.panels.find((p) => p.id === panel.id);
      const w = typeof panel.w === 'number' ? panel.w : (defaultPanel?.w ?? 12);
      
      // Look up definition from passed array or registry
      const panelDef = definitions?.find(d => d.id === panel.id) ?? getPanelDefinition(panel.id);
      
      const minH = panelDef?.minHeight ?? 1;
      const isResizable = panelDef?.resizable ?? true;

      result.push({
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
