/* eslint-disable @typescript-eslint/naming-convention -- Next.js route handlers */
import { jsonError, jsonOk } from '@/lib/api/http';
import { deleteRouter, getRouterById } from '@/lib/store/routers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(...args: [Request, RouteContext]) {
  const context = args[1];
  const { id } = await context.params;
  const router = await getRouterById(id);

  if (!router) {
    return jsonError('Router not found', { status: 404 });
  }

  return jsonOk({ router });
}

export async function DELETE(...args: [Request, RouteContext]) {
  const context = args[1];
  const { id } = await context.params;
  const isRemoved = await deleteRouter(id);

  if (!isRemoved) {
    return jsonError('Router not found', { status: 404 });
  }

  return jsonOk({});
}
