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
    minHeight: 2,
    defaultHeight: 2,
    category: 'status',
    closeable: true,
  },
  {
    id: 'build',
    title: 'Build',
    icon: Hammer,
    minHeight: 2,
    defaultHeight: 2,
    category: 'status',
    closeable: true,
  },
  {
    id: 'search',
    title: 'Search',
    icon: Search,
    minHeight: 2,
    defaultHeight: 3,
    category: 'search',
    closeable: false, // Core functionality
  },
  {
    id: 'context-options',
    title: 'Context Options',
    icon: SlidersHorizontal,
    minHeight: 1,
    defaultHeight: 2,
    category: 'context',
    closeable: true,
  },
  {
    id: 'results',
    title: 'Search Results',
    icon: List,
    minHeight: 2,
    defaultHeight: 4,
    category: 'search',
    closeable: true,
  },
  {
    id: 'context-output',
    title: 'Context Output',
    icon: FileText,
    minHeight: 2,
    defaultHeight: 4,
    category: 'context',
    closeable: true,
  },
  {
    id: 'roots',
    title: 'Index Roots',
    icon: FolderTree,
    minHeight: 2,
    defaultHeight: 5,
    category: 'config',
    closeable: true,
  },
  {
    id: 'settings',
    title: 'Settings',
    icon: Settings2,
    minHeight: 2,
    defaultHeight: 4,
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
