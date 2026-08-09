import { randomUUID } from 'node:crypto';
import path from 'node:path';
import {
  type CreateRouterInput,
  createRouterSchema,
  type Router,
  routerSchema,
} from '@/lib/types/router';
import { ensureDataDir, getDataDir, readTextFile, writeTextFileAtomic } from './fs';

const FILE_NAME = 'routers.json';

function routersPath(): string {
  return path.join(getDataDir(), FILE_NAME);
}

export async function listRouters(): Promise<Router[]> {
  await ensureDataDir();
  const raw = await readTextFile(routersPath());

  if (!raw) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(raw);

    return routerSchema.array().parse(parsed);
  } catch {
    return [];
  }
}

export async function saveRouters(routers: Router[]): Promise<void> {
  const validated = routerSchema.array().parse(routers);

  await writeTextFileAtomic(
    routersPath(),
    `${JSON.stringify(validated, null, 2)}\n`,
  );
}

export async function getRouterById(id: string): Promise<Router | null> {
  const routers = await listRouters();

  return routers.find((router) => router.id === id) ?? null;
}

export async function addRouter(input: CreateRouterInput): Promise<Router> {
  const data = createRouterSchema.parse(input);
  const routers = await listRouters();

  if (routers.some((entry) => entry.ip === data.ip)) {
    throw new Error('ROUTER_EXISTS');
  }

  const created: Router = {
    id: randomUUID(),
    ip: data.ip,
    ...(data.name ? { name: data.name } : {}),
  };

  routers.push(created);
  await saveRouters(routers);

  return created;
}

export async function deleteRouter(id: string): Promise<boolean> {
  const routers = await listRouters();
  const next = routers.filter((router) => router.id !== id);

  if (next.length === routers.length) {
    return false;
  }
  await saveRouters(next);

  return true;
}
