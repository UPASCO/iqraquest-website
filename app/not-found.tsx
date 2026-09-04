import { setRequestLocale } from 'next-intl/server';
import { SiteShell } from '@/components/layout/SiteShell';
import { NotFoundPage } from '@/components/pages';
import { defaultLocale } from '@/i18n/routing';

/**
 * The 404.
 *
 * There is no root `app/layout.tsx` — `(default)` and `(intl)` each own
 * a root layout — so this page renders the whole document itself, via
 * the same shell every other page uses. The static export writes it to
 * `out/404.html`, which is exactly the file GitHub Pages serves for an
 * unknown path, in every language.
 */
export default async function NotFound() {
  setRequestLocale(defaultLocale);

  return (
    <SiteShell locale={defaultLocale}>
      <NotFoundPage />
    </SiteShell>
  );
}
