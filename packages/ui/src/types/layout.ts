import type { LucideIcon } from 'lucide-react';

/**
 * Panel configuration for user-saved layout
 */
export interface PanelConfig {
  id: string;
  visible: boolean;
  height: number;      // Grid row units
  collapsed: boolean;
  x?: number;
  y?: number;
  w?: number;
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
  resizable?: boolean;
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
  x: number;
  y: number;      // Row position
  w: number;
  h: number;      // Height in grid units
  minH?: number;  // Minimum height
  static?: boolean;
  isResizable?: boolean;
}

/**
 * Default layout configuration
 */
export const DEFAULT_LAYOUT: DashboardLayout = {
  version: 5,
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
  const visiblePanels = layout.panels.filter((p) => p.visible);
  const defaultById = new Map(DEFAULT_LAYOUT.panels.map((p) => [p.id, p] as const));

  // Group by (x,w) so each column stacks independently.
  const groups = new Map<string, PanelConfig[]>();
  for (const p of visiblePanels) {
    const def = defaultById.get(p.id);
    const x = typeof p.x === 'number' ? p.x : (def?.x ?? 0);
    const w = typeof p.w === 'number' ? p.w : (def?.w ?? 12);
    const key = `${x}:${w}`;
    const list = groups.get(key);
    if (list) list.push(p);
    else groups.set(key, [p]);
  }

  const orderKeyFor = (id: string): number => {
    const def = defaultById.get(id);
    if (!def) return Number.POSITIVE_INFINITY;
    return typeof def.y === 'number' ? def.y : DEFAULT_LAYOUT.panels.findIndex((p) => p.id === id);
  };

  const result: GridLayoutItem[] = [];

  for (const group of groups.values()) {
    const sorted = [...group].sort((a, b) => orderKeyFor(a.id) - orderKeyFor(b.id));
    let nextY = 0;

    for (const panel of sorted) {
      const defaultPanel = defaultById.get(panel.id);
      const def = definitions?.find((d) => d.id === panel.id);
      const x = typeof panel.x === 'number' ? panel.x : (defaultPanel?.x ?? 0);
      const w = typeof panel.w === 'number' ? panel.w : (defaultPanel?.w ?? 12);
      const y = typeof panel.y === 'number' ? panel.y : nextY;
      const h = panel.collapsed ? 1 : Math.max(1, panel.height);
      const minH = def?.minHeight ?? 1;
      const isResizable = def?.resizable ?? true;

      result.push({
        i: panel.id,
        x,
        y,
        w,
        h,
        minH,
        isResizable,
      });

      nextY = Math.max(nextY, y + h);
    }
  }

  return result;
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
