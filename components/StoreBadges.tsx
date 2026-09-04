import { useTranslations } from 'next-intl';
import { stores } from '@/config/site.config';
import { cx } from '@/components/ui/primitives';

/**
 * App Store and Google Play badges.
 *
 * Until a store listing exists, the badge is rendered as a
 * non-interactive element carrying a visible "coming soon" line — never
 * as a link to nowhere and never as a fake download. The moment
 * `NEXT_PUBLIC_APP_AVAILABLE_*` and the matching URL are set, the same
 * badge becomes a real anchor. No markup elsewhere has to change.
 *
 * The marks are drawn rather than embedded as Apple's and Google's
 * official badge images: those artworks are distributed under brand
 * guidelines that only permit their use to link to a live listing, so
 * showing them before launch would breach the very terms they come
 * with. Both wordmarks remain attributed in the footer.
 */

function AppleGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-7 w-7 shrink-0"
      aria-hidden
      focusable="false"
    >
      <path
        fill="currentColor"
        d="M16.36 12.78c-.02-2.3 1.88-3.4 1.96-3.46-1.07-1.56-2.73-1.78-3.32-1.8-1.41-.14-2.76.83-3.48.83-.72 0-1.83-.81-3.01-.79-1.55.02-2.98.9-3.78 2.29-1.61 2.8-.41 6.94 1.16 9.21.77 1.11 1.69 2.35 2.89 2.31 1.16-.05 1.6-.75 3-.75 1.4 0 1.79.75 3.01.72 1.24-.02 2.03-1.13 2.79-2.24.88-1.28 1.24-2.53 1.26-2.6-.03-.01-2.42-.93-2.44-3.69M14.1 5.8c.64-.78 1.07-1.85.95-2.93-.92.04-2.03.61-2.69 1.38-.59.68-1.11 1.78-.97 2.83 1.02.08 2.07-.52 2.71-1.28"
      />
    </svg>
  );
}

function GooglePlayGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-6 w-6 shrink-0"
      aria-hidden
      focusable="false"
    >
      <path
        fill="currentColor"
        d="M3.6 1.84a1 1 0 0 0-.35.76v18.8a1 1 0 0 0 .35.76l.1.05 10.53-10.5v-.25L3.7 1.79zM17.9 8.7l-3.24-1.86-2.43 2.43 2.43 2.43L17.94 9.8a.86.86 0 0 0 0-1.5zM4.63 21.7l9.03-9.03 2.43 2.43-10.4 5.97a1 1 0 0 1-1.06-.02zM13.66 11.33 4.63 2.3a1 1 0 0 1 1.06-.02l10.4 5.97z"
      />
    </svg>
  );
}

interface BadgeProps {
  glyph: React.ReactNode;
  /** Small line above the wordmark, e.g. "Bientôt disponible". */
  kicker: string;
  wordmark: string;
  href?: string;
  available: boolean;
  unavailableHint: string;
}

function Badge({
  glyph,
  kicker,
  wordmark,
  href,
  available,
  unavailableHint,
}: BadgeProps) {
  const inner = (
    <>
      <span className="text-gold">{glyph}</span>
      <span className="flex flex-col text-start leading-tight">
        <span className="text-[0.66rem] uppercase tracking-[0.16em] text-text-muted">
          {kicker}
        </span>
        <span className="font-display text-lg text-text-primary">
          {wordmark}
        </span>
      </span>
    </>
  );

  const shell =
    'inline-flex min-h-14 items-center gap-3 rounded-xl border px-5 py-2.5 transition-colors duration-200';

  if (available && href) {
    return (
      <a
        href={href}
        rel="noopener noreferrer"
        target="_blank"
        className={cx(
          shell,
          'border-gold/45 bg-surface-raised/60 hover:border-gold hover:bg-gold/10',
        )}
      >
        {inner}
      </a>
    );
  }

  return (
    <span
      className={cx(shell, 'cursor-default border-gold/20 bg-surface-raised/35')}
      // Announced to assistive technology as unavailable rather than
      // silently inert.
      role="img"
      aria-label={`${wordmark} — ${kicker}. ${unavailableHint}`}
      title={unavailableHint}
    >
      {inner}
    </span>
  );
}

export function StoreBadges({ className }: { className?: string }) {
  const t = useTranslations('common');

  return (
    <div className={cx('flex flex-wrap items-center gap-3', className)}>
      <Badge
        glyph={<AppleGlyph />}
        kicker={
          stores.ios.available ? t('downloadOnAppStore') : t('comingSoon')
        }
        wordmark={t('appStore')}
        href={stores.ios.url}
        available={stores.ios.available}
        unavailableHint={t('storeNotYetAvailable')}
      />
      <Badge
        glyph={<GooglePlayGlyph />}
        kicker={
          stores.android.available ? t('getItOnGooglePlay') : t('comingSoon')
        }
        wordmark={t('googlePlay')}
        href={stores.android.url}
        available={stores.android.available}
        unavailableHint={t('storeNotYetAvailable')}
      />
    </div>
  );
}
