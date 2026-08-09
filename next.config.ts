import type { NextConfig } from 'next';
import withExportImages from 'next-export-optimize-images';
import createNextIntlPlugin from 'next-intl/plugin';
import createMDX from '@next/mdx';

const isStaticExport = process.env.STATIC_EXPORT === 'true';

const withNextIntl = createNextIntlPlugin();

const baseConfig: NextConfig = {
  ...(isStaticExport ? { output: 'export' as const } : {}),
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  images: {
    formats: ['image/webp'],
  },
};

const withMDX = createMDX({
  extension: /\.mdx?$/u,
});

export default async (): Promise<NextConfig> => {
  const config = withNextIntl(withMDX(baseConfig));

  if (isStaticExport) {
    return withExportImages(config);
  }

  return config;
};
