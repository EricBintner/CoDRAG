import { useCallback, useEffect, useState } from 'react';
import type { DashboardLayout } from '../../types/layout';
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
  // Future: Add migration logic when version changes
  // For now, just ensure all default panels exist
  const existingIds = new Set(layout.panels.map((p) => p.id));
  const missingPanels = DEFAULT_LAYOUT.panels.filter(
    (p) => !existingIds.has(p.id)
  );

  if (missingPanels.length > 0) {
    return {
      ...layout,
      panels: [...layout.panels, ...missingPanels.map((p) => ({ ...p, visible: false }))],
    };
  }

  return layout;
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
