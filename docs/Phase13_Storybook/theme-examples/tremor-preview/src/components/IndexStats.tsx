import { Badge, Flex, Text } from '@tremor/react';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';

interface StatItem {
  label: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
}

interface IndexStatsProps {
  stats: StatItem[];
  variant?: 'default' | 'compact' | 'large';
}

export function IndexStats({ stats, variant = 'default' }: IndexStatsProps) {
  const isLarge = variant === 'large';
  const isCompact = variant === 'compact';

  return (
    <div className={`grid gap-4 ${isCompact ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-4'}`}>
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={`rounded-lg border border-border-subtle bg-surface-raised p-4 ${
            isLarge ? 'p-6' : isCompact ? 'p-3' : 'p-4'
          }`}
        >
          <Text className="text-text-subtle text-xs uppercase tracking-wide">
            {stat.label}
          </Text>
          <div className={`mt-1 font-semibold text-text ${isLarge ? 'text-3xl' : isCompact ? 'text-lg' : 'text-2xl'}`}>
            {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
          </div>
          {stat.change && (
            <Flex className="mt-2 gap-1" alignItems="center">
              <span
                className={`text-xs flex items-center gap-1 ${
                  stat.trend === 'up'
                    ? 'text-success'
                    : stat.trend === 'down'
                    ? 'text-error'
                    : 'text-text-subtle'
                }`}
              >
                {stat.trend === 'up' ? <ArrowUp className="w-3 h-3" /> : stat.trend === 'down' ? <ArrowDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />} 
                {stat.change}
              </span>
            </Flex>
          )}
        </div>
      ))}
    </div>
  );
}

export const sampleIndexStats: StatItem[] = [
  { label: 'Total Files', value: 1234, change: '+12 today', trend: 'up' },
  { label: 'Chunks', value: 12904, change: '+847 today', trend: 'up' },
  { label: 'Embeddings', value: '768-dim', change: 'nomic-embed-text' },
  { label: 'Last Build', value: '2m ago', change: 'Auto-rebuild on' },
];

export const sampleMarketingStats: StatItem[] = [
  { label: 'Indexed Files', value: '50K+' },
  { label: 'Search Latency', value: '<100ms' },
  { label: 'Context Assembly', value: '<200ms' },
  { label: 'Token Savings', value: '60%+' },
];
