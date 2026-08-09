/* eslint-disable @typescript-eslint/naming-convention -- Next.js route handlers */
import { jsonError, jsonOk, zodErrorMessage } from '@/lib/api/http';
import { backupRequestSchema } from '@/lib/types/router';
import { backupRouters } from '@/lib/xkeen/backup';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const parsed = backupRequestSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError(zodErrorMessage(parsed.error), { status: 400 });
    }

    const results = await backupRouters(parsed.data.routerIds);
    const isOk = results.every((result) => result.ok);

    return jsonOk({ results, ok: isOk }, { status: isOk ? 200 : 207 });
  } catch {
    return jsonError('Backup failed', { status: 500 });
  }
}
