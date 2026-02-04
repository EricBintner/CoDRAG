import { cn } from '../../lib/utils';
import { X } from 'lucide-react';
import { Button } from '../primitives/Button';

export interface ProjectTab {
  id: string;
  name: string;
  path: string;
}

export interface ProjectTabsProps {
  tabs: ProjectTab[];
  activeTabId?: string;
  onTabSelect: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
  className?: string;
}

/**
 * ProjectTabs - Open project tabs for quick switching
 * 
 * Displays:
 * - Open project tabs with close buttons
 * - Active tab highlighting
 * - Tab overflow handling (scroll)
 */
export function ProjectTabs({
  tabs,
  activeTabId,
  onTabSelect,
  onTabClose,
  className,
}: ProjectTabsProps) {
  if (tabs.length === 0) {
    return null;
  }

  return (
    <div className={cn('flex border-b border-border overflow-x-auto bg-surface-raised/50 hide-scrollbar', className)}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId;
        return (
          <div
            key={tab.id}
            onClick={() => onTabSelect(tab.id)}
            className={cn(
              'group relative flex items-center min-w-[120px] max-w-[200px] h-10 px-4 border-r border-border cursor-pointer select-none transition-colors',
              isActive 
                ? 'bg-surface text-primary font-medium border-t-2 border-t-primary -mt-px pt-px' 
                : 'bg-transparent text-text-muted hover:bg-surface hover:text-text border-t-2 border-t-transparent'
            )}
          >
            <span className="truncate text-sm pr-6 w-full">
              {tab.name}
            </span>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={(e) => {
                e.stopPropagation();
                onTabClose(tab.id);
              }}
              className={cn(
                'absolute right-1 top-1/2 -translate-y-1/2 w-6 h-6',
                'text-text-subtle hover:text-text',
                'opacity-0 group-hover:opacity-100 transition-opacity',
                isActive && 'opacity-100' // Always show close on active tab
              )}
              aria-label={`Close ${tab.name}`}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        );
      })}
    </div>
  );
}
