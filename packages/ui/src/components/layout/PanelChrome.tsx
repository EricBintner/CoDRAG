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
  fillHeight?: boolean;
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
  fillHeight = true,
}: PanelChromeProps) {
  return (
    <div
      className={cn(
        'codrag-panel group relative w-full',
        fillHeight && 'h-full',
        className
      )}
    >
      {/* Panel Header */}
      <div className="codrag-panel-header pointer-events-none absolute right-0 top-2 z-10 flex translate-x-1/2 items-center gap-1">
        {/* Drag Handle */}
        <button
          type="button"
          className={cn(
            'drag-handle pointer-events-auto cursor-grab active:cursor-grabbing rounded-md p-0.5 transition-opacity hover:bg-muted/60',
            collapsed ? 'opacity-60 hover:opacity-100' : 'opacity-30 hover:opacity-100'
          )}
          aria-label={`Drag ${title}`}
        >
          <GripVertical className="w-3.5 h-3.5 text-text-muted" />
        </button>

        {/* Controls */}
        <div className="flex items-center gap-1 opacity-0 pointer-events-none transition-opacity group-hover:opacity-100 group-hover:pointer-events-auto">
          {onCollapse && (
            <button
              type="button"
              onClick={onCollapse}
              className={cn(
                'p-0.5 rounded-md transition-colors text-text-muted hover:text-text',
                'hover:bg-muted'
              )}
              aria-label={collapsed ? 'Expand panel' : 'Collapse panel'}
            >
              {collapsed ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronUp className="w-3.5 h-3.5" />
              )}
            </button>
          )}
          {closeable && onClose && (
            <button
              type="button"
              onClick={onClose}
              className={cn(
                'p-0.5 rounded-md transition-colors text-text-muted hover:text-error',
                'hover:bg-muted'
              )}
              aria-label="Close panel"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Panel Content */}
      {collapsed ? (
        <div className={cn('codrag-panel-content', fillHeight && 'h-full')}>
          <div className={cn('rounded-lg border border-border bg-surface-raised px-3 flex items-center gap-2', fillHeight && 'h-full')}>
            {Icon && <Icon className="w-4 h-4 text-text-muted flex-shrink-0" />}
            <span className="font-medium text-sm text-text truncate">{title}</span>
          </div>
        </div>
      ) : (
        <div className={cn('codrag-panel-content overflow-hidden', fillHeight && 'h-full')}>
          {children}
        </div>
      )}
    </div>
  );
}
