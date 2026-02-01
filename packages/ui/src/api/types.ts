import type {
  ApiError,
  LLMStatus,
  Project,
  ProjectStatus,
  SearchResult,
  TraceExpandOptions,
  TraceStatus,
} from '../types';

export interface ApiEnvelope<T> {
  success: boolean;
  data: T | null;
  error: ApiError | null;
}

export type ProjectListItem = Pick<
  Project,
  'id' | 'name' | 'path' | 'mode' | 'created_at' | 'updated_at'
> & {
  config?: Project['config'];
};

export interface ListProjectsResponse {
  projects: ProjectListItem[];
  total: number;
}

export interface SearchRequest {
  query: string;
  k?: number;
  min_score?: number;
}

export interface SearchResponse {
  results: SearchResult[];
}

export interface AssembleContextRequest {
  query: string;
  k?: number;
  max_chars?: number;
  min_score?: number;
  include_sources?: boolean;
  include_scores?: boolean;
  structured?: boolean;
  trace_expand?: TraceExpandOptions;
}

export interface StructuredContextChunk {
  chunk_id: string;
  source_path: string;
  span?: { start_line: number; end_line: number };
  score?: number;
  text: string;
}

export interface AssembleContextResponseText {
  context: string;
}

export interface AssembleContextResponseStructured {
  context: string;
  chunks: StructuredContextChunk[];
  total_chars?: number;
  estimated_tokens?: number;
}

export type AssembleContextResponse =
  | AssembleContextResponseText
  | AssembleContextResponseStructured;

export type { ProjectStatus, TraceStatus, LLMStatus };
