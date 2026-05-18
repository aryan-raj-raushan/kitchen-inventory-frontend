'use client';

import { useAuthStore } from '@/store/authStore';

const BASE_URL = '/api/v1';

type RequestOptions = {
  headers?: Record<string, string>;
  signal?: AbortSignal;
};

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  opts: RequestOptions = {},
  isRetry = false
): Promise<T> {
  const { accessToken, setTokens, clearAuth } = useAuthStore.getState();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...opts.headers,
  };
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal: opts.signal,
  });

  if (res.status === 401 && !isRetry) {
    const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, { method: 'POST' });
    if (refreshRes.ok) {
      const { data } = await refreshRes.json();
      setTokens(data.accessToken);
      return request<T>(method, path, body, opts, true);
    } else {
      clearAuth();
      if (typeof window !== 'undefined') window.location.href = '/login';
      throw new Error('Session expired');
    }
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }

  if (res.status === 204) return undefined as T;

  const json = await res.json();
  return json.data as T;
}

export const gateway = {
  get: <T>(path: string, opts?: RequestOptions) => request<T>('GET', path, undefined, opts),
  post: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>('POST', path, body, opts),
  put: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>('PUT', path, body, opts),
  patch: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>('PATCH', path, body, opts),
  delete: <T>(path: string, opts?: RequestOptions) =>
    request<T>('DELETE', path, undefined, opts),
};
