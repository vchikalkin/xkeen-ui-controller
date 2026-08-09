import path from 'node:path';
import { ensureDataDir, getDataDir, readTextFile, writeTextFileAtomic } from './fs';

const FILE_NAME = 'global-draft.yaml';

function draftPath(): string {
  return path.join(getDataDir(), FILE_NAME);
}

export async function getGlobalDraft(): Promise<string> {
  await ensureDataDir();

  return (await readTextFile(draftPath())) ?? '';
}

export async function saveGlobalDraft(content: string): Promise<void> {
  await writeTextFileAtomic(draftPath(), content);
}
