'use client';

import { LocaleSwitcher } from '@/components/locale-switcher';
import { ThemeSwitcher } from '@/components/theme-switcher';

export function SiteControls() {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col items-end gap-2 sm:flex-row sm:items-center">
      <ThemeSwitcher />
      <LocaleSwitcher />
    </div>
  );
}
