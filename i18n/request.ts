import { hasLocale } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';
import type ruMessages from '../messages/ru.json';
import { routing } from './routing';

type Messages = typeof ruMessages;

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  const messagesImport = (await import(
    `../messages/${locale}.json`
  )) as { default: Messages };

  return {
    locale,
    messages: messagesImport.default,
  };
});
