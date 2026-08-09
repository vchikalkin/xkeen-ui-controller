import mdxEn from '@/content/mdx/en.mdx';
import mdxRu from '@/content/mdx/ru.mdx';
import type { Locale } from '@/i18n/routing';

const MdxEnContent = mdxEn;
const MdxRuContent = mdxRu;

interface MdxPageContentProps {
  readonly locale: Locale;
}

export function MdxPageContent({ locale }: MdxPageContentProps) {
  switch (locale) {
    case 'ru': {
      return <MdxRuContent />;
    }
    case 'en': {
      return <MdxEnContent />;
    }
  }
}
