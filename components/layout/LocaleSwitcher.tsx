'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { cx } from '@/components/ui/primitives';
import {
  defaultLocale,
  localeHref,
  localeNames,
  locales,
  type Locale,
} from '@/i18n/routing';

export interface LocaleSwitcherLabels {
  chooseLanguage: string;
  language: string;
}

/**
 * Language menu.
 *
 * The site is statically exported and stores no locale cookie, so the
 * switcher is a plain list of anchors to the equivalent page in each
 * language — the same URLs the `hreflang` block advertises. That keeps
 * the choice bookmarkable and shareable, and means a crawler can walk
 * the whole language graph from any page.
 */
export function LocaleSwitcher({
  locale,
  labels,
}: {
  locale: Locale;
  labels: LocaleSwitcherLabels;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  /**
   * The equivalent URL of the current page in another language.
   *
   * `usePathname` here is Next's own, so it returns the real path
   * including any locale prefix. Stripping the current locale leaves the
   * route, which `localeHref` then re-prefixes for the target. Using
   * next-intl's navigation instead would need its React context, and
   * mounting that context is exactly what keeps the message catalogue
   * and the ICU formatter out of the browser.
   */
  const hrefFor = (target: Locale) => {
    let route = pathname || '/';
    if (locale !== defaultLocale && route.startsWith(`/${locale}`)) {
      route = route.slice(locale.length + 1) || '/';
    }
    return localeHref(target, route);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={labels.chooseLanguage}
        className="inline-flex h-11 items-center gap-1.5 rounded-lg border border-gold/25 px-3 text-sm text-text-secondary transition-colors hover:border-gold/50 hover:text-text-primary"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4"
          aria-hidden
          focusable="false"
        >
          <path
            d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zm0 0c2.5 2.3 3.8 5.4 3.8 9s-1.3 6.7-3.8 9c-2.5-2.3-3.8-5.4-3.8-9S9.5 5.3 12 3zM3.5 9h17M3.5 15h17"
            stroke="currentColor"
            strokeWidth="1.4"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
        <span className="uppercase">{locale}</span>
      </button>

      {open && (
        <div
          className="absolute end-0 top-[calc(100%+0.5rem)] z-50 max-h-[70vh] w-56 overflow-y-auto overscroll-contain rounded-xl border border-gold/20 bg-surface-raised/98 p-1.5 shadow-2xl backdrop-blur-lg"
          role="menu"
          aria-label={labels.language}
        >
          {locales.map((candidate) => {
            const active = candidate === locale;
            return (
              <a
                key={candidate}
                href={hrefFor(candidate)}
                role="menuitem"
                lang={candidate}
                aria-current={active ? 'true' : undefined}
                className={cx(
                  'flex min-h-11 items-center justify-between gap-3 rounded-lg px-3 text-sm transition-colors',
                  active
                    ? 'bg-gold/12 text-gold'
                    : 'text-text-secondary hover:bg-gold/8 hover:text-text-primary',
                )}
              >
                <span>{localeNames[candidate]}</span>
                <span className="text-[0.65rem] uppercase tracking-widest text-text-muted">
                  {candidate}
                </span>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
