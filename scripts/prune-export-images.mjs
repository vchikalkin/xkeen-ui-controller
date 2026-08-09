/**
 * Removes unused originals from `out/` after next-export-optimize-images.
 * Next.js copies public/ to out/; the site serves webp from _next/static/chunks/images/.
 * Keep in sync with image dirs in lib/photos.ts (hero, gallery).
 */
import fs from 'node:fs';
import path from 'node:path';

const outDir = path.join(process.cwd(), 'out');
const publicImageDirs = ['hero', 'gallery'];

if (!fs.existsSync(outDir)) {
  console.warn('prune-export-images: out/ not found, skipping.');
  process.exit(0);
}

for (const dir of publicImageDirs) {
  const target = path.join(outDir, dir);

  if (!fs.existsSync(target)) {
    continue;
  }

  fs.rmSync(target, { recursive: true, force: true });
  console.log(`prune-export-images: removed out/${dir}/`);
}
