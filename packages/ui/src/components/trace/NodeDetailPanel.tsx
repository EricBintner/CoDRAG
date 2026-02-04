import { cn } from '../../lib/utils';
import type { TraceNode, TraceEdge } from '../../types';
import { CopyButton } from '../context/CopyButton';
import { Button } from '../primitives/Button';
import { FileCode, X, Share2, Zap, Eye, EyeOff, Box, ArrowRight, ArrowLeft } from 'lucide-react';

export interface NodeDetailPanelProps {
  node: TraceNode;
  inEdges?: TraceEdge[];
  outEdges?: TraceEdge[];
  onNavigateToNode?: (nodeId: string) => void;
  onClose?: () => void;
  className?: string;
}

const kindConfig: Record<string, { color: string; icon: any }> = {
  symbol: { color: 'text-primary bg-primary-muted/10 border-primary-muted/20', icon: Box },
  file: { color: 'text-success bg-success-muted/10 border-success-muted/20', icon: FileCode },
  external_module: { color: 'text-text-muted bg-surface-raised border-border', icon: Share2 },
};

export function NodeDetailPanel({
  node,
  inEdges = [],
  outEdges = [],
  onNavigateToNode,
  onClose,
  className,
}: NodeDetailPanelProps) {
  const config = kindConfig[node.kind] || kindConfig.symbol;
  const Icon = config.icon;

  return (
    <div className={cn(
      'flex flex-col h-full bg-surface border-l border-border shadow-xl w-80 overflow-y-auto', 
      className
    )}>
      {/* Header */}
      <div className="flex items-start justify-between p-4 border-b border-border sticky top-0 bg-surface z-10">
        <div className="flex-1 min-w-0 pr-2">
          <h3 className="font-mono font-semibold text-base text-text break-all flex items-center gap-2">
            <Icon className="w-4 h-4 shrink-0" />
            {node.name}
          </h3>
          <p className="text-xs text-text-muted mt-1 truncate" title={node.file_path}>
            {node.file_path}
          </p>
        </div>
        {onClose && (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            className="shrink-0"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      <div className="p-4 space-y-6">
        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border", config.color)}>
            {node.kind}
          </span>
          
          {node.metadata.symbol_type && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-success-muted/10 text-success border border-success-muted/20">
              {node.metadata.symbol_type as string}
            </span>
          )}
          
          {node.language && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-surface-raised text-text-muted border border-border">
              {node.language}
            </span>
          )}
          
          {node.metadata.is_async && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-info-muted/10 text-info border border-info-muted/20">
              <Zap className="w-3 h-3" />
              async
            </span>
          )}
          
          {node.metadata.is_public === false && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-warning-muted/10 text-warning border border-warning-muted/20">
              <EyeOff className="w-3 h-3" />
              private
            </span>
          )}
          
          {node.metadata.is_public === true && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-success-muted/10 text-success border border-success-muted/20">
              <Eye className="w-3 h-3" />
              public
            </span>
          )}
        </div>

        {/* Location */}
        {node.span && (
          <div>
            <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2">Location</p>
            <div className="bg-surface-raised border border-border rounded px-3 py-2 text-xs font-mono text-text">
              Lines {node.span.start_line}–{node.span.end_line}
            </div>
          </div>
        )}

        {/* Docstring */}
        {node.metadata.docstring && (
          <div>
            <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2">Docstring</p>
            <pre className="text-xs whitespace-pre-wrap bg-surface-raised border border-border p-3 rounded-md text-text-subtle font-mono max-h-48 overflow-y-auto">
              {node.metadata.docstring as string}
            </pre>
          </div>
        )}

        {/* Decorators */}
        {node.metadata.decorators && (node.metadata.decorators as string[]).length > 0 && (
          <div>
            <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2">Decorators</p>
            <div className="flex flex-wrap gap-1.5">
              {(node.metadata.decorators as string[]).map((dec, i) => (
                <span key={i} className="inline-flex px-2 py-1 rounded text-xs font-mono bg-surface-raised border border-border text-text-muted">
                  @{dec}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Inbound Edges */}
        {inEdges.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-text-muted uppercase tracking-wider">
                Imported By ({inEdges.length})
              </p>
              <ArrowLeft className="w-3 h-3 text-text-muted" />
            </div>
            <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
              {inEdges.map((edge) => (
                <button
                  key={edge.id}
                  onClick={() => onNavigateToNode?.(edge.source)}
                  className="w-full text-left p-2 rounded hover:bg-surface-raised border border-transparent hover:border-border transition-all group"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs text-primary truncate group-hover:underline">
                      {edge.source}
                    </span>
                    <span className="text-[10px] text-text-muted bg-surface px-1.5 py-0.5 rounded border border-border shrink-0">
                      {edge.kind}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Outbound Edges */}
        {outEdges.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-text-muted uppercase tracking-wider">
                Imports ({outEdges.length})
              </p>
              <ArrowRight className="w-3 h-3 text-text-muted" />
            </div>
            <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
              {outEdges.map((edge) => (
                <button
                  key={edge.id}
                  onClick={() => onNavigateToNode?.(edge.target)}
                  className="w-full text-left p-2 rounded hover:bg-surface-raised border border-transparent hover:border-border transition-all group"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs text-primary truncate group-hover:underline">
                      {edge.target}
                    </span>
                    <span className="text-[10px] text-text-muted bg-surface px-1.5 py-0.5 rounded border border-border shrink-0">
                      {edge.kind}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="pt-4 border-t border-border">
          <CopyButton
            text={node.id}
            label="Copy Node ID"
            className="w-full justify-center"
          />
        </div>
      </div>
    </div>
  );
}
