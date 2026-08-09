---
name: add-ui-library
description: Evaluate and add third-party UI components from shadcn/ui, Magic UI, or Aceternity UI. Use when the user asks to install shadcn, add a carousel, animated background, or other complex UI from external libraries.
---

# Add UI Library

## When to propose a library
If shadcn/ui, Magic UI, or Aceternity UI has a solid fit (carousel, animated background, tag cloud, etc.) — propose it before building from scratch.

## Before installing
**Stop and ask the user for confirmation.** Briefly explain:
- Why the library component fits
- New dependencies and bundle impact
- Whether a custom component in `components/ui/` is lighter

## After approval
- Install/copy per that library's docs
- Adapt to project conventions: `cn`, cva, Tailwind v4, i18n for user-facing text
- Place output in `components/ui/` or `components/sections/`

## When not to use a library
Trivial UI → custom component in `components/ui/` or `components/sections/` with no new deps.
