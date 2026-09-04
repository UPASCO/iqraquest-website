import type { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { Header } from './Header';
import { Footer } from './Footer';
import { fontVariables } from '@/lib/fonts';
import { textDirection, type Locale } from '@/i18n/routing';
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
  const messages = await getMessages({ locale });
  const t = await getTranslations({ locale, namespace: 'common' });

  return (
    <html
      lang={locale}
      dir={textDirection(locale)}
      className={fontVariables}
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
        <NextIntlClientProvider locale={locale} messages={messages}>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-gold focus:px-5 focus:py-3 focus:font-semibold focus:text-[#20160a]"
          >
            {t('skipToContent')}
          </a>

          <Header locale={locale} />

          <main id="main" tabIndex={-1} className="pt-[var(--header-h)]">
            {children}
          </main>

          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
