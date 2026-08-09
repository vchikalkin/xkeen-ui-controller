'use client';

import { LocaleSwitcher } from '@/components/locale-switcher';
import { ThemeSwitcher } from '@/components/theme-switcher';

export function SiteControls() {
  return (
    <div className="flex shrink-0 items-center gap-1.5">
      <ThemeSwitcher />
      <LocaleSwitcher />
    </div>
  );
}
