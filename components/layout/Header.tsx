'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cx } from '@/components/ui/primitives';
import { LocaleSwitcher, type LocaleSwitcherLabels } from './LocaleSwitcher';
import { localeHref, type Locale } from '@/i18n/routing';

/**
 * The header menu.
 *
 * Confidentialité sits here rather than only in the footer because for
 * this product it is a selling point, not fine print: the game keeps no
 * account, shows no advertising and tracks nothing, and a visitor
 * deciding whether to install it for a child should not have to hunt
 * for that.
 */
const navHrefs = [
  '/game',
  '/knowledge',
  '/how-to-play',
  '/#universe',
  '/support',
  '/privacy',
] as const;

/**
 * Every string the header renders, resolved on the server.
 *
 * The header is interactive — a scroll state and a mobile sheet — so it
 * has to be a client component, but that is no reason to send the
 * message catalogue and an ICU formatter to the browser with it.
 */
export interface HeaderLabels {
  backHome: string;
  brandBaseline: string;
  menu: string;
  openMenu: string;
  closeMenu: string;
  comingSoon: string;
  /** The header's one call to action. */
  cta: string;
  contact: string;
  /** In the same order as `navHrefs`. */
  nav: readonly string[];
  localeSwitcher: LocaleSwitcherLabels;
}

export function Header({
  locale,
  labels,
}: {
  locale: Locale;
  labels: HeaderLabels;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const href = (path: string) => localeHref(locale, path);

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
          href={href("/")}
          className="group flex items-center gap-3"
          aria-label={labels.backHome}
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
              {labels.brandBaseline}
            </span>
          </span>
        </Link>

        <nav
          className="hidden items-center gap-1 xl:flex"
          aria-label={labels.menu}
        >
          {navHrefs.map((target, index) => (
            <Link
              key={target}
              href={href(target)}
              className="whitespace-nowrap rounded-lg px-3 py-2 text-sm text-text-secondary transition-colors hover:text-text-primary"
            >
              {labels.nav[index]}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LocaleSwitcher locale={locale} labels={labels.localeSwitcher} />

          {/* The most valuable slot in the header used to hold a static
              "coming soon" pill that went nowhere. A header CTA has to be
              a link. */}
          <Link
            href={href('/game')}
            className="hidden min-h-10 items-center rounded-xl bg-gold px-4 text-xs font-semibold uppercase tracking-[0.12em] text-[#20160a] shadow-[0_8px_24px_-12px_rgba(200,155,69,0.8)] transition-colors hover:bg-gold-bright sm:inline-flex"
          >
            {labels.cta}
          </Link>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? labels.closeMenu : labels.openMenu}
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-gold/25 text-text-primary transition-colors hover:border-gold/50 xl:hidden"
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
          className="border-t border-gold/10 bg-surface-base/97 backdrop-blur-lg xl:hidden"
        >
          <nav
            className="container-page flex flex-col py-4"
            aria-label={labels.menu}
          >
            {navHrefs.map((target, index) => (
              <Link
                key={target}
                href={href(target)}
                onClick={closeMenu}
                className="flex min-h-12 items-center border-b border-gold/8 text-base text-text-secondary transition-colors hover:text-text-primary"
              >
                {labels.nav[index]}
              </Link>
            ))}
            <Link
              href={href("/contact")}
              onClick={closeMenu}
              className="flex min-h-12 items-center text-base text-text-secondary transition-colors hover:text-text-primary"
            >
              {labels.contact}
            </Link>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Link
                href={href('/game')}
                onClick={closeMenu}
                className="inline-flex min-h-12 items-center rounded-xl bg-gold px-5 text-sm font-semibold text-[#20160a] hover:bg-gold-bright"
              >
                {labels.cta}
              </Link>
              <span className="text-xs uppercase tracking-[0.14em] text-text-muted">
                {labels.comingSoon}
              </span>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
