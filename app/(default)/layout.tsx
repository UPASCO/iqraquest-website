import type { ReactNode } from 'react';
import { setRequestLocale } from 'next-intl/server';
import { SiteShell } from '@/components/layout/SiteShell';
import { defaultLocale } from '@/i18n/routing';

/**
 * Root layout for the default locale.
 *
 * French is served without a prefix so the canonical homepage is
 * `https://iqraquest.org/`. This tree and `app/[locale]` are two root
 * layouts of one site; both render through `SiteShell`, so the document
 * is described once.
 */
export default async function DefaultLocaleLayout({
  children,
}: {
  children: ReactNode;
}) {
  setRequestLocale(defaultLocale);
  return <SiteShell locale={defaultLocale}>{children}</SiteShell>;
}
