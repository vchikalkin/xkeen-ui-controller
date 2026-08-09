import { getEnv } from '@/lib/env';
import { getRouterById } from '@/lib/store/routers';
import type { ApplyMode, ApplyRouterResult } from '@/lib/types/router';
import { putConfig, softRestart } from './client';

const CONCURRENCY = 3;

async function mapPool<T, R>(
  items: T[],
  concurrency: number,
  worker: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = Array.from({ length: items.length });
  let nextIndex = 0;

  async function run(): Promise<void> {
    while (nextIndex < items.length) {
      const current = nextIndex;

      nextIndex = nextIndex + 1;
      const item = items[current];

      if (item === undefined) {
        continue;
      }

      results[current] = await worker(item);
    }
  }

  const runners = Array.from(
    { length: Math.min(concurrency, items.length || 1) },
    async () => run(),
  );

  await Promise.all(runners);

  return results;
}

export async function applyToRouters(
  routerIds: string[],
  content: string,
  mode: ApplyMode,
): Promise<ApplyRouterResult[]> {
  const { MIHOMO_CONFIG_PATH } = getEnv();

  return mapPool(routerIds, CONCURRENCY, async (routerId) => {
    const router = await getRouterById(routerId);

    if (!router) {
      return {
        routerId,
        ok: false,
        stage: 'save',
        error: 'Router not found',
      };
    }

    try {
      await putConfig(router.ip, MIHOMO_CONFIG_PATH, content, {
        validate: true,
      });
    } catch (error) {
      return {
        routerId,
        ok: false,
        stage: 'save',
        error: error instanceof Error ? error.message : 'Save failed',
      };
    }

    if (mode === 'save') {
      return { routerId, ok: true, stage: 'save' };
    }

    try {
      await softRestart(router.ip, { core: 'mihomo' });

      return { routerId, ok: true, stage: 'restart' };
    } catch (error) {
      return {
        routerId,
        ok: false,
        stage: 'restart',
        error: error instanceof Error ? error.message : 'Restart failed',
      };
    }
  });
}
