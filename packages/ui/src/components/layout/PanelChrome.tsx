import { ChevronDown, ChevronUp, GripVertical, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

export interface PanelChromeProps {
  title: string;
  icon?: LucideIcon;
  collapsed?: boolean;
  onCollapse?: () => void;
  closeable?: boolean;
  onClose?: () => void;
  children: ReactNode;
  className?: string;
}

export function PanelChrome({
  title,
  icon: Icon,
  collapsed = false,
  onCollapse,
  closeable = true,
  onClose,
  children,
  className,
}: PanelChromeProps) {
  return (
    <div
      className={cn(
        'codrag-panel bg-surface border border-border rounded-lg shadow-sm overflow-hidden flex flex-col h-full',
        className
      )}
    >
      {/* Panel Header */}
      <div className="codrag-panel-header flex items-center gap-2 px-3 py-2 border-b border-border bg-surface-raised min-h-[44px]">
        {/* Drag Handle */}
        <div className="drag-handle cursor-grab active:cursor-grabbing p-1 -ml-1 rounded hover:bg-muted transition-colors">
          <GripVertical className="w-4 h-4 text-text-muted" />
        </div>

        {/* Icon & Title */}
        {Icon && <Icon className="w-4 h-4 text-text-muted flex-shrink-0" />}
        <span className="font-medium text-sm text-text flex-1 truncate">{title}</span>

        {/* Controls */}
        <div className="flex items-center gap-1">
          {onCollapse && (
            <button
              onClick={onCollapse}
              className="p-1 rounded hover:bg-muted transition-colors text-text-muted hover:text-text"
              aria-label={collapsed ? 'Expand panel' : 'Collapse panel'}
            >
              {collapsed ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronUp className="w-4 h-4" />
              )}
            </button>
          )}
          {closeable && onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-muted transition-colors text-text-muted hover:text-error"
              aria-label="Close panel"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Panel Content */}
      {!collapsed && (
        <div className="codrag-panel-content flex-1 overflow-auto">
          {children}
        </div>
      )}
    </div>
  );
}
