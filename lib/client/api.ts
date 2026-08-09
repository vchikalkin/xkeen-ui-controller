import type {
  ApplyMode,
  ApplyRouterResult,
  HealthStatus,
  Router,
} from '@/lib/types/router';

interface ApiFailure { success: false; error: string }
type ApiSuccess<T extends Record<string, unknown>> = { success: true } & T;
type ApiResult<T extends Record<string, unknown>> = ApiSuccess<T> | ApiFailure;

interface CreateRouterInput {
  ip: string;
  name?: string;
}

interface ApplyInput {
  content: string;
  routerIds: string[];
  mode: ApplyMode;
}

interface InlineInterface { init?: RequestInit }
async function request<T extends Record<string, unknown>>(
  path: string,
  { init }: InlineInterface = {},
): Promise<ApiResult<T>> {
  const headers = new Headers(init?.headers);

  headers.set('Accept', 'application/json');

  if (init?.body) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(path, {
    ...init,
    headers,
  });

  return (await response.json()) as ApiResult<T>;
}

export async function fetchRouters(): Promise<Router[]> {
  const data = await request<{ routers: Router[] }>('/api/routers');

  if (!data.success) {
    throw new Error(data.error);
  }

  return data.routers;
}

export async function createRouter(input: CreateRouterInput): Promise<Router> {
  const data = await request<{ router: Router }>('/api/routers', {
    init: {
      method: 'POST',
      body: JSON.stringify(input),
    },
  });

  if (!data.success) {
    throw new Error(data.error);
  }

  return data.router;
}

export async function removeRouter(id: string): Promise<void> {
  const data = await request(`/api/routers/${id}`, {
    init: { method: 'DELETE' },
  });

  if (!data.success) {
    throw new Error(data.error);
  }
}

export async function fetchHealth(): Promise<HealthStatus[]> {
  const data = await request<{ statuses: HealthStatus[] }>(
    '/api/routers/health',
  );

  if (!data.success) {
    throw new Error(data.error);
  }

  return data.statuses;
}

export async function fetchDraft(): Promise<string> {
  const data = await request<{ content: string }>('/api/draft');

  if (!data.success) {
    throw new Error(data.error);
  }

  return data.content;
}

export async function saveDraft(content: string): Promise<void> {
  const data = await request('/api/draft', {
    init: {
      method: 'PUT',
      body: JSON.stringify({ content }),
    },
  });

  if (!data.success) {
    throw new Error(data.error);
  }
}

export async function fetchRouterConfig(id: string): Promise<string> {
  const data = await request<{ content: string }>(`/api/routers/${id}/config`);

  if (!data.success) {
    throw new Error(data.error);
  }

  return data.content;
}

export async function runApply(
  input: ApplyInput,
): Promise<{ results: ApplyRouterResult[]; ok: boolean }> {
  const data = await request<{ results: ApplyRouterResult[]; ok: boolean }>(
    '/api/apply',
    {
      init: {
        method: 'POST',
        body: JSON.stringify(input),
      },
    },
  );

  if (!data.success) {
    throw new Error(data.error);
  }

  return { results: data.results, ok: data.ok };
}
