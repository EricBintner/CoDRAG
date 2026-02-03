import { 
  Database, 
  Hammer, 
  Search, 
  Settings2, 
  FolderTree, 
  FileText, 
  SlidersHorizontal,
  List
} from 'lucide-react';
import type { PanelDefinition } from '../types/layout';

/**
 * Registry of all available dashboard panels
 * Used by PanelPicker and for rendering the modular layout
 */
export const PANEL_REGISTRY: PanelDefinition[] = [
  {
    id: 'status',
    title: 'Index Status',
    icon: Database,
    minHeight: 4,
    defaultHeight: 6,
    category: 'status',
    closeable: true,
  },
  {
    id: 'build',
    title: 'Build',
    icon: Hammer,
    minHeight: 5,
    defaultHeight: 7,
    category: 'status',
    closeable: true,
  },
  {
    id: 'search',
    title: 'Search',
    icon: Search,
    minHeight: 6,
    defaultHeight: 9,
    category: 'search',
    closeable: false, // Core functionality
  },
  {
    id: 'context-options',
    title: 'Context Options',
    icon: SlidersHorizontal,
    minHeight: 8,
    defaultHeight: 12,
    category: 'context',
    closeable: true,
    resizable: false,
  },
  {
    id: 'results',
    title: 'Search Results',
    icon: List,
    minHeight: 5,
    defaultHeight: 8,
    category: 'search',
    closeable: true,
  },
  {
    id: 'context-output',
    title: 'Context Output',
    icon: FileText,
    minHeight: 5,
    defaultHeight: 8,
    category: 'context',
    closeable: true,
  },
  {
    id: 'roots',
    title: 'Index Roots',
    icon: FolderTree,
    minHeight: 6,
    defaultHeight: 10,
    category: 'config',
    closeable: true,
  },
  {
    id: 'settings',
    title: 'Settings',
    icon: Settings2,
    minHeight: 2,
    defaultHeight: 2,
    category: 'config',
    closeable: true,
  },
];

/**
 * Get panel definition by ID
 */
export function getPanelDefinition(id: string): PanelDefinition | undefined {
  return PANEL_REGISTRY.find((p) => p.id === id);
}

/**
 * Get panels grouped by category
 */
export function getPanelsByCategory(): Record<string, PanelDefinition[]> {
  const grouped: Record<string, PanelDefinition[]> = {};
  for (const panel of PANEL_REGISTRY) {
    if (!grouped[panel.category]) {
      grouped[panel.category] = [];
    }
    grouped[panel.category].push(panel);
  }
  return grouped;
}
