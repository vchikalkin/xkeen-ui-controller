import { getRouterById } from '@/lib/store/routers';
import type { ApplyRouterResult } from '@/lib/types/router';
import { createBackup } from './client';

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

export async function backupRouters(
  routerIds: string[],
): Promise<ApplyRouterResult[]> {
  return mapPool(routerIds, CONCURRENCY, async (routerId) => {
    const router = await getRouterById(routerId);

    if (!router) {
      return {
        routerId,
        ok: false,
        stage: 'backup',
        error: 'Router not found',
      };
    }

    try {
      const backup = await createBackup(router.ip);

      return {
        routerId,
        ok: true,
        stage: 'backup',
        backupName: backup.name,
      };
    } catch (error) {
      return {
        routerId,
        ok: false,
        stage: 'backup',
        error: error instanceof Error ? error.message : 'Backup failed',
      };
    }
  });
}
