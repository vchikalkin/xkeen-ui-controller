/* eslint-disable @typescript-eslint/naming-convention -- Next.js route handlers */
import { jsonError, jsonOk } from '@/lib/api/http';
import { listRouters } from '@/lib/store/routers';
import type { HealthStatus } from '@/lib/types/router';
import { getControl } from '@/lib/xkeen/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const routers = await listRouters();
    const statuses = await Promise.all(
      routers.map(async (router): Promise<HealthStatus> => {
        try {
          const control = await getControl(router.ip);

          return {
            routerId: router.id,
            online: true,
            running: control.running,
            currentCore: control.currentCore,
          };
        } catch (error) {
          return {
            routerId: router.id,
            online: false,
            error: error instanceof Error ? error.message : 'unreachable',
          };
        }
      }),
    );

    return jsonOk({ statuses });
  } catch {
    return jsonError('Failed to check health', { status: 500 });
  }
}
