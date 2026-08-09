<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project Rules

## Stack
- Next.js 16, React 19, TypeScript, **pnpm**
- Tailwind v4, next-intl (en, ru), MDX, next-themes
- Static export: `pnpm build:static` (`STATIC_EXPORT=true`)

## Architecture
- `components/ui/` — atomic UI primitives
- `components/sections/` or `components/modules/` — page blocks
- `messages/{locale}.json` + routes under `app/[locale]/`
- Utilities in `lib/utils.ts`; always use `cn` for class names

## Components
- Multi-variant UI (button, badge, input): **cva** + `VariantProps<typeof variants>`
- Merge styles: `cn(variants({ variant, size, className }))`
- Simple conditionals: `cn('base', isActive && 'active')`
- Tailwind v4 only — no deprecated utilities

## Quality
- Match **eslint-config-sheriff**: no `any`, typed props/exports
- No hardcoded user-facing text — add keys to `messages/en.json` and `messages/ru.json`
- Split components past ~120 lines

## Verification
- Husky + lint-staged on commit
- Run `pnpm lint` before finishing substantial tasks
