import type { ReactNode } from 'react';
import { getTranslations } from 'next-intl/server';
import { Header, type HeaderLabels } from './Header';
import { Footer } from './Footer';
import { fontVariablesFor } from '@/lib/fonts';
import { isRtl, textDirection, type Locale } from '@/i18n/routing';
import '@/styles/globals.css';

/**
 * The document.
 *
 * Both root layouts — the un-prefixed French tree and the prefixed
 * `[locale]` tree — render through this one component, so `<html>` is
 * described in a single place and the two trees cannot drift apart.
 */
export async function SiteShell({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  const t = await getTranslations({ locale, namespace: 'common' });
  const tNav = await getTranslations({ locale, namespace: 'nav' });

  // The header is interactive, so it is a client component — but its
  // strings are resolved here and handed over as plain props. Nothing
  // about translation crosses the boundary: no catalogue, no ICU
  // formatter, no provider.
  const headerLabels: HeaderLabels = {
    backHome: t('backHome'),
    brandBaseline: t('brandBaseline'),
    menu: t('menu'),
    openMenu: t('openMenu'),
    closeMenu: t('closeMenu'),
    comingSoon: t('comingSoon'),
    cta: t('ctaHeader'),
    contact: tNav('contact'),
    // Same order as `navHrefs` in Header.
    nav: [
      tNav('game'),
      tNav('knowledge'),
      tNav('howToPlay'),
      tNav('universe'),
      tNav('support'),
      tNav('privacy'),
    ],
    localeSwitcher: {
      chooseLanguage: t('chooseLanguage'),
      language: t('language'),
    },
  };

  // The Naskh face rides only on the two locales that set text in it.
  const rtl = isRtl(locale);

  return (
    <html
      lang={locale}
      dir={textDirection(locale)}
      className={fontVariablesFor(rtl)}
      suppressHydrationWarning
    >
      {/* eslint-disable-next-line @next/next/no-head-element --
          An explicit <head> is valid in an App Router root layout, and
          it is the only way to guarantee the CSP meta element is parsed
          before the resources it governs. `next/head` is Pages Router
          only and would be wrong here. */}
      <head>
        {/*
          GitHub Pages serves a fixed set of response headers and cannot
          be given custom ones, so the policy is declared by the
          document itself. `frame-ancestors` and HSTS are header-only
          directives and are ignored here — the trade-off is recorded in
          DEPLOYMENT.md, together with what to put in front of the site
          to restore them.
        */}
        <meta
          httpEquiv="Content-Security-Policy"
          content={[
            "default-src 'self'",
            "base-uri 'self'",
            "object-src 'none'",
            "form-action 'self' mailto:",
            "img-src 'self' data:",
            "font-src 'self'",
            "style-src 'self' 'unsafe-inline'",
            // React's development build uses eval() for stack
            // reconstruction; the production bundle never does.
            process.env.NODE_ENV === 'production'
              ? "script-src 'self' 'unsafe-inline'"
              : "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
            "connect-src 'self'",
            "manifest-src 'self'",
          ].join('; ')}
        />
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta name="referrer" content="strict-origin-when-cross-origin" />
        <meta name="theme-color" content="#061f18" />
        <meta name="color-scheme" content="dark" />
      </head>
      <body className="min-h-dvh bg-surface-base antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-gold focus:px-5 focus:py-3 focus:font-semibold focus:text-[#20160a]"
        >
          {t('skipToContent')}
        </a>

        <Header locale={locale} labels={headerLabels} />

        <main id="main" tabIndex={-1} className="pt-[var(--header-h)]">
          {children}
        </main>

        <Footer />
      </body>
    </html>
  );
}
