import { getEnv } from '@/lib/env';

const REQUEST_TIMEOUT_MS = 12_000;
const HEALTH_TIMEOUT_MS = 3000;

export interface XkeenApiResponse {
  success: boolean;
  error?: string;
}

export interface XkeenConfigItem {
  file: string;
  content: string;
}

export interface XkeenControlStatus {
  success: boolean;
  cores?: string[];
  currentCore?: string;
  running?: boolean;
  error?: string;
}

function baseUrl(ip: string): string {
  const { XKEEN_UI_PORT } = getEnv();

  return `http://${ip}:${String(XKEEN_UI_PORT)}`;
}

interface InlineInterface { init?: RequestInit; timeoutMs?: number }
async function fetchJson<T>(
  url: string,
  {
    init,
    timeoutMs = REQUEST_TIMEOUT_MS,
  }: InlineInterface = {},
): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  try {
    const headers = new Headers(init?.headers);

    headers.set('Accept', 'application/json');

    if (init?.body) {
      headers.set('Content-Type', 'application/json');
    }

    const response = await fetch(url, {
      ...init,
      signal: controller.signal,
      headers,
    });

    const text = await response.text();
    let data: unknown = {};

    if (text) {
      try {
        data = JSON.parse(text) as unknown;
      } catch {
        throw new Error(
          response.ok
            ? 'Invalid JSON from XKeen-UI'
            : `XKeen-UI HTTP ${String(response.status)}`,
        );
      }
    }

    if (!response.ok) {
      const message =
        typeof data === 'object' &&
        data !== null &&
        'error' in data &&
        typeof data.error === 'string'
          ? data.error
          : `XKeen-UI HTTP ${String(response.status)}`;

      throw new Error(message);
    }

    return data as T;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('XKeen-UI timeout');
    }

    throw error;
  } finally {
    clearTimeout(timer);
  }
}

export async function getControl(ip: string): Promise<XkeenControlStatus> {
  return fetchJson<XkeenControlStatus>(`${baseUrl(ip)}/api/control`, {
    init: { method: 'GET' },
    timeoutMs: HEALTH_TIMEOUT_MS,
  });
}

interface InlineInterface2 { core?: string }
export async function getConfigs(
  ip: string,
  { core = 'mihomo' }: InlineInterface2 = {},
): Promise<XkeenConfigItem[]> {
  const data = await fetchJson<{
    success: boolean;
    configs?: XkeenConfigItem[];
    error?: string;
  }>(`${baseUrl(ip)}/api/configs?core=${encodeURIComponent(core)}`);

  if (!data.success) {
    throw new Error(data.error ?? 'Failed to load configs');
  }

  return data.configs ?? [];
}

interface InlineInterface3 { validate?: boolean }
export async function putConfig(
  ip: string,
  file: string,
  content: string,
  { validate = true }: InlineInterface3 = {},
): Promise<void> {
  const query = validate ? '?validate=mihomo' : '';
  const data = await fetchJson<XkeenApiResponse>(
    `${baseUrl(ip)}/api/configs${query}`,
    {
      init: {
        method: 'PUT',
        body: JSON.stringify({ file, content }),
      },
    },
  );

  if (!data.success) {
    throw new Error(data.error ?? 'Failed to save config');
  }
}

interface InlineInterface4 { core?: string }
export async function softRestart(
  ip: string,
  { core = 'mihomo' }: InlineInterface4 = {},
): Promise<void> {
  const data = await fetchJson<XkeenApiResponse>(`${baseUrl(ip)}/api/control`, {
    init: {
      method: 'POST',
      body: JSON.stringify({ action: 'softRestart', core }),
    },
  });

  if (!data.success) {
    throw new Error(data.error ?? 'Soft restart failed');
  }
}

export interface XkeenBackupItem {
  name: string;
  mtime?: string;
  size?: number;
}

const BACKUP_TIMEOUT_MS = 60_000;

export async function createBackup(ip: string): Promise<XkeenBackupItem> {
  const data = await fetchJson<XkeenApiResponse & { backup?: XkeenBackupItem }>(
    `${baseUrl(ip)}/api/backup`,
    {
      init: { method: 'PUT' },
      timeoutMs: BACKUP_TIMEOUT_MS,
    },
  );

  if (!data.success) {
    throw new Error(data.error ?? 'Failed to create backup');
  }

  if (!data.backup?.name) {
    throw new Error('Backup created without a name');
  }

  return data.backup;
}

export function findMihomoConfig(
  configs: XkeenConfigItem[],
  configPath: string,
): XkeenConfigItem | undefined {
  const exact = configs.find((item) => item.file === configPath);

  if (exact) {
    return exact;
  }

  const normalized = configPath.replaceAll('\\', '/');

  return configs.find(
    (item) => item.file.replaceAll('\\', '/') === normalized,
  );
}
