import type { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site.config';

// `output: export` needs every metadata route pinned to build time.
export const dynamic = 'force-static';

/**
 * The site has nothing to hide from crawlers: every page is public
 * marketing or legal text, so everything is allowed and the sitemap is
 * advertised. `host` names the canonical hostname, which helps the
 * crawlers that still honour it treat www as the duplicate.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: `${siteConfig.canonicalUrl}/sitemap.xml`,
    host: siteConfig.canonicalUrl,
  };
}
