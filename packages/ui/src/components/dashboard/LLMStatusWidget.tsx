import { Card, Title, Flex, Text, Badge } from '@tremor/react';
import { cn } from '../../lib/utils';

export interface LLMServiceStatus {
  name: string;
  url?: string;
  status: 'connected' | 'disconnected' | 'disabled' | 'not-configured';
  type: 'ollama' | 'clara' | 'openai' | 'other';
}

export interface LLMStatusWidgetProps {
  services: LLMServiceStatus[];
  className?: string;
  bare?: boolean;
}

export function LLMStatusWidget({ services, className, bare = false }: LLMStatusWidgetProps) {
  const Container = bare ? 'div' : Card;

  return (
    <Container className={cn(!bare && 'border border-border bg-surface shadow-sm', className)}>
      {!bare && <Title className="text-text mb-4">LLM Services</Title>}
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
                service.status === 'disabled' ? "bg-text-subtle/50" :
                "bg-text-muted/30" // not-configured
              )} />
              <Text className={cn(
                (service.status === 'disabled' || service.status === 'not-configured') ? "text-text-muted" : "text-text"
              )}>
                {service.name}
              </Text>
            </Flex>
            {service.status === 'disabled' ? (
              <Badge color="gray" size="xs">Disabled</Badge>
            ) : service.status === 'not-configured' ? (
              <Badge color="slate" size="xs">Not Set</Badge>
            ) : (
              <Text className="text-text-subtle text-xs">{service.url}</Text>
            )}
          </Flex>
        ))}
      </div>
    </Container>
  );
}
