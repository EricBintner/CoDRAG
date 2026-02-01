import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { PanelLeftClose, PanelLeftOpen, Box } from 'lucide-react';

export interface SidebarProps {
  children: ReactNode;
  collapsed?: boolean;
  onCollapseToggle?: () => void;
  className?: string;
}

/**
 * Sidebar - Main navigation sidebar container
 * 
 * Provides structure for:
 * - Project list
 * - Add project action
 * - Collapse/expand toggle
 */
export function Sidebar({
  children,
  collapsed = false,
  onCollapseToggle,
  className,
}: SidebarProps) {
  return (
    <aside
      className={cn(
        'flex flex-col border-r border-border h-full bg-surface transition-[width] duration-300 ease-in-out',
        collapsed ? 'w-16' : 'w-64',
        className
      )}
    >
      <div className={cn(
        "flex items-center p-4 border-b border-border h-16",
        collapsed ? "justify-center" : "justify-between"
      )}>
        {!collapsed && (
          <span className="font-semibold text-lg flex items-center gap-2 text-text">
            <Box className="w-5 h-5 text-primary" />
            CoDRAG
          </span>
        )}
        {onCollapseToggle && (
          <button
            onClick={onCollapseToggle}
            className="p-1.5 rounded-md hover:bg-surface-raised text-text-muted hover:text-text transition-colors"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
          </button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto py-2">
        {children}
      </div>
    </aside>
  );
}
