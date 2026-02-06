import type { ApiClient } from './client';

export function createMockApiClient(overrides: Partial<ApiClient> = {}): ApiClient {
  const missing = (name: keyof ApiClient) => () => {
    throw new Error(`MockApiClient: method '${String(name)}' is not implemented`);
  };

  return {
    getHealth: overrides.getHealth ?? missing('getHealth'),
    listProjects: overrides.listProjects ?? missing('listProjects'),
    createProject: overrides.createProject ?? missing('createProject'),
    getProject: overrides.getProject ?? missing('getProject'),
    updateProject: overrides.updateProject ?? missing('updateProject'),
    deleteProject: overrides.deleteProject ?? missing('deleteProject'),
    getProjectStatus: overrides.getProjectStatus ?? missing('getProjectStatus'),
    buildProject: overrides.buildProject ?? missing('buildProject'),
    search: overrides.search ?? missing('search'),
    assembleContext: overrides.assembleContext ?? missing('assembleContext'),
    getTraceStatus: overrides.getTraceStatus ?? missing('getTraceStatus'),
    getProjectRoots: overrides.getProjectRoots ?? missing('getProjectRoots'),
    getProjectFileContent: overrides.getProjectFileContent ?? missing('getProjectFileContent'),
    startWatch: overrides.startWatch ?? missing('startWatch'),
    stopWatch: overrides.stopWatch ?? missing('stopWatch'),
    getWatchStatus: overrides.getWatchStatus ?? missing('getWatchStatus'),
    getLLMStatus: overrides.getLLMStatus ?? missing('getLLMStatus'),
  };
}
