import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { FleetPage } from '@/components/modules/fleet/fleet-page';
import { routing } from '@/i18n/routing';

interface HomePageProps {
  readonly params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  return (
    <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <FleetPage />
    </main>
  );
}
