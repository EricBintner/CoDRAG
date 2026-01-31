import { useState } from 'react';
import { Button, TextInput } from '@tremor/react';
import { cn } from '../../lib/utils';
import type { ProjectMode } from '../../types';

export interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (path: string, name: string, mode: ProjectMode) => void;
  className?: string;
}

export function AddProjectModal({
  isOpen,
  onClose,
  onAdd,
  className,
}: AddProjectModalProps) {
  const [path, setPath] = useState('');
  const [name, setName] = useState('');
  const [mode, setMode] = useState<ProjectMode>('standalone');

  const handleSubmit = () => {
    if (path.trim()) {
      onAdd(path.trim(), name.trim() || path.split('/').pop() || 'project', mode);
      setPath('');
      setName('');
      setMode('standalone');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={cn('codrag-add-project-modal fixed inset-0 z-50 flex items-center justify-center', className)}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative z-10 w-full max-w-md rounded-lg border bg-white p-6 shadow-xl dark:bg-gray-900">
        <h2 className="text-lg font-semibold mb-4">Add Project</h2>
        
        {/* Path input */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Project Path</label>
          <TextInput
            placeholder="/path/to/your/project"
            value={path}
            onChange={(e) => setPath(e.target.value)}
          />
          <p className="mt-1 text-xs text-gray-500">
            Absolute path to the project root directory
          </p>
        </div>
        
        {/* Name input */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Display Name (optional)</label>
          <TextInput
            placeholder="my-project"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        
        {/* Mode selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Index Mode</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMode('standalone')}
              className={cn(
                'flex-1 rounded border px-3 py-2 text-sm transition-colors',
                mode === 'standalone'
                  ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20'
                  : 'border-gray-200 hover:bg-gray-50 dark:border-gray-700'
              )}
            >
              <div className="font-medium">Standalone</div>
              <div className="text-xs text-gray-500 mt-1">Index in app data directory</div>
            </button>
            <button
              type="button"
              onClick={() => setMode('embedded')}
              className={cn(
                'flex-1 rounded border px-3 py-2 text-sm transition-colors',
                mode === 'embedded'
                  ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20'
                  : 'border-gray-200 hover:bg-gray-50 dark:border-gray-700'
              )}
            >
              <div className="font-medium">Embedded</div>
              <div className="text-xs text-gray-500 mt-1">Index in .codrag/ folder</div>
            </button>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!path.trim()}>
            Add Project
          </Button>
        </div>
      </div>
    </div>
  );
}
