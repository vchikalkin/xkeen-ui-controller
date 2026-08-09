import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { MdxPageContent } from '@/lib/mdx-content';

interface MdxPageProps {
  readonly params: Promise<{ locale: string }>;
}

export default async function MdxPage({ params }: MdxPageProps) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  return <MdxPageContent locale={locale} />;
}
