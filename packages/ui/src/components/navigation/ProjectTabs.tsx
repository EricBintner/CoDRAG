import * as React from 'react';
import { Tab, TabGroup, TabList } from '@tremor/react';
import { cn } from '../../lib/utils';

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
 * Wireframe component - displays:
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
  const activeIndex = tabs.findIndex((t) => t.id === activeTabId);

  if (tabs.length === 0) {
    return null;
  }

  return (
    <div className={cn('codrag-project-tabs', 'border-b', className)}>
      <TabGroup
        index={activeIndex >= 0 ? activeIndex : 0}
        onIndexChange={(idx) => onTabSelect(tabs[idx]?.id ?? '')}
      >
        <TabList variant="line" className="overflow-x-auto">
          {tabs.map((tab) => (
            <Tab key={tab.id} className="group relative pr-8">
              <span className="truncate max-w-[150px]">{tab.name}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onTabClose(tab.id);
                }}
                className={cn(
                  'absolute right-1 top-1/2 -translate-y-1/2',
                  'w-5 h-5 rounded-full',
                  'flex items-center justify-center',
                  'opacity-0 group-hover:opacity-100',
                  'hover:bg-gray-200 dark:hover:bg-gray-700',
                  'transition-opacity'
                )}
                aria-label={`Close ${tab.name}`}
              >
                ×
              </button>
            </Tab>
          ))}
        </TabList>
      </TabGroup>
    </div>
  );
}
