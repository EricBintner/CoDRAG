import type { ApiError } from '../types';

export class ApiClientError extends Error {
  readonly status?: number;
  readonly code?: string;
  readonly apiError?: ApiError;
  readonly url?: string;

  constructor(message: string, opts?: { status?: number; code?: string; apiError?: ApiError; url?: string }) {
    super(message);
    this.name = 'ApiClientError';
    this.status = opts?.status;
    this.code = opts?.code;
    this.apiError = opts?.apiError;
    this.url = opts?.url;
  }
}
