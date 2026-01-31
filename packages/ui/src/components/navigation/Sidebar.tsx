import * as React from 'react';
import { cn } from '../../lib/utils';

export interface SidebarProps {
  children: React.ReactNode;
  collapsed?: boolean;
  onCollapseToggle?: () => void;
  className?: string;
}

/**
 * Sidebar - Main navigation sidebar container
 * 
 * Wireframe component - provides structure for:
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
        'codrag-sidebar',
        'flex flex-col border-r h-full',
        collapsed ? 'w-16' : 'w-64',
        'transition-[width] duration-200',
        className
      )}
    >
      <div className="flex items-center justify-between p-4 border-b">
        {!collapsed && (
          <span className="font-semibold text-lg">CoDRAG</span>
        )}
        {onCollapseToggle && (
          <button
            onClick={onCollapseToggle}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? '→' : '←'}
          </button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </aside>
  );
}
