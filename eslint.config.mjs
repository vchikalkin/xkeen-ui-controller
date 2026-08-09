import { sheriff } from 'eslint-config-sheriff';
import { defineConfig } from 'eslint/config';
import eslintPluginTailwindcss from 'eslint-plugin-tailwindcss';

const sheriffOptions = {
  // files: ["src/**/*"], // Only the files in the src directory will be linted.
  react: true,
  next: true,
  astro: false,
  lodash: false,
  remeda: false,
  playwright: false,
  storybook: false,
  jest: false,
  vitest: false,
  tsconfigRootDir: import.meta.dirname,
};

export default defineConfig(
  {
    ignores: ['postcss.config.mjs', 'export-images.config.js', 'scripts/**'],
  },
  sheriff(sheriffOptions),
  {
    extends: [eslintPluginTailwindcss.configs.recommended],
    settings: {
      tailwindcss: {
        cssConfigPath: './app/globals.css',
        callees: ['classnames', 'clsx', 'ctl', 'cva', 'cn'],
      },
    },
    rules: {
      'func-style': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      'tailwindcss/no-custom-classname': [
        'warn',
        {
          whitelist: [
            'card-hover',
            'gradient-text',
            'btn-gradient',
            'toggle-active',
            'orb-drift-1',
            'orb-drift-2',
            'orb-drift-3',
          ],
        },
      ],
    },
  },
  {
    files: ['lib/utils.ts'],
    rules: {
      'tailwindcss/no-custom-classname': 'off',
    },
  },
);
