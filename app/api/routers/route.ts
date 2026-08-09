/* eslint-disable @typescript-eslint/naming-convention -- Next.js route handlers */
import { jsonError, jsonOk, zodErrorMessage } from '@/lib/api/http';
import { addRouter, listRouters } from '@/lib/store/routers';
import { createRouterSchema } from '@/lib/types/router';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const routers = await listRouters();

    return jsonOk({ routers });
  } catch {
    return jsonError('Failed to load routers', { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const parsed = createRouterSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError(zodErrorMessage(parsed.error), { status: 400 });
    }

    const router = await addRouter(parsed.data);

    return jsonOk({ router }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === 'ROUTER_EXISTS') {
      return jsonError('Router already exists', { status: 409 });
    }

    return jsonError('Failed to add router', { status: 500 });
  }
}
