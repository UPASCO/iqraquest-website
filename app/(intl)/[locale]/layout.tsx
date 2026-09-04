import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { SiteShell } from '@/components/layout/SiteShell';
import { defaultLocale, locales, type Locale } from '@/i18n/routing';

/**
 * Root layout for every locale other than the default one, which is
 * served un-prefixed by `app/(default)`. Emitting `fr` here as well
 * would publish the French pages at two URLs.
 *
 * `(default)` and `(intl)` are both top-level route groups, which is
 * what lets each own a root layout — the supported way to have two
 * `<html>` trees in one App Router site.
 */
export function generateStaticParams() {
  return locales
    .filter((locale) => locale !== defaultLocale)
    .map((locale) => ({ locale }));
}

// Only the locales listed above exist; anything else is a 404 rather
// than an attempt to render an unknown language at request time.
export const dynamicParams = false;

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!locales.includes(locale as Locale) || locale === defaultLocale) {
    notFound();
  }

  setRequestLocale(locale as Locale);
  return <SiteShell locale={locale as Locale}>{children}</SiteShell>;
}
