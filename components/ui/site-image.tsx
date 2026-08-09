import NextImage from 'next/image';
import ExportImage from 'next-export-optimize-images/image';

/**
 * Vercel (`pnpm build`): next/image + Image Optimization API (webp on the fly).
 * Cloudflare (`pnpm build:static`): pre-built webp via next-export-optimize-images.
 */
export const SiteImage =
  process.env.NEXT_PUBLIC_STATIC_EXPORT === 'true' ? ExportImage : NextImage;
