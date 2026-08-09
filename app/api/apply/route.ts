/* eslint-disable @typescript-eslint/naming-convention -- Next.js route handlers */
import { jsonError, jsonOk, zodErrorMessage } from '@/lib/api/http';
import { applyRequestSchema } from '@/lib/types/router';
import { applyToRouters } from '@/lib/xkeen/apply';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const parsed = applyRequestSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError(zodErrorMessage(parsed.error), { status: 400 });
    }

    const results = await applyToRouters(
      parsed.data.routerIds,
      parsed.data.content,
      parsed.data.mode,
    );

    const isOk = results.every((result) => result.ok);

    return jsonOk({ results, ok: isOk }, { status: isOk ? 200 : 207 });
  } catch {
    return jsonError('Apply failed', { status: 500 });
  }
}
