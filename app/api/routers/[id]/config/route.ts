/* eslint-disable @typescript-eslint/naming-convention -- Next.js route handlers */
import { z } from 'zod';
import { jsonError, jsonOk, zodErrorMessage } from '@/lib/api/http';
import { getEnv } from '@/lib/env';
import { getRouterById } from '@/lib/store/routers';
import { applyToRouters } from '@/lib/xkeen/apply';
import { findMihomoConfig, getConfigs } from '@/lib/xkeen/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string }>;
}

const putBodySchema = z.object({
  content: z.string().min(1),
});

export async function GET(...args: [Request, RouteContext]) {
  const context = args[1];
  const { id } = await context.params;
  const router = await getRouterById(id);

  if (!router) {
    return jsonError('Router not found', { status: 404 });
  }

  try {
    const { MIHOMO_CONFIG_PATH } = getEnv();
    const configs = await getConfigs(router.ip, { core: 'mihomo' });
    const match = findMihomoConfig(configs, MIHOMO_CONFIG_PATH);

    if (!match) {
      return jsonError('Config file not found on router', { status: 404 });
    }

    return jsonOk({
      file: match.file,
      content: match.content,
    });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : 'Failed to load config',
      { status: 502 },
    );
  }
}

export async function PUT(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const router = await getRouterById(id);

  if (!router) {
    return jsonError('Router not found', { status: 404 });
  }

  try {
    const body: unknown = await request.json();
    const parsed = putBodySchema.safeParse(body);

    if (!parsed.success) {
      return jsonError(zodErrorMessage(parsed.error), { status: 400 });
    }

    const [result] = await applyToRouters([id], parsed.data.content, 'save');

    if (!result.ok) {
      return jsonError(result.error ?? 'Save failed', { status: 502 });
    }

    return jsonOk({ result });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : 'Failed to save config',
      { status: 502 },
    );
  }
}
