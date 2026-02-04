import { Folder, Database, Activity, AlertCircle } from 'lucide-react';
import { Card, Flex, Badge, Title, Text, Divider } from '@tremor/react';
import { cn } from '../../lib/utils';

export interface IndexStats {
  loaded: boolean;
  index_dir?: string;
  model?: string;
  built_at?: string;
  total_documents?: number;
  embedding_dim?: number;
}

export interface IndexStatusCardProps {
  stats: IndexStats;
  building?: boolean;
  lastError?: string | null;
  className?: string;
  bare?: boolean;
}

/**
 * IndexStatusCard - Shows the current state of the code index.
 * 
 * Displays:
 * - Project Name (placeholder or from props if available)
 * - Loaded status
 * - Stats
 */
export function IndexStatusCard({
  stats,
  building = false,
  lastError,
  className,
  bare = false,
}: IndexStatusCardProps) {
  const Container = bare ? 'div' : Card;
  
  return (
    <Container className={cn(!bare && 'border border-border bg-surface shadow-sm', className)}>
      <Flex justifyContent="between" alignItems="start">
        <div>
          <Flex className="gap-3" alignItems="center">
            {!bare && <Folder className="w-8 h-8 text-primary" />}
            <div>
              {!bare && <Title className="text-text">Current Project</Title>}
              <Text className={cn("font-mono text-sm text-text-subtle", bare && "text-xs")}>{stats.index_dir || 'No project loaded'}</Text>
            </div>
          </Flex>
        </div>
        <Flex className="gap-2">
          {stats.loaded ? (
            <Badge color="green">Fresh</Badge>
          ) : (
             <Badge color="yellow">Stale</Badge>
          )}
          {building && <Badge color="blue">Building</Badge>}
        </Flex>
      </Flex>
      <Divider className="my-4" />
      <Flex className="gap-3">
        <div className="flex items-center gap-4 text-sm text-text-muted">
          <span className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            {stats.total_documents ?? 0} docs
          </span>
          <span className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            {stats.model ?? 'No model'}
          </span>
        </div>
      </Flex>
      {lastError && (
        <div className="mt-4 flex gap-2 p-3 rounded-md bg-error-muted/10 border border-error-muted/20 text-error">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="text-sm font-medium break-all">
            {lastError}
          </span>
        </div>
      )}
    </Container>
  );
}
