import { Flex, Text } from '@tremor/react';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface StatItem {
  label: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
}

export interface IndexStatsProps {
  stats: StatItem[];
  variant?: 'default' | 'compact' | 'large';
  className?: string;
}

export function IndexStats({ stats, variant = 'default', className }: IndexStatsProps) {
  const isLarge = variant === 'large';
  const isCompact = variant === 'compact';

  return (
    <div className={cn(
      "grid gap-4",
      isCompact ? "grid-cols-2" : "grid-cols-2 md:grid-cols-4",
      className
    )}>
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={cn(
            "rounded-lg border border-border-subtle bg-surface-raised",
            isLarge ? "p-6" : isCompact ? "p-3" : "p-4"
          )}
        >
          <Text className="text-text-subtle text-xs uppercase tracking-wide">
            {stat.label}
          </Text>
          <div className={cn(
            "mt-1 font-semibold text-text",
            isLarge ? "text-3xl" : isCompact ? "text-lg" : "text-2xl"
          )}>
            {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
          </div>
          {stat.change && (
            <Flex className="mt-2 gap-1" alignItems="center" justifyContent="start">
              <span
                className={cn(
                  "text-xs flex items-center gap-1",
                  stat.trend === 'up'
                    ? "text-success"
                    : stat.trend === 'down'
                    ? "text-error"
                    : "text-text-subtle"
                )}
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
