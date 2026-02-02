import { Card, Title, Flex, Text, Badge } from '@tremor/react';
import { cn } from '../../lib/utils';

export interface LLMServiceStatus {
  name: string;
  url?: string;
  status: 'connected' | 'disconnected' | 'disabled';
  type: 'ollama' | 'clara' | 'openai' | 'other';
}

export interface LLMStatusCardProps {
  services: LLMServiceStatus[];
  className?: string;
}

export function LLMStatusCard({ services, className }: LLMStatusCardProps) {
  return (
    <Card className={cn('border border-border bg-surface shadow-sm', className)}>
      <Title className="text-text mb-4">LLM Services</Title>
      <div className="space-y-3">
        {services.map((service) => (
          <Flex 
            key={service.name} 
            justifyContent="between" 
            alignItems="center" 
            className="p-2 rounded-lg bg-surface-raised"
          >
            <Flex className="gap-2" alignItems="center">
              <span className={cn(
                "w-2 h-2 rounded-full",
                service.status === 'connected' ? "bg-success animate-pulse" :
                service.status === 'disconnected' ? "bg-error" :
                "bg-text-subtle/50"
              )} />
              <Text className={cn(
                service.status === 'disabled' ? "text-text-muted" : "text-text"
              )}>
                {service.name}
              </Text>
            </Flex>
            {service.status === 'disabled' ? (
              <Badge color="gray" size="xs">Disabled</Badge>
            ) : (
              <Text className="text-text-subtle text-xs">{service.url}</Text>
            )}
          </Flex>
        ))}
      </div>
    </Card>
  );
}
