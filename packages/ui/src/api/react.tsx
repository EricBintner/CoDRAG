import * as React from 'react';
import type { ApiClient } from './client';

const ApiClientContext = React.createContext<ApiClient | null>(null);

export interface ApiClientProviderProps {
  client: ApiClient;
  children: React.ReactNode;
}

export function ApiClientProvider({ client, children }: ApiClientProviderProps) {
  return <ApiClientContext.Provider value={client}>{children}</ApiClientContext.Provider>;
}

export function useApiClient(): ApiClient {
  const client = React.useContext(ApiClientContext);
  if (!client) {
    throw new Error('useApiClient must be used within an ApiClientProvider');
  }
  return client;
}
