import { defineRouting } from 'next-intl/routing';

/**
 * The twelve languages the IqraQuest application ships. The website
 * mirrors that list exactly — a player who plays in Malay should be
 * able to read about the game in Malay.
 *
 * French is the source language and the default locale. It is served
 * from the root (`/`, `/game`) with no prefix, so the canonical
 * homepage is `https://iqraquest.org`; every other locale is prefixed
 * (`/en`, `/ar`, …).
 */
export const locales = [
  'fr',
  'en',
  'ar',
  'de',
  'es',
  'id',
  'it',
  'ms',
  'nl',
  'pt',
  'tr',
  'ur',
] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'fr';

/** Locales written right-to-left. */
export const rtlLocales: readonly Locale[] = ['ar', 'ur'];

export function isRtl(locale: Locale): boolean {
  return rtlLocales.includes(locale);
}

export function textDirection(locale: Locale): 'rtl' | 'ltr' {
  return isRtl(locale) ? 'rtl' : 'ltr';
}

/**
 * Endonyms — every language is offered in its own script, never
 * translated into the current page's language. A Turkish speaker looks
 * for "Türkçe", not "Turc".
 */
export const localeNames: Record<Locale, string> = {
  fr: 'Français',
  en: 'English',
  ar: 'العربية',
  de: 'Deutsch',
  es: 'Español',
  id: 'Bahasa Indonesia',
  it: 'Italiano',
  ms: 'Bahasa Melayu',
  nl: 'Nederlands',
  pt: 'Português',
  tr: 'Türkçe',
  ur: 'اردو',
};

/**
 * BCP-47 tags used for `hreflang` and `og:locale`. They differ from the
 * route segment where a region makes the tag more useful to search
 * engines.
 */
export const hreflangFor: Record<Locale, string> = {
  fr: 'fr',
  en: 'en',
  ar: 'ar',
  de: 'de',
  es: 'es',
  id: 'id',
  it: 'it',
  ms: 'ms',
  nl: 'nl',
  pt: 'pt',
  tr: 'tr',
  ur: 'ur',
};

/** `og:locale` values, which require the underscored territory form. */
export const openGraphLocale: Record<Locale, string> = {
  fr: 'fr_FR',
  en: 'en_US',
  ar: 'ar_AR',
  de: 'de_DE',
  es: 'es_ES',
  id: 'id_ID',
  it: 'it_IT',
  ms: 'ms_MY',
  nl: 'nl_NL',
  pt: 'pt_PT',
  tr: 'tr_TR',
  ur: 'ur_PK',
};

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: 'as-needed',
  localeDetection: false,
});

/**
 * Builds a site-absolute href for a locale.
 *
 * A pure function of its arguments, so client components can prefix
 * their own links without next-intl's navigation helpers — which need
 * the locale from React context, and that context only exists under
 * `NextIntlClientProvider`. The site deliberately does not mount one:
 * every string is resolved on the server and handed over as props, so
 * no message catalogue or ICU formatter reaches the browser.
 *
 * French is the default locale and is served un-prefixed. Paths keep a
 * trailing slash to match the static files the host serves; an anchor
 * or a query string is appended after it.
 */
export function localeHref(locale: Locale, href: string): string {
  const prefix = locale === defaultLocale ? '' : `/${locale}`;

  const hashAt = href.search(/[#?]/);
  const pathPart = hashAt === -1 ? href : href.slice(0, hashAt);
  const suffix = hashAt === -1 ? '' : href.slice(hashAt);

  const clean = pathPart.replace(/^\/+|\/+$/g, '');
  const base = clean === '' ? `${prefix}/` : `${prefix}/${clean}/`;

  return `${base}${suffix}`;
}
