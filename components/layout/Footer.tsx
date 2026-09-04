import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { siteConfig } from '@/config/site.config';
import { GoldRule } from '@/components/ui/primitives';

const columns = [
  {
    titleKey: 'sectionGame',
    links: [
      { href: '/game', key: 'game' },
      { href: '/how-to-play', key: 'howToPlay' },
      { href: '/about', key: 'about' },
    ],
  },
  {
    titleKey: 'sectionSupport',
    links: [
      { href: '/support', key: 'support' },
      { href: '/contact', key: 'contact' },
    ],
  },
  {
    titleKey: 'sectionLegal',
    links: [
      { href: '/privacy', key: 'privacy' },
      { href: '/terms', key: 'terms' },
      { href: '/intellectual-property', key: 'intellectualProperty' },
    ],
  },
] as const;

export function Footer() {
  const t = useTranslations();

  return (
    <footer className="relative bg-surface-inset">
      <GoldRule />
      <div className="container-page py-16">
        <div className="grid gap-12 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <div className="flex items-center gap-3">
              <Image
                src="/assets/brand-mark-192.webp"
                alt=""
                width={40}
                height={40}
                className="rounded-lg ring-1 ring-gold/25"
              />
              <div>
                <div className="font-display text-xl text-text-primary">
                  {siteConfig.siteName}
                </div>
                <div className="text-sm text-text-muted">
                  {t('footer.tagline')}
                </div>
              </div>
            </div>

            {siteConfig.socialLinks.length > 0 && (
              <nav
                className="mt-6 flex gap-2"
                aria-label={t('footer.socialTitle')}
              >
                {siteConfig.socialLinks.map((social) => (
                  <a
                    key={social.id}
                    href={social.url}
                    rel="noopener noreferrer me"
                    target="_blank"
                    className="inline-flex h-11 min-w-11 items-center justify-center rounded-lg border border-gold/20 px-3 text-xs text-text-secondary transition-colors hover:border-gold/50 hover:text-text-primary"
                  >
                    {social.label}
                  </a>
                ))}
              </nav>
            )}

            <a
              href={`mailto:${siteConfig.supportEmail}`}
              className="mt-6 inline-block text-sm text-text-secondary underline decoration-gold/40 underline-offset-4 transition-colors hover:text-gold"
            >
              {siteConfig.supportEmail}
            </a>
          </div>

          {columns.map((column) => (
            <nav key={column.titleKey} aria-label={t(`footer.${column.titleKey}`)}>
              <h2 className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-gold">
                {t(`footer.${column.titleKey}`)}
              </h2>
              <ul className="mt-4 space-y-1">
                {column.links.map((link) => (
                  <li key={link.key}>
                    <Link
                      href={link.href}
                      className="inline-flex min-h-10 items-center text-sm text-text-secondary transition-colors hover:text-text-primary"
                    >
                      {t(`nav.${link.key}`)}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-14 border-t border-gold/10 pt-8">
          <div className="flex flex-col gap-3 text-sm text-text-muted sm:flex-row sm:items-center sm:justify-between">
            <p>
              {t('footer.copyright', { year: siteConfig.copyrightYear })}
            </p>
            <a
              href={siteConfig.canonicalUrl}
              className="tracking-[0.16em] text-text-muted uppercase transition-colors hover:text-gold"
            >
              {siteConfig.domain}
            </a>
          </div>
          <p className="mt-4 max-w-3xl text-xs leading-relaxed text-text-muted/85">
            {t('footer.trademarkNote', { mark: siteConfig.trademarkMark })}{' '}
            {t('footer.storeNote')}
          </p>
        </div>
      </div>
    </footer>
  );
}
