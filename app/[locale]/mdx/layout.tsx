import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { PropsWithChildren } from 'react';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

interface MdxLayoutProps extends PropsWithChildren {
  readonly params: Promise<{ locale: string }>;
}

export default async function MdxLayout({
  children,
  params,
}: MdxLayoutProps) {
  const { locale } = await params;

  setRequestLocale(locale);
  const t = await getTranslations('MdxPage');

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-16">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Badge variant="outline">{t('title')}</Badge>
        <Link
          href="/"
          className={cn(buttonVariants({ size: 'sm', variant: 'ghost' }))}
        >
          ← {t('back')}
        </Link>
      </div>
      <div className="prose max-w-none prose-neutral md:prose-lg dark:prose-invert">
        {children}
      </div>
    </div>
  );
}
