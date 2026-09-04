import type { MetadataRoute } from 'next';
import { routes, urlFor } from '@/lib/seo';
import { defaultLocale, hreflangFor, locales } from '@/i18n/routing';

// `output: export` needs every metadata route pinned to build time.
export const dynamic = 'force-static';

/**
 * Multilingual sitemap.
 *
 * Every route is listed once per locale, and each entry carries the
 * full `alternates.languages` map, which is how Google is told the
 * twelve URLs are one page in twelve languages rather than twelve
 * competing pages.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const route of routes) {
    const languages: Record<string, string> = {};
    for (const locale of locales) {
      languages[hreflangFor[locale]] = urlFor(locale, route.path);
    }
    languages['x-default'] = urlFor(defaultLocale, route.path);

    for (const locale of locales) {
      entries.push({
        url: urlFor(locale, route.path),
        changeFrequency: route.changeFrequency,
        priority: route.priority,
        alternates: { languages },
      });
    }
  }

  return entries;
}
