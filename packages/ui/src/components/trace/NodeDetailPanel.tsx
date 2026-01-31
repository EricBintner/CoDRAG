import { Card, Badge, Button } from '@tremor/react';
import { cn } from '../../lib/utils';
import type { TraceNode, TraceEdge } from '../../types';
import { CopyButton } from '../context/CopyButton';

export interface NodeDetailPanelProps {
  node: TraceNode;
  inEdges?: TraceEdge[];
  outEdges?: TraceEdge[];
  onNavigateToNode?: (nodeId: string) => void;
  onClose?: () => void;
  className?: string;
}

export function NodeDetailPanel({
  node,
  inEdges = [],
  outEdges = [],
  onNavigateToNode,
  onClose,
  className,
}: NodeDetailPanelProps) {
  return (
    <Card className={cn('codrag-node-detail-panel', className)}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-mono font-semibold text-lg">{node.name}</h3>
          <p className="text-sm text-gray-500">{node.file_path}</p>
        </div>
        {onClose && (
          <Button size="xs" variant="secondary" onClick={onClose}>
            ×
          </Button>
        )}
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Badge color="blue">{node.kind}</Badge>
        {node.metadata.symbol_type && (
          <Badge color="green">{node.metadata.symbol_type as string}</Badge>
        )}
        {node.language && (
          <Badge color="gray">{node.language}</Badge>
        )}
        {node.metadata.is_async && (
          <Badge color="blue">async</Badge>
        )}
        {node.metadata.is_public === false && (
          <Badge color="orange">private</Badge>
        )}
      </div>

      {/* Location */}
      {node.span && (
        <div className="mb-4">
          <p className="text-xs font-medium text-gray-500 uppercase mb-1">Location</p>
          <p className="text-sm font-mono">
            Lines {node.span.start_line}–{node.span.end_line}
          </p>
        </div>
      )}

      {/* Docstring */}
      {node.metadata.docstring && (
        <div className="mb-4">
          <p className="text-xs font-medium text-gray-500 uppercase mb-1">Docstring</p>
          <pre className="text-sm whitespace-pre-wrap bg-gray-50 dark:bg-gray-800 p-2 rounded text-gray-700 dark:text-gray-300">
            {node.metadata.docstring as string}
          </pre>
        </div>
      )}

      {/* Decorators */}
      {node.metadata.decorators && (node.metadata.decorators as string[]).length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-medium text-gray-500 uppercase mb-1">Decorators</p>
          <div className="flex flex-wrap gap-1">
            {(node.metadata.decorators as string[]).map((dec, i) => (
              <Badge key={i} size="xs" color="gray">@{dec}</Badge>
            ))}
          </div>
        </div>
      )}

      {/* Inbound Edges */}
      {inEdges.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-medium text-gray-500 uppercase mb-2">
            Imported By ({inEdges.length})
          </p>
          <div className="space-y-1 max-h-32 overflow-auto">
            {inEdges.map((edge) => (
              <button
                key={edge.id}
                onClick={() => onNavigateToNode?.(edge.source)}
                className="block w-full text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800 px-2 py-1 rounded"
              >
                <span className="font-mono text-blue-600">{edge.source}</span>
                <Badge size="xs" color="gray" className="ml-2">{edge.kind}</Badge>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Outbound Edges */}
      {outEdges.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-medium text-gray-500 uppercase mb-2">
            Imports ({outEdges.length})
          </p>
          <div className="space-y-1 max-h-32 overflow-auto">
            {outEdges.map((edge) => (
              <button
                key={edge.id}
                onClick={() => onNavigateToNode?.(edge.target)}
                className="block w-full text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800 px-2 py-1 rounded"
              >
                <span className="font-mono text-blue-600">{edge.target}</span>
                <Badge size="xs" color="gray" className="ml-2">{edge.kind}</Badge>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="pt-4 border-t flex gap-2">
        <CopyButton
          text={node.id}
          label="Copy Node ID"
        />
      </div>
    </Card>
  );
}
