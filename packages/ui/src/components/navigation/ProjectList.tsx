import { Button } from '@tremor/react';
import type { ProjectSummary } from '../../types';
import { StatusBadge } from '../status/StatusBadge';
import { cn } from '../../lib/utils';

export interface ProjectListProps {
  projects: ProjectSummary[];
  selectedProjectId?: string;
  onProjectSelect: (projectId: string) => void;
  onAddProject: () => void;
  className?: string;
}

export interface ProjectListItemProps {
  project: ProjectSummary;
  selected: boolean;
  onClick: () => void;
}

/**
 * ProjectListItem - Single project row in the sidebar
 */
function ProjectListItem({ project, selected, onClick }: ProjectListItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'codrag-project-list-item',
        'w-full text-left px-4 py-3 border-b',
        'hover:bg-gray-50 dark:hover:bg-gray-800',
        'transition-colors',
        selected && 'bg-gray-100 dark:bg-gray-800'
      )}
    >
      <div className="flex items-center justify-between">
        <span className="font-medium truncate">{project.name}</span>
        <StatusBadge status={project.status} showLabel={false} />
      </div>
      <span className="text-sm text-gray-500 truncate block mt-1">
        {project.path}
      </span>
    </button>
  );
}

/**
 * ProjectList - List of registered projects in sidebar
 * 
 * Wireframe component - displays:
 * - List of projects with status indicators
 * - Selected state highlighting
 * - Add project button
 */
export function ProjectList({
  projects,
  selectedProjectId,
  onProjectSelect,
  onAddProject,
  className,
}: ProjectListProps) {
  return (
    <div className={cn('codrag-project-list', 'flex flex-col h-full', className)}>
      <div className="flex-1 overflow-y-auto">
        {projects.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No projects yet
          </div>
        ) : (
          projects.map((project) => (
            <ProjectListItem
              key={project.id}
              project={project}
              selected={project.id === selectedProjectId}
              onClick={() => onProjectSelect(project.id)}
            />
          ))
        )}
      </div>
      <div className="p-4 border-t">
        <Button
          onClick={onAddProject}
          variant="secondary"
          className="w-full"
        >
          + Add Project
        </Button>
      </div>
    </div>
  );
}
