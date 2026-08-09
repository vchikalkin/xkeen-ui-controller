import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import type { PropsWithChildren } from 'react';
import { SetHtmlLang } from '@/components/set-html-lang';
import { SiteControls } from '@/components/site-controls';
import { routing } from '@/i18n/routing';

interface LocaleLayoutProps extends PropsWithChildren {
  readonly params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();
  const t = await getTranslations('HomePage');

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <SetHtmlLang locale={locale} />
      <div className="flex min-h-0 flex-1 flex-col bg-muted dark:bg-background">
        <div className="mx-auto flex w-full max-w-7xl shrink-0 items-center justify-between gap-1.5 px-3 pt-[max(0.75rem,env(safe-area-inset-top))] pr-[max(0.75rem,env(safe-area-inset-right))] pb-0">
          <h1 className="truncate text-lg font-semibold select-none">
            {t('title')}
          </h1>
          <SiteControls />
        </div>
        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      </div>
    </NextIntlClientProvider>
  );
}
