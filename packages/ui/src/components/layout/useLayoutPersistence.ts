import { useCallback, useEffect, useState } from 'react';
import type { DashboardLayout, PanelConfig } from '../../types/layout';
import { DEFAULT_LAYOUT, LAYOUT_STORAGE_KEY } from '../../types/layout';

interface UseLayoutPersistenceOptions {
  storageKey?: string;
  debounceMs?: number;
}

interface UseLayoutPersistenceReturn {
  layout: DashboardLayout;
  updateLayout: (layout: DashboardLayout) => void;
  togglePanelVisibility: (panelId: string) => void;
  togglePanelCollapsed: (panelId: string) => void;
  resetLayout: () => void;
  setPanelHeight: (panelId: string, height: number) => void;
}

function loadLayout(key: string): DashboardLayout | null {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return null;
    const parsed = JSON.parse(stored) as DashboardLayout;
    // Basic validation
    if (typeof parsed.version !== 'number' || !Array.isArray(parsed.panels)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function saveLayout(key: string, layout: DashboardLayout): void {
  try {
    localStorage.setItem(key, JSON.stringify(layout));
  } catch {
    // Storage full or unavailable
  }
}

function migrateLayout(layout: DashboardLayout): DashboardLayout {
  // Reset to defaults if version changed (layout heights were adjusted)
  const versionChanged = layout.version !== DEFAULT_LAYOUT.version;
  
  const defaultById = new Map(DEFAULT_LAYOUT.panels.map((p) => [p.id, p] as const));
  const layoutById = new Map(layout.panels.map((p) => [p.id, p] as const));

  const panels: PanelConfig[] = DEFAULT_LAYOUT.panels.map((def) => {
    const existing = layoutById.get(def.id);
    // If version changed, use default heights and positions
    if (versionChanged) {
      return {
        id: def.id,
        visible: typeof existing?.visible === 'boolean' ? existing.visible : def.visible,
        height: def.height,
        collapsed: typeof existing?.collapsed === 'boolean' ? existing.collapsed : def.collapsed,
        x: def.x,
        y: def.y,
        w: def.w,
      };
    }
    return {
      id: def.id,
      visible:
        typeof existing?.visible === 'boolean'
          ? existing.visible
          : def.visible,
      height:
        typeof existing?.height === 'number'
          ? Math.max(1, existing.height)
          : Math.max(1, def.height),
      collapsed:
        typeof existing?.collapsed === 'boolean'
          ? existing.collapsed
          : def.collapsed,
      x: typeof existing?.x === 'number' ? existing.x : def.x,
      y: typeof existing?.y === 'number' ? existing.y : undefined,
      w: typeof existing?.w === 'number' ? existing.w : def.w,
    };
  });

  // Preserve any panels not (yet) present in DEFAULT_LAYOUT
  for (const existing of layout.panels) {
    if (defaultById.has(existing.id)) continue;
    panels.push({
      id: existing.id,
      visible: typeof existing.visible === 'boolean' ? existing.visible : false,
      height: typeof existing.height === 'number' ? Math.max(1, existing.height) : 2,
      collapsed: typeof existing.collapsed === 'boolean' ? existing.collapsed : false,
      x: typeof existing.x === 'number' ? existing.x : 0,
      y: typeof existing.y === 'number' ? existing.y : undefined,
      w: typeof existing.w === 'number' ? existing.w : 12,
    });
  }

  // Backfill missing y positions per-column to avoid overlap.
  const orderKeyFor = (id: string): number => {
    const def = defaultById.get(id);
    if (!def) return Number.POSITIVE_INFINITY;
    if (typeof def.y === 'number') return def.y;
    return DEFAULT_LAYOUT.panels.findIndex((p) => p.id === id);
  };

  const groups = new Map<string, PanelConfig[]>();
  for (const p of panels) {
    const x = typeof p.x === 'number' ? p.x : 0;
    const w = typeof p.w === 'number' ? p.w : 12;
    const key = `${x}:${w}`;
    const list = groups.get(key);
    if (list) list.push(p);
    else groups.set(key, [p]);
  }

  for (const group of groups.values()) {
    let nextY = 0;

    for (const p of group) {
      if (typeof p.y !== 'number') continue;
      const h = p.collapsed ? 1 : Math.max(1, p.height);
      nextY = Math.max(nextY, p.y + h);
    }

    const missing = group
      .filter((p) => typeof p.y !== 'number')
      .sort((a, b) => orderKeyFor(a.id) - orderKeyFor(b.id));

    for (const p of missing) {
      p.y = nextY;
      const h = p.collapsed ? 1 : Math.max(1, p.height);
      nextY += h;
    }
  }

  return {
    version: DEFAULT_LAYOUT.version,
    panels,
  };
}

export function useLayoutPersistence(
  options: UseLayoutPersistenceOptions = {}
): UseLayoutPersistenceReturn {
  const { storageKey = LAYOUT_STORAGE_KEY, debounceMs = 500 } = options;

  const [layout, setLayoutState] = useState<DashboardLayout>(() => {
    const stored = loadLayout(storageKey);
    if (stored) {
      return migrateLayout(stored);
    }
    return DEFAULT_LAYOUT;
  });

  // Debounced save
  useEffect(() => {
    const timeout = setTimeout(() => {
      saveLayout(storageKey, layout);
    }, debounceMs);
    return () => clearTimeout(timeout);
  }, [layout, storageKey, debounceMs]);

  const updateLayout = useCallback((newLayout: DashboardLayout) => {
    setLayoutState(newLayout);
  }, []);

  const togglePanelVisibility = useCallback((panelId: string) => {
    setLayoutState((current) => ({
      ...current,
      panels: current.panels.map((p) =>
        p.id === panelId ? { ...p, visible: !p.visible } : p
      ),
    }));
  }, []);

  const togglePanelCollapsed = useCallback((panelId: string) => {
    setLayoutState((current) => ({
      ...current,
      panels: current.panels.map((p) =>
        p.id === panelId ? { ...p, collapsed: !p.collapsed } : p
      ),
    }));
  }, []);

  const resetLayout = useCallback(() => {
    setLayoutState(DEFAULT_LAYOUT);
  }, []);

  const setPanelHeight = useCallback((panelId: string, height: number) => {
    setLayoutState((current) => ({
      ...current,
      panels: current.panels.map((p) =>
        p.id === panelId ? { ...p, height: Math.max(1, height) } : p
      ),
    }));
  }, []);

  return {
    layout,
    updateLayout,
    togglePanelVisibility,
    togglePanelCollapsed,
    resetLayout,
    setPanelHeight,
  };
}
