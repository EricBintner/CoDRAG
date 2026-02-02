import { Badge, Flex, Text } from '@tremor/react';
import { File, Zap, Link, ArrowDown, ArrowUp } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface TraceNode {
  id: string;
  name: string;
  kind: 'file' | 'symbol' | 'endpoint';
  language?: string;
  inDegree: number;
  outDegree: number;
}

export interface TraceEdge {
  source: string;
  target: string;
  kind: 'imports' | 'calls' | 'implements';
}

export interface TraceGraphProps {
  nodes: TraceNode[];
  edges: TraceEdge[];
  selectedNode?: string;
  onSelectNode?: (id: string) => void;
  className?: string;
}

const kindColors: Record<TraceNode['kind'], "blue" | "green" | "purple"> = {
  file: 'blue',
  symbol: 'green',
  endpoint: 'purple',
};

const kindIcons: Record<TraceNode['kind'], React.ReactNode> = {
  file: <File className="w-5 h-5" />,
  symbol: <Zap className="w-5 h-5" />,
  endpoint: <Link className="w-5 h-5" />,
};

export function TraceGraph({ nodes, selectedNode, onSelectNode, className }: TraceGraphProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {nodes.map((node) => (
        <div
          key={node.id}
          onClick={() => onSelectNode?.(node.id)}
          className={cn(
            "rounded-lg border p-3 cursor-pointer transition-all",
            selectedNode === node.id
              ? "border-primary bg-primary/10 shadow-md"
              : "border-border-subtle bg-surface-raised hover:border-border hover:shadow-sm"
          )}
        >
          <Flex justifyContent="between" alignItems="start">
            <div className="flex items-center gap-2">
              <span className="text-text-muted">{kindIcons[node.kind]}</span>
              <div>
                <Text className="font-mono text-sm text-text font-medium">{node.name}</Text>
                {node.language && (
                  <Text className="text-xs text-text-subtle">{node.language}</Text>
                )}
              </div>
            </div>
            <Badge color={kindColors[node.kind]} size="xs">
              {node.kind}
            </Badge>
          </Flex>
          <Flex className="mt-2 gap-4" justifyContent="start">
            <span className="text-xs text-text-subtle flex items-center gap-1">
              <span className="text-success flex items-center"><ArrowDown className="w-3 h-3" />{node.inDegree}</span> in
            </span>
            <span className="text-xs text-text-subtle flex items-center gap-1">
              <span className="text-info flex items-center"><ArrowUp className="w-3 h-3" />{node.outDegree}</span> out
            </span>
          </Flex>
        </div>
      ))}
    </div>
  );
}

export function TraceGraphMini({ nodeCount, edgeCount, className }: { nodeCount: number; edgeCount: number; className?: string }) {
  return (
    <div className={cn("relative h-32 rounded-lg border border-border-subtle bg-surface-raised overflow-hidden", className)}>
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 100">
        <defs>
          <linearGradient id="edgeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.8" />
          </linearGradient>
        </defs>
        
        {/* Stylized graph edges */}
        <path d="M 30 50 Q 60 20, 100 30" stroke="url(#edgeGradient)" strokeWidth="2" fill="none" />
        <path d="M 30 50 Q 60 70, 100 60" stroke="url(#edgeGradient)" strokeWidth="2" fill="none" />
        <path d="M 100 30 Q 130 40, 160 35" stroke="url(#edgeGradient)" strokeWidth="2" fill="none" />
        <path d="M 100 60 Q 130 55, 160 65" stroke="url(#edgeGradient)" strokeWidth="2" fill="none" />
        <path d="M 100 30 L 100 60" stroke="url(#edgeGradient)" strokeWidth="1.5" fill="none" />
        
        {/* Nodes */}
        <circle cx="30" cy="50" r="8" fill="var(--primary)" />
        <circle cx="100" cy="30" r="6" fill="var(--success)" />
        <circle cx="100" cy="60" r="6" fill="var(--success)" />
        <circle cx="160" cy="35" r="5" fill="var(--info)" />
        <circle cx="160" cy="65" r="5" fill="var(--info)" />
      </svg>
      
      <div className="absolute bottom-2 left-2 right-2 flex justify-between text-xs">
        <span className="text-text-subtle">{nodeCount} nodes</span>
        <span className="text-text-subtle">{edgeCount} edges</span>
      </div>
    </div>
  );
}
