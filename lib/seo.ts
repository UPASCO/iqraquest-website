import type { Metadata } from 'next';
import { siteConfig, stores } from '@/config/site.config';
import {
  defaultLocale,
  hreflangFor,
  locales,
  openGraphLocale,
  type Locale,
} from '@/i18n/routing';

/**
 * Every route of the site, as a locale-independent path. The sitemap,
 * the language switcher and the hreflang block all read this one list,
 * so a new page is registered in exactly one place.
 *
 * `priority` and `changeFrequency` are sitemap hints only.
 */
export const routes = [
  { path: '', priority: 1.0, changeFrequency: 'monthly' },
  { path: 'game', priority: 0.9, changeFrequency: 'monthly' },
  { path: 'how-to-play', priority: 0.9, changeFrequency: 'monthly' },
  { path: 'about', priority: 0.7, changeFrequency: 'yearly' },
  { path: 'support', priority: 0.7, changeFrequency: 'monthly' },
  { path: 'contact', priority: 0.6, changeFrequency: 'yearly' },
  { path: 'privacy', priority: 0.4, changeFrequency: 'yearly' },
  { path: 'terms', priority: 0.4, changeFrequency: 'yearly' },
  { path: 'intellectual-property', priority: 0.4, changeFrequency: 'yearly' },
] as const;

export type RoutePath = (typeof routes)[number]['path'];

/**
 * The social share card. Referenced by Open Graph, by the Twitter card
 * and by the VideoGame schema, so it lives in one constant — changing
 * it in two of the three places and not the third is exactly the bug
 * this prevents.
 */
export const OG_IMAGE = '/assets/og-card.jpg';

/**
 * Builds a site-absolute path for a locale.
 *
 * French is the default locale and is served un-prefixed, so the
 * canonical homepage is `https://iqraquest.org/`. Every other locale
 * carries its prefix. Paths keep a trailing slash to match the static
 * files GitHub Pages actually serves.
 */
export function pathFor(locale: Locale, path: string): string {
  const clean = path.replace(/^\/+|\/+$/g, '');
  const prefix = locale === defaultLocale ? '' : `/${locale}`;
  if (clean === '') return `${prefix}/`;
  return `${prefix}/${clean}/`;
}

export function urlFor(locale: Locale, path: string): string {
  return `${siteConfig.canonicalUrl}${pathFor(locale, path)}`;
}

/**
 * The `alternates` block: one `hreflang` per locale plus `x-default`,
 * which points at the French root because that is the URL the brand
 * advertises.
 */
export function alternatesFor(path: string): Metadata['alternates'] {
  const languages: Record<string, string> = {};
  for (const locale of locales) {
    languages[hreflangFor[locale]] = urlFor(locale, path);
  }
  languages['x-default'] = urlFor(defaultLocale, path);

  return {
    canonical: urlFor(defaultLocale, path),
    languages,
  };
}

interface PageMetaOptions {
  locale: Locale;
  path: string;
  title: string;
  description: string;
  /** Overrides the shared social card. */
  ogImage?: string;
  ogImageAlt?: string;
  /** Set on pages that should stay out of the index. */
  noIndex?: boolean;
}

/**
 * Builds a page's `Metadata`. Every page in the site goes through this
 * function, so canonical, hreflang, Open Graph, Twitter and the
 * copyright metadata can never drift apart between routes.
 */
export function buildMetadata({
  locale,
  path,
  title,
  description,
  ogImage = OG_IMAGE,
  ogImageAlt,
  noIndex = false,
}: PageMetaOptions): Metadata {
  const url = urlFor(locale, path);
  const alternates = alternatesFor(path);

  return {
    metadataBase: new URL(siteConfig.canonicalUrl),
    title,
    description,
    alternates: {
      ...alternates,
      // The canonical of a localized page is that page, not the French
      // one — `alternatesFor` supplies the shared language map.
      canonical: url,
    },
    applicationName: siteConfig.siteName,
    generator: undefined,
    referrer: 'strict-origin-when-cross-origin',
    creator: siteConfig.publisher,
    publisher: siteConfig.publisher,
    authors: [{ name: siteConfig.publisher, url: siteConfig.canonicalUrl }],
    formatDetection: { telephone: false, address: false, email: false },
    robots: noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-image-preview': 'large',
            'max-snippet': -1,
            'max-video-preview': -1,
          },
        },
    openGraph: {
      type: 'website',
      siteName: siteConfig.siteName,
      title,
      description,
      url,
      locale: openGraphLocale[locale],
      alternateLocale: locales
        .filter((l) => l !== locale)
        .map((l) => openGraphLocale[l]),
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: ogImageAlt ?? title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
    other: {
      // Machine-readable rights metadata. Search engines largely ignore
      // these, but they travel with a saved or scraped copy of the page
      // and make the provenance claim explicit.
      copyright: `© ${siteConfig.copyrightYear} ${siteConfig.publisher}. Tous droits réservés / All rights reserved.`,
      'dcterms.rightsHolder': siteConfig.publisher,
      'dcterms.rights': `© ${siteConfig.copyrightYear} ${siteConfig.publisher}`,
    },
  };
}

/** Escapes a string for safe embedding inside a JSON-LD script tag. */
function jsonLd(data: unknown): string {
  // `<` is the only character that can terminate the script element
  // early; escaping it keeps the payload inert.
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

/**
 * Organization + WebSite + VideoGame, emitted once on the homepage.
 *
 * Claims are limited to what is demonstrably true today: the game is
 * not released, so no `aggregateRating`, no `offers` with a price and
 * no `datePublished` is asserted.
 */
export function homeStructuredData(locale: Locale, description: string) {
  const org = {
    '@type': 'Organization',
    '@id': `${siteConfig.canonicalUrl}/#organization`,
    name: siteConfig.publisher,
    url: siteConfig.canonicalUrl,
    logo: {
      '@type': 'ImageObject',
      url: `${siteConfig.canonicalUrl}/assets/brand-mark-512.png`,
      width: 512,
      height: 512,
    },
    foundingDate: String(siteConfig.foundingYear),
    email: siteConfig.supportEmail,
    ...(siteConfig.socialLinks.length > 0
      ? { sameAs: siteConfig.socialLinks.map((s) => s.url) }
      : {}),
  };

  const brand = {
    '@type': 'Brand',
    '@id': `${siteConfig.canonicalUrl}/#brand`,
    name: siteConfig.brandName,
    url: siteConfig.canonicalUrl,
    logo: `${siteConfig.canonicalUrl}/assets/brand-mark-512.png`,
  };

  const website = {
    '@type': 'WebSite',
    '@id': `${siteConfig.canonicalUrl}/#website`,
    name: siteConfig.siteName,
    url: siteConfig.canonicalUrl,
    inLanguage: locales.map((l) => hreflangFor[l]),
    publisher: { '@id': `${siteConfig.canonicalUrl}/#organization` },
    copyrightYear: siteConfig.copyrightYear,
    copyrightHolder: { '@id': `${siteConfig.canonicalUrl}/#organization` },
  };

  const availability = stores.ios.available || stores.android.available;

  const game = {
    '@type': 'VideoGame',
    '@id': `${siteConfig.canonicalUrl}/#game`,
    name: siteConfig.siteName,
    url: siteConfig.canonicalUrl,
    description,
    inLanguage: locales.map((l) => hreflangFor[l]),
    image: `${siteConfig.canonicalUrl}${OG_IMAGE}`,
    applicationCategory: 'GameApplication',
    genre: ['Board game', 'Quiz', 'Family', 'Educational'],
    gamePlatform: ['iOS', 'Android'],
    playMode: ['SinglePlayer', 'CoOp'],
    numberOfPlayers: {
      '@type': 'QuantitativeValue',
      minValue: 1,
      maxValue: siteConfig.app.maxPlayers,
    },
    typicalAgeRange: siteConfig.app.ageRange,
    operatingSystem: 'iOS, Android',
    publisher: { '@id': `${siteConfig.canonicalUrl}/#organization` },
    brand: { '@id': `${siteConfig.canonicalUrl}/#brand` },
    copyrightYear: siteConfig.copyrightYear,
    copyrightHolder: { '@id': `${siteConfig.canonicalUrl}/#organization` },
    // Only asserted once a store listing actually exists.
    ...(availability
      ? {
          offers: {
            '@type': 'Offer',
            availability: 'https://schema.org/InStock',
            price: '0',
            priceCurrency: 'EUR',
            url: stores.ios.url ?? stores.android.url,
          },
        }
      : {}),
  };

  return jsonLd({
    '@context': 'https://schema.org',
    '@graph': [org, brand, website, game],
  });
}

/** Breadcrumb graph for a sub-page. */
export function breadcrumbStructuredData(
  locale: Locale,
  homeLabel: string,
  page: { label: string; path: string },
) {
  return jsonLd({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: homeLabel,
        item: urlFor(locale, ''),
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: page.label,
        item: urlFor(locale, page.path),
      },
    ],
  });
}

/** FAQ graph, used by the "how to play" and support pages. */
export function faqStructuredData(
  entries: readonly { question: string; answer: string }[],
) {
  return jsonLd({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: entries.map((entry) => ({
      '@type': 'Question',
      name: entry.question,
      acceptedAnswer: { '@type': 'Answer', text: entry.answer },
    })),
  });
}
