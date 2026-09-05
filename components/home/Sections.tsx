import { useTranslations } from 'next-intl';
import { Reveal } from '@/components/Reveal';
import { StoreBadges } from '@/components/StoreBadges';
import {
  Link,
  ButtonLink,
  Card,
  Eyebrow,
  GoldRule,
  Lede,
  Section,
  SectionTitle,
  StarOrnament,
  Stat,
} from '@/components/ui/primitives';
import { siteConfig } from '@/config/site.config';

/* ------------------------------------------------------------------ */

/** The one-paragraph statement of what the game is. */
export function Pitch() {
  const t = useTranslations('home.pitch');

  return (
    <Section tone="raised" className="py-16 sm:py-20">
      <div className="container-page">
        <Reveal className="mx-auto max-w-3xl text-center">
          <StarOrnament className="mx-auto mb-6 h-5 w-5" />
          <SectionTitle className="text-[clamp(1.5rem,3.6vw,2.35rem)]">
            {t('title')}
          </SectionTitle>
          <p className="mt-6 text-lg leading-relaxed text-text-secondary">
            {t('body')}
          </p>
          <p className="mt-6 font-display text-xl text-gold">
            {t('highlight')}
          </p>
        </Reveal>
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */

export function HowToPlay() {
  const t = useTranslations('home.howToPlay');
  const steps = t.raw('steps') as {
    number: string;
    title: string;
    body: string;
  }[];

  return (
    <Section id="how-to-play" labelledBy="how-to-play-title">
      <div className="container-page">
        <Reveal className="max-w-2xl">
          <Eyebrow>{t('eyebrow')}</Eyebrow>
          <SectionTitle id="how-to-play-title">{t('title')}</SectionTitle>
          <Lede>{t('lede')}</Lede>
        </Reveal>

        <ol className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <Reveal as="li" key={step.number} delay={index * 70}>
              <Card className="h-full" interactive>
                <span
                  aria-hidden
                  className="font-display text-5xl leading-none text-gold/35"
                >
                  {step.number}
                </span>
                <h3 className="mt-5 font-display text-xl text-text-primary">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                  {step.body}
                </p>
              </Card>
            </Reveal>
          ))}
        </ol>

        <Reveal className="mt-12">
          <ButtonLink href="/how-to-play" variant="secondary">
            {t('cta')}
          </ButtonLink>
        </Reveal>
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */

/**
 * The board. The plate is the product's single most recognisable
 * object, so it is shown large and whole rather than cropped into a
 * device frame that would imply a screenshot.
 */
export function Gameplay() {
  const t = useTranslations('home.gameplay');
  const features = t.raw('features') as { title: string; body: string }[];

  return (
    <Section id="game" tone="raised" labelledBy="gameplay-title">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-64 glow-warm"
      />
      <div className="container-page relative">
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_1fr]">
          <Reveal>
            <Eyebrow>{t('eyebrow')}</Eyebrow>
            <SectionTitle id="gameplay-title">{t('title')}</SectionTitle>
            <Lede>{t('lede')}</Lede>
            <ButtonLink href="/game" variant="secondary" className="mt-8">
              {t('cta')}
            </ButtonLink>
          </Reveal>

          <Reveal delay={90}>
            <figure className="relative">
              <div
                aria-hidden
                className="absolute inset-0 rounded-[2rem] bg-[radial-gradient(68%_68%_at_50%_45%,rgba(200,155,69,0.26),transparent_72%)] blur-2xl"
              />
              <picture>
                <source
                  type="image/avif"
                  srcSet="/assets/board-in-play-sm.avif 800w, /assets/board-in-play.avif 1600w"
                  sizes="(min-width: 1024px) 46vw, 92vw"
                />
                <source
                  type="image/webp"
                  srcSet="/assets/board-in-play-sm.webp 800w, /assets/board-in-play.webp 1600w"
                  sizes="(min-width: 1024px) 46vw, 92vw"
                />
                <img
                  src="/assets/board-in-play-sm.webp"
                  alt={t('boardAlt')}
                  width={1600}
                  height={1600}
                  loading="lazy"
                  decoding="async"
                  className="relative rounded-2xl border border-gold/25 shadow-[0_40px_80px_-40px_rgba(0,0,0,0.95)]"
                />
              </picture>
            </figure>
          </Reveal>
        </div>

        <ul className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <Reveal as="li" key={feature.title} delay={(index % 3) * 70}>
              <Card className="h-full" interactive>
                <StarOrnament className="mb-4" />
                <h3 className="font-display text-lg text-text-primary">
                  {feature.title}
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-text-secondary">
                  {feature.body}
                </p>
              </Card>
            </Reveal>
          ))}
        </ul>
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */

export function Universe() {
  const t = useTranslations('home.universe');
  const cards = t.raw('cards') as { title: string; body: string }[];

  return (
    <Section id="universe" labelledBy="universe-title">
      <div className="container-page">
        {/* Text and the oasis side by side. The oasis painting is 622px
            wide in the app — its native size on a phone's results
            screen — so it is shown at that size in a column rather than
            stretched across the page and blurred. */}
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <Reveal>
            <Eyebrow>{t('eyebrow')}</Eyebrow>
            <SectionTitle id="universe-title">{t('title')}</SectionTitle>
            <Lede>{t('lede')}</Lede>
            <p className="mt-6 max-w-prose text-base leading-relaxed text-text-secondary">
              {t('body')}
            </p>
            <div className="mt-8 max-w-prose rounded-2xl border border-gold/20 bg-surface-raised/50 p-6">
              <h3 className="font-display text-lg text-gold">
                {t('respect.title')}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                {t('respect.body')}
              </p>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <figure className="relative mx-auto max-w-[622px]">
              <div
                aria-hidden
                className="absolute inset-0 rounded-[2rem] bg-[radial-gradient(60%_60%_at_50%_50%,rgba(200,155,69,0.22),transparent_72%)] blur-2xl"
              />
              <picture>
                <source
                  type="image/avif"
                  srcSet="/assets/world-oasis-arrival.avif"
                />
                <img
                  src="/assets/world-oasis-arrival.webp"
                  alt={t('oasisAlt')}
                  width={622}
                  height={530}
                  loading="lazy"
                  decoding="async"
                  className="relative w-full rounded-2xl border border-gold/25 shadow-[0_40px_80px_-40px_rgba(0,0,0,0.95)]"
                />
              </picture>
            </figure>
          </Reveal>
        </div>

        <ul className="mt-14 grid gap-5 md:grid-cols-3">
          {cards.map((card, index) => (
            <Reveal as="li" key={card.title} delay={index * 70}>
              <Card interactive className="h-full">
                <h3 className="font-display text-lg text-text-primary">
                  {card.title}
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-text-secondary">
                  {card.body}
                </p>
              </Card>
            </Reveal>
          ))}
        </ul>

        {/* The course, 1296px native: wide enough for the page measure. */}
        <Reveal className="mt-12" delay={60}>
          <figure className="overflow-hidden rounded-2xl border border-gold/15">
            <picture>
              <source type="image/avif" srcSet="/assets/world-course.avif" />
              <img
                src="/assets/world-course.webp"
                alt={t('courseAlt')}
                width={1296}
                height={706}
                loading="lazy"
                decoding="async"
                className="w-full"
              />
            </picture>
          </figure>
        </Reveal>
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */

export function Questions() {
  const t = useTranslations('home.questions');
  const stats = t.raw('stats') as { value: string; label: string }[];
  const categories = t.raw('categories') as { name: string; count: string }[];

  return (
    <Section tone="inset" labelledBy="questions-title">
      <div className="container-page">
        <div className="grid gap-14 lg:grid-cols-[1fr_0.85fr]">
          <Reveal>
            <Eyebrow>{t('eyebrow')}</Eyebrow>
            <SectionTitle id="questions-title">{t('title')}</SectionTitle>
            <Lede>{t('lede')}</Lede>
            <p className="mt-6 text-base leading-relaxed text-text-secondary">
              {t('body')}
            </p>
            <p className="mt-5 border-s-2 border-gold/40 ps-4 text-sm leading-relaxed text-text-muted">
              {t('note')}
            </p>
          </Reveal>

          <Reveal delay={80}>
            <Card className="p-7">
              <div className="grid grid-cols-2 gap-6">
                {stats.map((stat) => (
                  <Stat key={stat.label} value={stat.value} label={stat.label} />
                ))}
              </div>

              <GoldRule className="my-7" />

              <ul className="space-y-3">
                {categories.map((category) => (
                  <li
                    key={category.name}
                    className="flex items-baseline justify-between gap-4 text-sm"
                  >
                    <span className="text-text-primary">{category.name}</span>
                    <span className="text-text-muted">{category.count}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */

export function Family() {
  const t = useTranslations('home.family');
  const points = t.raw('points') as { title: string; body: string }[];
  const stables = t.raw('stables') as {
    key: 'emerald' | 'saphir' | 'grenat' | 'safran';
    name: string;
    symbol: string;
    coat: string;
  }[];

  return (
    <Section labelledBy="family-title">
      <div className="container-page">
        <Reveal className="max-w-2xl">
          <Eyebrow>{t('eyebrow')}</Eyebrow>
          <SectionTitle id="family-title">{t('title')}</SectionTitle>
          <Lede>{t('lede')}</Lede>
        </Reveal>

        <ul className="mt-14 grid gap-6 md:grid-cols-3">
          {points.map((point, index) => (
            <Reveal as="li" key={point.title} delay={index * 70}>
              <Card className="h-full" interactive>
                <h3 className="font-display text-lg text-text-primary">
                  {point.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                  {point.body}
                </p>
              </Card>
            </Reveal>
          ))}
        </ul>

        {/* The four stables. In the app a player is never identified by
            colour alone — every team is a colour AND a symbol AND a coat.
            The cards say all three, with the actual piece on top. */}
        <Reveal className="mt-20">
          <h3 className="font-display text-xl text-text-primary sm:text-2xl">
            {t('stablesTitle')}
          </h3>
          <p className="mt-3 max-w-2xl text-base text-text-secondary">
            {t('stablesLede')}
          </p>
        </Reveal>
        <ul className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
          {stables.map((stable, index) => (
            <Reveal as="li" key={stable.key} delay={index * 60}>
              <StableCard
                team={stable.key}
                name={stable.name}
                symbol={stable.symbol}
                coat={stable.coat}
              />
            </Reveal>
          ))}
        </ul>

        <Reveal className="mt-16" delay={60}>
          <Card className="mx-auto max-w-3xl border-gold/25 p-8 text-center">
            <h3 className="font-display text-2xl text-text-primary">
              {t('privacy.title')}
            </h3>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-text-secondary">
              {t('privacy.body')}
            </p>
            <Link
              href="/privacy"
              className="mt-6 inline-flex min-h-11 items-center text-sm text-gold underline underline-offset-4 transition-colors hover:text-gold-bright"
            >
              {t('privacy.link')}
            </Link>
          </Card>
        </Reveal>
      </div>
    </Section>
  );
}

const STABLE_COLOUR = {
  emerald: 'var(--color-team-emeraude)',
  saphir: 'var(--color-team-saphir)',
  grenat: 'var(--color-team-grenat)',
  safran: 'var(--color-team-safran)',
} as const;

/** The team symbol, drawn: star, compass, lantern, book. */
function StableSymbol({ team }: { team: keyof typeof STABLE_COLOUR }) {
  const common = {
    viewBox: '0 0 24 24',
    className: 'h-5 w-5',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.6,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
    focusable: 'false' as const,
  };
  switch (team) {
    case 'emerald':
      return (
        <svg {...common}>
          <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" />
        </svg>
      );
    case 'saphir':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M15.5 8.5l-2 5-5 2 2-5z" />
        </svg>
      );
    case 'grenat':
      return (
        <svg {...common}>
          <path d="M9 4h6M8 7h8l1.5 9a3 3 0 0 1-3 3.5h-5A3 3 0 0 1 6.5 16zM12 10v5" />
        </svg>
      );
    case 'safran':
      return (
        <svg {...common}>
          <path d="M12 6c-2-1.6-5-2-9-1.5v13c4-.5 7-.1 9 1.5 2-1.6 5-2 9-1.5v-13C17 4 14 4.4 12 6zM12 6v13" />
        </svg>
      );
  }
}

function StableCard({
  team,
  name,
  symbol,
  coat,
}: {
  team: keyof typeof STABLE_COLOUR;
  name: string;
  symbol: string;
  coat: string;
}) {
  return (
    <div
      className="relative flex h-full flex-col items-center overflow-hidden rounded-2xl border border-gold/15 bg-surface-raised/60 p-5 text-center"
      style={{ borderTopColor: STABLE_COLOUR[team], borderTopWidth: 3 }}
    >
      <img
        src={`/assets/token-${team}.webp`}
        alt=""
        aria-hidden
        width={160}
        height={222}
        loading="lazy"
        decoding="async"
        className="h-24 w-auto drop-shadow-[0_10px_18px_rgba(0,0,0,0.5)]"
      />
      <h4 className="mt-4 font-display text-lg text-text-primary">{name}</h4>
      <p
        className="mt-2 inline-flex items-center gap-1.5 text-xs text-text-secondary"
        style={{ color: STABLE_COLOUR[team] }}
      >
        <StableSymbol team={team} />
        <span className="text-text-secondary">{symbol}</span>
      </p>
      <p className="mt-1 text-xs text-text-muted">{coat}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */

export function ComingSoon() {
  const t = useTranslations('home.comingSoon');

  return (
    <Section tone="raised" className="overflow-hidden" labelledBy="soon-title">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-25"
        style={{
          backgroundImage: 'url(/assets/world-backdrop-band.webp)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(180deg,var(--color-surface)_0%,rgba(8,40,31,0.82)_50%,var(--color-surface)_100%)]"
      />

      <div className="container-page relative">
        <Reveal className="mx-auto max-w-2xl text-center">
          <StarOrnament className="mx-auto mb-6 h-6 w-6" />
          <SectionTitle
            id="soon-title"
            className="text-[clamp(2rem,5.5vw,3.25rem)]"
          >
            {t('title')}
          </SectionTitle>
          <p className="mt-5 font-display text-xl text-sand">
            {t('subtitle')}
          </p>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-text-secondary">
            {t('body')}
          </p>

          <StoreBadges className="mt-9 justify-center" />

          <p className="mt-12 text-sm text-text-muted">
            {t('contactPrompt')}{' '}
            <Link
              href="/contact"
              className="text-gold underline underline-offset-4 transition-colors hover:text-gold-bright"
            >
              {t('contactLink')}
            </Link>
          </p>
        </Reveal>
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */

/** Small trust strip closing the page. */
export function BrandStrip() {
  return (
    <div className="bg-surface-base py-8">
      <div className="container-page flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-center text-xs uppercase tracking-[0.2em] text-text-muted">
        <span>{siteConfig.domain}</span>
        <span aria-hidden className="text-gold/40">
          ✦
        </span>
        <span>
          {siteConfig.brandName}
          {siteConfig.trademarkMark}
        </span>
      </div>
    </div>
  );
}
