'use client';

import { useEffect } from 'react';

interface SetHtmlLangProps {
  readonly locale: string;
}

export function SetHtmlLang({ locale }: SetHtmlLangProps) {
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return null;
}
