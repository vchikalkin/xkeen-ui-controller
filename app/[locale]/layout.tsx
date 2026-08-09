import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
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

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <SetHtmlLang locale={locale} />
      <div className="flex min-h-0 flex-1 flex-col bg-zinc-100 dark:bg-background">
        <div className="shrink-0 border-b border-border bg-background">
          <div className="mx-auto flex w-full max-w-5xl items-center justify-end gap-2 px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] pr-[max(1rem,env(safe-area-inset-right))] md:px-6">
            <SiteControls />
          </div>
        </div>
        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      </div>
    </NextIntlClientProvider>
  );
}
