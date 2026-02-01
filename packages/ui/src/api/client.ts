import { ApiClientError } from './errors';
import type {
  ApiEnvelope,
  AssembleContextRequest,
  AssembleContextResponse,
  ListProjectsResponse,
  SearchRequest,
  SearchResponse,
} from './types';
import type { LLMStatus, ProjectStatus, TraceStatus } from '../types';

export interface ApiClient {
  listProjects(): Promise<ListProjectsResponse>;
  getProjectStatus(projectId: string): Promise<ProjectStatus>;
  search(projectId: string, request: SearchRequest): Promise<SearchResponse>;
  assembleContext(projectId: string, request: AssembleContextRequest): Promise<AssembleContextResponse>;
  getTraceStatus(projectId: string): Promise<TraceStatus>;
  getLLMStatus(): Promise<LLMStatus>;
}

export interface ApiClientConfig {
  baseUrl?: string;
  apiKey?: string;
  fetchImpl?: typeof fetch;
}

export class CodragApiClient implements ApiClient {
  private readonly baseUrl: string;
  private readonly apiKey?: string;
  private readonly fetchImpl: typeof fetch;

  constructor(config?: ApiClientConfig) {
    this.baseUrl = config?.baseUrl ?? 'http://127.0.0.1:8400';
    this.apiKey = config?.apiKey;
    this.fetchImpl = config?.fetchImpl ?? fetch;
  }

  async listProjects(): Promise<ListProjectsResponse> {
    return this.requestEnvelope<ListProjectsResponse>('/projects');
  }

  async getProjectStatus(projectId: string): Promise<ProjectStatus> {
    return this.requestEnvelope<ProjectStatus>(`/projects/${encodeURIComponent(projectId)}/status`);
  }

  async search(projectId: string, request: SearchRequest): Promise<SearchResponse> {
    return this.requestEnvelope<SearchResponse>(`/projects/${encodeURIComponent(projectId)}/search`, {
      method: 'POST',
      body: request,
    });
  }

  async assembleContext(projectId: string, request: AssembleContextRequest): Promise<AssembleContextResponse> {
    return this.requestEnvelope<AssembleContextResponse>(`/projects/${encodeURIComponent(projectId)}/context`, {
      method: 'POST',
      body: request,
    });
  }

  async getTraceStatus(projectId: string): Promise<TraceStatus> {
    return this.requestEnvelope<TraceStatus>(`/projects/${encodeURIComponent(projectId)}/trace/status`);
  }

  async getLLMStatus(): Promise<LLMStatus> {
    return this.requestEnvelope<LLMStatus>('/llm/status');
  }

  private async requestEnvelope<T>(
    path: string,
    opts?: { method?: string; query?: Record<string, string | number | boolean | undefined>; body?: unknown }
  ): Promise<T> {
    const url = new URL(path, this.baseUrl);

    if (opts?.query) {
      for (const [k, v] of Object.entries(opts.query)) {
        if (v === undefined) continue;
        url.searchParams.set(k, String(v));
      }
    }

    const headers: Record<string, string> = {
      Accept: 'application/json',
    };

    if (opts?.body !== undefined) {
      headers['Content-Type'] = 'application/json';
    }

    if (this.apiKey) {
      headers.Authorization = `Bearer ${this.apiKey}`;
    }

    let res: Response;
    try {
      res = await this.fetchImpl(url.toString(), {
        method: opts?.method ?? 'GET',
        headers,
        body: opts?.body !== undefined ? JSON.stringify(opts.body) : undefined,
      });
    } catch (err) {
      throw new ApiClientError('Network error contacting CoDRAG daemon', { url: url.toString() });
    }

    let json: unknown;
    try {
      json = await res.json();
    } catch {
      throw new ApiClientError('Invalid JSON response from CoDRAG daemon', {
        status: res.status,
        url: url.toString(),
      });
    }

    const envelope = json as ApiEnvelope<T>;
    if (typeof envelope !== 'object' || envelope === null || typeof envelope.success !== 'boolean') {
      throw new ApiClientError('Unexpected response shape from CoDRAG daemon', {
        status: res.status,
        url: url.toString(),
      });
    }

    if (!envelope.success) {
      const message = envelope.error?.message ?? 'Request failed';
      throw new ApiClientError(message, {
        status: res.status,
        code: envelope.error?.code,
        apiError: envelope.error ?? undefined,
        url: url.toString(),
      });
    }

    if (envelope.data === null || envelope.data === undefined) {
      throw new ApiClientError('Envelope success=true but data was null', {
        status: res.status,
        url: url.toString(),
      });
    }

    return envelope.data;
  }
}

export function createCodragApiClient(config?: ApiClientConfig): ApiClient {
  return new CodragApiClient(config);
}
