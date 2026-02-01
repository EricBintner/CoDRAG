import type { ApiClient } from './client';

export function createMockApiClient(overrides: Partial<ApiClient> = {}): ApiClient {
  const missing = (name: keyof ApiClient) => () => {
    throw new Error(`MockApiClient: method '${String(name)}' is not implemented`);
  };

  return {
    listProjects: overrides.listProjects ?? missing('listProjects'),
    getProjectStatus: overrides.getProjectStatus ?? missing('getProjectStatus'),
    search: overrides.search ?? missing('search'),
    assembleContext: overrides.assembleContext ?? missing('assembleContext'),
    getTraceStatus: overrides.getTraceStatus ?? missing('getTraceStatus'),
    getLLMStatus: overrides.getLLMStatus ?? missing('getLLMStatus'),
  };
}
