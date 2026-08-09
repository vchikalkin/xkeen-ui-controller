/**
 * @type {import('next-export-optimize-images').Config}
 * @see https://next-export-optimize-images.vercel.app/docs/getting-started
 */
module.exports = {
  quality: 80,
  convertFormat: [
    ['jpg', 'webp'],
    ['jpeg', 'webp'],
    ['png', 'webp'],
  ],
  // Photos use uppercase ".JPG"; normalize so convertFormat matches.
  sourceImageParser: ({ src, defaultParser }) => {
    const parsed = defaultParser(src);

    return {
      ...parsed,
      extension: parsed.extension.toLowerCase(),
    };
  },
};
