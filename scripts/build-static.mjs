/**
 * Static export for Cloudflare Pages: out/ + webp + prune unused originals.
 */
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const root = process.cwd();
const env = {
  ...process.env,
  STATIC_EXPORT: 'true',
  NEXT_PUBLIC_STATIC_EXPORT: 'true',
};

function run(nodeArgs) {
  const result = spawnSync(process.execPath, nodeArgs, {
    stdio: 'inherit',
    env,
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

run([path.join(root, 'node_modules/next/dist/bin/next'), 'build']);
run([path.join(root, 'node_modules/next-export-optimize-images/bin/index.js')]);
run([path.join(root, 'scripts/prune-export-images.mjs')]);
