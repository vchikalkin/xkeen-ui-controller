'use client';

import { useLocale, useTranslations } from 'next-intl';
import { buttonVariants } from '@/components/ui/button';
import { Link, usePathname } from '@/i18n/navigation';
import { type Locale, routing } from '@/i18n/routing';
import { cn } from '@/lib/utils';

export function LocaleSwitcher() {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const t = useTranslations('LocaleSwitcher');

  return (
    <nav
      aria-label={t('label')}
      className="flex gap-1 rounded-lg border border-border bg-background/90 p-[3px] text-sm shadow-xs backdrop-blur"
    >
      {routing.locales.map((nextLocale) => {
        const isActive = locale === nextLocale;

        return (
          <Link
            replace
            key={nextLocale}
            href={pathname}
            locale={nextLocale}
            className={cn(
              buttonVariants({
                size: 'sm',
                variant: isActive ? 'default' : 'ghost',
              }),
            )}
          >
            {t(nextLocale)}
          </Link>
        );
      })}
    </nav>
  );
}
