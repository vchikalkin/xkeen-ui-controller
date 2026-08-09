'use client';

import { useEffect } from 'react';
import { routing } from '@/i18n/routing';

export default function RootPage() {
  useEffect(() => {
    window.location.replace(`/${routing.defaultLocale}`);
  }, []);

  return (
    <main className="flex flex-1 items-center justify-center">
      <p className="text-zinc-600 dark:text-zinc-400">Redirecting…</p>
    </main>
  );
}
