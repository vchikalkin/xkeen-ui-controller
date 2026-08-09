'use client';

import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { useSyncExternalStore } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type ThemeOption = 'light' | 'dark' | 'system';

const themeOptions: ThemeOption[] = ['light', 'dark', 'system'];

function renderThemeIcon(option: ThemeOption) {
  const iconClassName = 'size-4';

  switch (option) {
    case 'light': {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={iconClassName}
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      );
    }
    case 'dark': {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={iconClassName}
          aria-hidden="true"
        >
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        </svg>
      );
    }
    case 'system': {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={iconClassName}
          aria-hidden="true"
        >
          <rect width="20" height="14" x="2" y="3" rx="2" />
          <path d="M8 21h8M12 17v4" />
        </svg>
      );
    }
  }
}

function noopUnsubscribe() {
  // useSyncExternalStore requires a cleanup function even when unused.
}

function subscribeToClientMount() {
  return noopUnsubscribe;
}

function getClientSnapshot() {
  return true;
}

function getServerSnapshot() {
  return false;
}

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const t = useTranslations('ThemeSwitcher');
  const isMounted = useSyncExternalStore(
    subscribeToClientMount,
    getClientSnapshot,
    getServerSnapshot,
  );

  const shellClassName =
    'flex gap-1 rounded-full border border-border bg-background/90 p-1 text-sm shadow-sm backdrop-blur';

  if (!isMounted) {
    return (
      <nav aria-label={t('label')} className={shellClassName}>
        {themeOptions.map((option) => 
          { return <span
            key={option}
            className="size-10 rounded-full"
            aria-hidden="true"
          /> }
        )}
      </nav>
    );
  }

  const activeTheme = (theme ?? 'system') as ThemeOption;

  return (
    <nav aria-label={t('label')} className={shellClassName}>
      {themeOptions.map((option) => {
        const isActive = activeTheme === option;

        return (
          <Button
            key={option}
            size="icon"
            variant={isActive ? 'default' : 'ghost'}
            aria-label={t(option)}
            aria-pressed={isActive}
            className={cn('rounded-full')}
            onClick={() => {
              setTheme(option);
            }}
          >
            {renderThemeIcon(option)}
          </Button>
        );
      })}
    </nav>
  );
}
