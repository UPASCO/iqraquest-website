import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react';
import { Link } from '@/i18n/navigation';

/** Joins class names, dropping falsy entries. */
export function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(' ');
}

/* -------------------------------------------------------------------------
 * Section — the page's rhythm.
 * Every band of the site is a Section, so vertical spacing is decided
 * once rather than per page.
 * ---------------------------------------------------------------------- */

type SectionTone = 'base' | 'raised' | 'inset';

const sectionTone: Record<SectionTone, string> = {
  base: 'bg-surface-base',
  raised: 'bg-surface',
  inset: 'bg-surface-inset',
};

export function Section({
  children,
  id,
  tone = 'base',
  className,
  as: Tag = 'section',
  labelledBy,
}: {
  children: ReactNode;
  id?: string;
  tone?: SectionTone;
  className?: string;
  as?: ElementType;
  labelledBy?: string;
}) {
  return (
    <Tag
      id={id}
      aria-labelledby={labelledBy}
      className={cx(
        'relative py-20 sm:py-24 lg:py-32',
        sectionTone[tone],
        className,
      )}
    >
      {children}
    </Tag>
  );
}

/* -------------------------------------------------------------------------
 * Type primitives
 * ---------------------------------------------------------------------- */

export function Eyebrow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cx(
        'mb-4 font-sans text-xs font-semibold uppercase tracking-[0.22em] text-gold',
        className,
      )}
    >
      {children}
    </p>
  );
}

export function SectionTitle({
  children,
  id,
  className,
  as: Tag = 'h2',
}: {
  children: ReactNode;
  id?: string;
  className?: string;
  as?: 'h1' | 'h2' | 'h3';
}) {
  return (
    <Tag
      id={id}
      className={cx(
        'font-display text-[clamp(1.75rem,4.5vw,3rem)] text-text-primary',
        className,
      )}
    >
      {children}
    </Tag>
  );
}

export function Lede({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cx(
        'mt-5 max-w-prose text-lg leading-relaxed text-text-secondary',
        className,
      )}
    >
      {children}
    </p>
  );
}

export function Prose({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cx(
        'space-y-5 text-base leading-relaxed text-text-secondary [&_a]:text-gold [&_a]:underline [&_a]:underline-offset-4 [&_a:hover]:text-gold-bright [&_strong]:text-text-primary [&_strong]:font-semibold',
        className,
      )}
    >
      {children}
    </div>
  );
}

/* -------------------------------------------------------------------------
 * Buttons
 *
 * One component, three weights. Minimum height 48px throughout, which
 * is the app's own touch-target rule.
 * ---------------------------------------------------------------------- */

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

const buttonBase =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-6 py-3 text-center font-sans text-sm font-semibold tracking-wide transition-[transform,background-color,border-color,color,box-shadow] duration-200 ease-[var(--ease-out-soft)] disabled:cursor-not-allowed disabled:opacity-45 motion-safe:active:translate-y-px';

const buttonVariant: Record<ButtonVariant, string> = {
  primary:
    'bg-gold text-[#20160a] shadow-[0_10px_30px_-12px_rgba(200,155,69,0.75)] hover:bg-gold-bright hover:shadow-[0_14px_36px_-12px_rgba(226,186,99,0.8)]',
  secondary:
    'border border-gold/45 bg-transparent text-text-primary hover:border-gold hover:bg-gold/10',
  ghost: 'text-text-secondary hover:text-text-primary',
};

export function ButtonLink({
  href,
  variant = 'primary',
  className,
  children,
  external = false,
  ...rest
}: {
  href: string;
  variant?: ButtonVariant;
  className?: string;
  children: ReactNode;
  external?: boolean;
} & Omit<ComponentPropsWithoutRef<'a'>, 'href' | 'className' | 'children'>) {
  const classes = cx(buttonBase, buttonVariant[variant], className);

  if (external) {
    return (
      <a
        href={href}
        className={classes}
        rel="noopener noreferrer"
        target="_blank"
        {...rest}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes} {...rest}>
      {children}
    </Link>
  );
}

export function Button({
  variant = 'primary',
  className,
  children,
  ...rest
}: {
  variant?: ButtonVariant;
  className?: string;
  children: ReactNode;
} & ComponentPropsWithoutRef<'button'>) {
  return (
    <button
      className={cx(buttonBase, buttonVariant[variant], className)}
      {...rest}
    >
      {children}
    </button>
  );
}

/* -------------------------------------------------------------------------
 * Card — the site's one container.
 * A flat surface with a hairline gold edge, lifting very slightly on
 * hover. No Material-style tinted elevation, matching the app.
 * ---------------------------------------------------------------------- */

export function Card({
  children,
  className,
  interactive = false,
}: {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
}) {
  return (
    <div
      className={cx(
        'relative overflow-hidden rounded-2xl border border-gold/15 bg-surface-raised/70 p-6 shadow-[0_1px_0_0_rgba(200,155,69,0.08)_inset,0_20px_40px_-32px_rgba(0,0,0,0.9)]',
        interactive &&
          'transition-[transform,border-color] duration-300 ease-[var(--ease-out-soft)] motion-safe:hover:-translate-y-1 hover:border-gold/35',
        className,
      )}
    >
      {children}
    </div>
  );
}

/* -------------------------------------------------------------------------
 * Ornaments
 * ---------------------------------------------------------------------- */

/** The plate's double gold rule, used to close a band. */
export function GoldRule({ className }: { className?: string }) {
  return <hr className={cx('rule-gold my-0 border-0', className)} aria-hidden />;
}

/**
 * The eight-point star (khātim) that rides the corners of the board
 * plate. Used sparingly as a section marker.
 */
export function StarOrnament({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cx('h-4 w-4 text-gold', className)}
      aria-hidden
      focusable="false"
    >
      <path
        fill="currentColor"
        d="M12 0.8l2.6 6.1 6.1-2.6-2.6 6.1 6.1 2.6-6.1 2.6 2.6 6.1-6.1-2.6L12 23.2l-2.6-6.1-6.1 2.6 2.6-6.1L0.8 11l6.1-2.6-2.6-6.1 6.1 2.6z"
      />
    </svg>
  );
}

/** A statistic, shown as a number over its label. */
export function Stat({
  value,
  label,
  className,
}: {
  value: string;
  label: string;
  className?: string;
}) {
  return (
    <div className={cx('text-center sm:text-start', className)}>
      {/*
        Numbers and numeric ranges are left-to-right units. Without an
        isolate, the bidi algorithm reorders "7-99" to "99-7" inside an
        Arabic or Urdu paragraph, because the dash is a neutral
        character taking the surrounding direction.
      */}
      <div
        dir="ltr"
        className="font-display text-3xl leading-none text-gold sm:text-4xl rtl:text-end"
      >
        {value}
      </div>
      <div className="mt-2 text-sm leading-snug text-text-muted">{label}</div>
    </div>
  );
}
