import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { getEnv } from '@/lib/env';

export function getDataDir(): string {
  return path.resolve(getEnv().DATA_DIR);
}

export async function ensureDataDir(): Promise<string> {
  const dir = getDataDir();

  await mkdir(dir, { recursive: true });

  return dir;
}

export async function readTextFile(filePath: string): Promise<string | null> {
  try {
    return await readFile(filePath, 'utf8');
  } catch (error) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'ENOENT'
    ) {
      return null;
    }
    throw error;
  }
}

export async function writeTextFileAtomic(
  filePath: string,
  content: string,
): Promise<void> {
  await ensureDataDir();
  const tmpPath = `${filePath}.${String(process.pid)}.tmp`;

  await writeFile(tmpPath, content, 'utf8');
  await rename(tmpPath, filePath);
}
