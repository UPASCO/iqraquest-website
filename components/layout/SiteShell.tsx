import type { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { CLIENT_NAMESPACES } from '@/i18n/client-namespaces';
import { Header } from './Header';
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
  const allMessages = await getMessages({ locale });
  const t = await getTranslations({ locale, namespace: 'common' });

  // Only the namespaces a client component actually reads cross the
  // boundary. Handing over the whole catalogue would put 33 kB of JSON
  // into the payload of all 108 pages to serve the 3 kB the header, the
  // language switcher and the contact form need. Everything else is
  // rendered on the server, where the full catalogue already lives.
  const clientMessages = Object.fromEntries(
    CLIENT_NAMESPACES.filter((ns) => ns in allMessages).map((ns) => [
      ns,
      allMessages[ns],
    ]),
  );

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
        <NextIntlClientProvider locale={locale} messages={clientMessages}>
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
