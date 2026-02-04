import { useState } from 'react';
import { cn } from '../../lib/utils';
import type { ProjectMode } from '../../types';
import { FolderPlus, X, Folder, Layout } from 'lucide-react';
import { Button } from '../primitives/Button';

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
    <div className={cn('fixed inset-0 z-50 flex items-center justify-center', className)}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative z-10 w-full max-w-md rounded-lg border border-border bg-surface shadow-xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-text flex items-center gap-2">
            <FolderPlus className="w-5 h-5 text-primary" />
            Add Project
          </h2>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        <div className="p-6 space-y-5">
          {/* Path input */}
          <div>
            <label className="block text-sm font-medium text-text-muted mb-1.5">Project Path</label>
            <input
              type="text"
              placeholder="/path/to/your/project"
              value={path}
              onChange={(e) => setPath(e.target.value)}
              className="w-full bg-surface-raised border border-border rounded-md px-3 py-2 text-sm text-text placeholder:text-text-subtle focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
            <p className="mt-1.5 text-xs text-text-subtle">
              Absolute path to the project root directory
            </p>
          </div>
          
          {/* Name input */}
          <div>
            <label className="block text-sm font-medium text-text-muted mb-1.5">Display Name (optional)</label>
            <input
              type="text"
              placeholder="my-project"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-surface-raised border border-border rounded-md px-3 py-2 text-sm text-text placeholder:text-text-subtle focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>
          
          {/* Mode selector */}
          <div>
            <label className="block text-sm font-medium text-text-muted mb-2">Index Mode</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMode('standalone')}
                className={cn(
                  'flex flex-col items-center gap-2 p-3 rounded-lg border text-sm transition-all',
                  mode === 'standalone'
                    ? 'border-primary bg-primary-muted/10 text-primary'
                    : 'border-border bg-surface hover:bg-surface-raised text-text-muted hover:text-text'
                )}
              >
                <Folder className="w-5 h-5" />
                <span className="font-medium">Standalone</span>
                <span className="text-[10px] opacity-80 text-center leading-tight">Index in app data directory</span>
              </button>
              <button
                type="button"
                onClick={() => setMode('embedded')}
                className={cn(
                  'flex flex-col items-center gap-2 p-3 rounded-lg border text-sm transition-all',
                  mode === 'embedded'
                    ? 'border-primary bg-primary-muted/10 text-primary'
                    : 'border-border bg-surface hover:bg-surface-raised text-text-muted hover:text-text'
                )}
              >
                <Layout className="w-5 h-5" />
                <span className="font-medium">Embedded</span>
                <span className="text-[10px] opacity-80 text-center leading-tight">Index in .codrag/ folder</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex justify-end gap-3 p-4 border-t border-border bg-surface-raised/30">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!path.trim()}
          >
            Add Project
          </Button>
        </div>
      </div>
    </div>
  );
}
