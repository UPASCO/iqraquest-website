import type { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site.config';

// `output: export` needs every metadata route pinned to build time.
export const dynamic = 'force-static';

/**
 * Web app manifest. The site is not an installable application — this
 * exists so that a visitor who adds it to a home screen gets the
 * brand's own icon and ground rather than a screenshot thumbnail on
 * white.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${siteConfig.siteName} — ${siteConfig.brandName}`,
    short_name: siteConfig.siteName,
    description:
      'Site officiel du jeu de plateau IqraQuest / Official website of the IqraQuest board game.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#061f18',
    theme_color: '#061f18',
    orientation: 'portrait',
    categories: ['games', 'education'],
    icons: [
      {
        src: '/assets/brand-mark-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/assets/brand-mark-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  };
}
