import { useTranslations } from 'next-intl';
import { ButtonLink, Stat } from '@/components/ui/primitives';
import { StoreBadges } from '@/components/StoreBadges';
import { siteConfig } from '@/config/site.config';

/**
 * The first screen.
 *
 * The backdrop is the game's own key art, art-directed across two
 * breakpoints: the portrait home-screen painting on a phone, where its
 * 1242x2688 composition fits the viewport exactly, and the square icon
 * artwork on a wide screen, where a portrait crop would show only a
 * mane. A `<picture>` does that switch; `next/image` cannot, and the
 * artwork is already encoded at the exact sizes needed.
 */
export function Hero() {
  const t = useTranslations('home.hero');
  const { app } = siteConfig;

  return (
    <section className="relative isolate flex min-h-[max(38rem,88svh)] items-center overflow-hidden">
      {/* Key art */}
      <picture className="absolute inset-0 -z-20">
        <source
          media="(min-width: 768px)"
          type="image/avif"
          srcSet="/assets/brand-key-art.avif"
        />
        <source
          media="(min-width: 768px)"
          type="image/webp"
          srcSet="/assets/brand-key-art.webp"
        />
        <source type="image/avif" srcSet="/assets/hero-key-art.avif" />
        <source type="image/webp" srcSet="/assets/hero-key-art.webp" />
        <img
          src="/assets/hero-key-art.webp"
          alt={t('artAlt')}
          width={1242}
          height={2688}
          fetchPriority="high"
          decoding="async"
          className="h-full w-full object-cover object-[center_22%] md:object-[center_32%]"
        />
      </picture>

      {/* Scrim. Ivory type over a lit mane needs a ground; the app's own
          home screen takes a top scrim for exactly this reason. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(6,31,24,0.86)_0%,rgba(6,31,24,0.62)_26%,rgba(6,31,24,0.9)_58%,rgba(6,31,24,0.97)_80%,var(--color-surface-base)_100%)] md:bg-[linear-gradient(180deg,rgba(6,31,24,0.82)_0%,rgba(6,31,24,0.58)_38%,rgba(6,31,24,0.88)_80%,var(--color-surface-base)_100%)]"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 hidden md:block md:bg-[linear-gradient(90deg,rgba(6,31,24,0.88)_0%,rgba(6,31,24,0.62)_38%,transparent_72%)]"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 motif-lattice opacity-40"
      />

      <div className="container-page relative w-full py-24 sm:py-28">
        <div className="max-w-2xl">
          <p className="font-sans text-xs font-semibold uppercase tracking-[0.28em] text-gold">
            {t('eyebrow')}
          </p>

          <h1 className="mt-5">
            <span className="block font-display text-[clamp(2.75rem,11vw,6rem)] uppercase leading-[0.95] tracking-[0.04em] text-ivory drop-shadow-[0_2px_24px_rgba(0,0,0,0.55)]">
              {t('title')}
            </span>
            <span className="mt-5 block font-display text-[clamp(1.25rem,3.4vw,2rem)] leading-snug text-sand">
              {t('baseline')}
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-text-secondary">
            {t('lede')}
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <ButtonLink href="/game">{t('ctaPrimary')}</ButtonLink>
            <ButtonLink href="/how-to-play" variant="secondary">
              {t('ctaSecondary')}
            </ButtonLink>
          </div>

          <p className="mt-10 text-sm font-medium text-gold">
            {t('availability')}
          </p>
          <StoreBadges className="mt-4" />

          <div className="mt-12 grid max-w-lg grid-cols-2 gap-x-6 gap-y-6 border-t border-gold/15 pt-8 sm:grid-cols-4">
            <Stat value={String(app.questionCount)} label={t('stats.questions')} />
            <Stat value={String(app.languageCount)} label={t('stats.languages')} />
            <Stat
              value={`2–${app.maxPlayers}`}
              label={t('stats.players')}
            />
            <Stat value={app.ageRange} label={t('stats.ages')} />
          </div>
        </div>
      </div>
    </section>
  );
}
