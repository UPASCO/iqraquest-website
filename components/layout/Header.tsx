'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { cx } from '@/components/ui/primitives';
import { LocaleSwitcher } from './LocaleSwitcher';
import type { Locale } from '@/i18n/routing';

const navItems = [
  { href: '/game', key: 'game' },
  { href: '/how-to-play', key: 'howToPlay' },
  { href: '/#universe', key: 'universe' },
  { href: '/support', key: 'support' },
] as const;

export function Header({ locale }: { locale: Locale }) {
  const t = useTranslations();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // The bar only gains its ground and border once the page has moved,
  // so the hero starts edge to edge.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Tapping a link in the sheet navigates and closes it. Doing this on
  // the click rather than in an effect watching the pathname keeps the
  // state change out of render.
  const closeMenu = () => setMenuOpen(false);

  // While the sheet is open the page behind it must not scroll, and
  // Escape must close it — both are expected of a modal surface.
  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  return (
    <header
      className={cx(
        'fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-300',
        scrolled || menuOpen
          ? 'border-b border-gold/15 bg-surface-base/88 backdrop-blur-lg'
          : 'border-b border-transparent bg-transparent',
      )}
    >
      <div className="container-page flex h-[var(--header-h)] items-center justify-between gap-4">
        <Link
          href="/"
          className="group flex items-center gap-3"
          aria-label={t('common.backHome')}
        >
          <Image
            src="/assets/brand-mark-192.webp"
            alt=""
            width={36}
            height={36}
            priority
            className="rounded-lg ring-1 ring-gold/30"
          />
          <span className="flex flex-col leading-none">
            <span className="font-display text-lg tracking-wide text-text-primary">
              IqraQuest
            </span>
            <span className="mt-0.5 hidden text-[0.6rem] uppercase tracking-[0.2em] text-text-muted sm:block">
              {t('common.brandBaseline')}
            </span>
          </span>
        </Link>

        <nav
          className="hidden items-center gap-1 lg:flex"
          aria-label={t('common.menu')}
        >
          {navItems.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm text-text-secondary transition-colors hover:text-text-primary"
            >
              {t(`nav.${item.key}`)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LocaleSwitcher locale={locale} />

          <span className="hidden rounded-full border border-gold/35 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-gold sm:inline-block">
            {t('common.comingSoon')}
          </span>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? t('common.closeMenu') : t('common.openMenu')}
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-gold/25 text-text-primary transition-colors hover:border-gold/50 lg:hidden"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              aria-hidden
              focusable="false"
            >
              {menuOpen ? (
                <path
                  d="M6 6l12 12M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              ) : (
                <path
                  d="M4 7h16M4 12h16M4 17h16"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile sheet. Rendered only when open so its links stay out of
          the tab order the rest of the time. */}
      {menuOpen && (
        <div
          id="mobile-nav"
          className="border-t border-gold/10 bg-surface-base/97 backdrop-blur-lg lg:hidden"
        >
          <nav
            className="container-page flex flex-col py-4"
            aria-label={t('common.menu')}
          >
            {navItems.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                onClick={closeMenu}
                className="flex min-h-12 items-center border-b border-gold/8 text-base text-text-secondary transition-colors hover:text-text-primary"
              >
                {t(`nav.${item.key}`)}
              </Link>
            ))}
            <Link
              href="/contact"
              onClick={closeMenu}
              className="flex min-h-12 items-center text-base text-text-secondary transition-colors hover:text-text-primary"
            >
              {t('nav.contact')}
            </Link>
            <span className="mt-4 inline-flex w-fit rounded-full border border-gold/35 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-gold">
              {t('common.comingSoon')}
            </span>
          </nav>
        </div>
      )}
    </header>
  );
}
