import * as React from 'react';
import { cn } from '../../lib/utils';

export interface AppShellProps {
  sidebar: React.ReactNode;
  tabs?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

/**
 * AppShell - Main application layout container
 * 
 * Wireframe component - provides structure for:
 * - Sidebar (project list)
 * - Project tabs (top)
 * - Main content area
 * 
 * Layout: [Sidebar] | [Tabs / Content]
 */
export function AppShell({
  sidebar,
  tabs,
  children,
  className,
}: AppShellProps) {
  return (
    <div className={cn('codrag-app-shell', 'flex h-screen', className)}>
      {/* Sidebar */}
      {sidebar}
      
      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Project tabs */}
        {tabs}
        
        {/* Content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
