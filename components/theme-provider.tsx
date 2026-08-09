'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import type { PropsWithChildren } from 'react';

export function ThemeProvider({ children }: Readonly<PropsWithChildren>) {
  return (
    <NextThemesProvider
      enableSystem
      disableTransitionOnChange
      attribute="class"
      defaultTheme="system"
    >
      {children}
    </NextThemesProvider>
  );
}
