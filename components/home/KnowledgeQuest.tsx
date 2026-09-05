import { useLocale, useTranslations } from 'next-intl';
import { Reveal } from '@/components/Reveal';
import { IqraMark } from '@/components/brand/IqraMark';
import { QuestionCard, type QuestionCardLabels } from '@/components/QuestionCard';
import {
  ButtonLink,
  Eyebrow,
  Lede,
  Section,
  SectionTitle,
  StarOrnament,
  cx,
} from '@/components/ui/primitives';
import {
  HOME_SAMPLE_IDS,
  sampleQuestions,
  type Category,
  type Difficulty,
} from '@/lib/sample-questions';
import type { Locale } from '@/i18n/routing';

/* ------------------------------------------------------------------ */
/* The name                                                            */
/* ------------------------------------------------------------------ */

/**
 * Where the name comes from.
 *
 * The single strongest idea the brand owns, and the one the site did
 * not tell: Iqra — "Read" — is the first word of sūrat al-ʿAlaq, which
 * the tradition reports as the first revealed. The word is drawn as
 * type, large, in the plate's gold; it depicts nothing.
 */
export function BrandStory() {
  const t = useTranslations('home.brand');

  return (
    <Section tone="inset" labelledBy="brand-title" className="overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 motif-lattice opacity-60"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -start-32 top-1/2 h-[36rem] w-[36rem] -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(200,155,69,0.16),transparent_62%)] blur-2xl"
      />

      <div className="container-page relative grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <Reveal className="flex flex-col items-center text-center lg:items-start lg:text-start">
          <IqraMark
            title={t('wordAlt')}
            className="w-[min(18rem,70vw)] text-gold drop-shadow-[0_18px_40px_rgba(200,155,69,0.25)]"
          />
          <p className="mt-6 font-display text-3xl text-ivory sm:text-4xl">
            {t('word')}
            <span className="mx-3 text-gold/60" aria-hidden>
              ·
            </span>
            <span className="text-sand">{t('meaning')}</span>
          </p>
        </Reveal>

        <Reveal delay={80}>
          <Eyebrow>{t('eyebrow')}</Eyebrow>
          <SectionTitle id="brand-title">{t('title')}</SectionTitle>
          <Lede>{t('lede')}</Lede>
          <p className="mt-6 max-w-prose text-base leading-relaxed text-text-secondary">
            {t('body')}
          </p>
        </Reveal>
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* The quest                                                           */
/* ------------------------------------------------------------------ */

const REALM_ORDER: Category[] = ['prophets', 'sira', 'quran', 'faith', 'virtues'];

/** Small marks for the five realms — drawn, so they cost no request. */
function RealmGlyph({ realm, className }: { realm: Category; className?: string }) {
  const common = {
    viewBox: '0 0 24 24',
    className: cx('h-6 w-6', className),
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.5,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
    focusable: 'false' as const,
  };
  switch (realm) {
    case 'prophets': // a staff and a path
      return (
        <svg {...common}>
          <path d="M8 21V6a3 3 0 1 1 6 0v2" />
          <path d="M4 21h16" />
          <path d="M14 21c2-3 4-5 6-9" />
        </svg>
      );
    case 'sira': // a caravan trail between two dunes
      return (
        <svg {...common}>
          <path d="M3 17c3-6 6-6 9 0s6 6 9 0" />
          <path d="M6 11l1.5-2 1.5 2" />
          <path d="M15 9l1.5-2 1.5 2" />
        </svg>
      );
    case 'quran': // an open book
      return (
        <svg {...common}>
          <path d="M12 6c-2-1.6-5-2-9-1.5v13c4-.5 7-.1 9 1.5 2-1.6 5-2 9-1.5v-13C17 4 14 4.4 12 6z" />
          <path d="M12 6v13" />
        </svg>
      );
    case 'faith': // a lantern
      return (
        <svg {...common}>
          <path d="M9 4h6" />
          <path d="M8 7h8l1.5 9a3 3 0 0 1-3 3.5h-5A3 3 0 0 1 6.5 16z" />
          <path d="M12 10v5" />
        </svg>
      );
    case 'virtues': // an eight-point star
      return (
        <svg {...common}>
          <path d="M12 3l1.9 4.3 4.3-1.5-1.5 4.3L21 12l-4.3 1.9 1.5 4.3-4.3-1.5L12 21l-1.9-4.3-4.3 1.5 1.5-4.3L3 12l4.3-1.9-1.5-4.3 4.3 1.5z" />
        </svg>
      );
  }
}

export function KnowledgeQuest() {
  const t = useTranslations('home.knowledge');
  const locale = useLocale() as Locale;

  const realms = t.raw('realms') as {
    key: Category;
    name: string;
    count: string;
    body: string;
  }[];
  const progression = t.raw('progression') as {
    step: string;
    title: string;
    body: string;
  }[];

  const cardLabels: QuestionCardLabels = {
    levels: {
      easy: t('levels.easy'),
      medium: t('levels.medium'),
      hard: t('levels.hard'),
    } as Record<Difficulty, string>,
    categories: Object.fromEntries(
      REALM_ORDER.map((r) => [r, t(`categories.${r}`)]),
    ) as Record<Category, string>,
    answerHint: t('card.answerHint'),
    correct: t('card.correct'),
    incorrect: t('card.incorrect'),
    neverBack: t('card.neverBack'),
    sourceLabel: t('card.sourceLabel'),
  };

  const samples = sampleQuestions(locale, HOME_SAMPLE_IDS);

  return (
    <Section id="knowledge" labelledBy="knowledge-title">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-72 glow-warm"
      />
      <div className="container-page relative">
        <Reveal className="max-w-2xl">
          <Eyebrow>{t('eyebrow')}</Eyebrow>
          <SectionTitle id="knowledge-title">{t('title')}</SectionTitle>
          <Lede>{t('lede')}</Lede>
        </Reveal>

        {/* The five realms, as a route: a gold rail with a marker per
            realm. Reads as a journey rather than a table of counts. */}
        <Reveal className="mt-14">
          <h3 className="font-display text-xl text-text-primary sm:text-2xl">
            {t('realmsTitle')}
          </h3>
          <ol className="relative mt-8 grid gap-6 md:grid-cols-5 md:gap-4">
            <span
              aria-hidden
              className="rule-gold absolute start-6 top-0 hidden h-full w-px md:start-0 md:top-6 md:block md:h-px md:w-full"
              style={{ background: 'var(--rule-gold)' }}
            />
            {realms.map((realm, index) => (
              <li key={realm.key} className="relative ps-14 md:ps-0 md:pt-14">
                <span
                  aria-hidden
                  className="absolute start-0 top-0 flex h-12 w-12 items-center justify-center rounded-full border border-gold/45 bg-surface-inset text-gold md:start-0"
                >
                  <RealmGlyph realm={realm.key} />
                </span>
                <p className="text-[0.68rem] uppercase tracking-[0.18em] text-text-muted">
                  {String(index + 1).padStart(2, '0')}
                </p>
                <h4 className="mt-1 font-display text-lg text-text-primary">
                  {realm.name}
                </h4>
                <p className="mt-1 text-xs font-semibold text-gold">{realm.count}</p>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                  {realm.body}
                </p>
              </li>
            ))}
          </ol>
        </Reveal>

        {/* Three real questions, playable. */}
        <Reveal className="mt-20">
          <h3 className="font-display text-xl text-text-primary sm:text-2xl">
            {t('samplesTitle')}
          </h3>
          <p className="mt-3 max-w-2xl text-base text-text-secondary">
            {t('samplesLede')}
          </p>
        </Reveal>
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {samples.map((question, index) => (
            <Reveal key={question.id} delay={index * 80}>
              <QuestionCard question={question} labels={cardLabels} className="h-full" />
            </Reveal>
          ))}
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-[1fr_1fr]">
          {/* Sourcing, stated precisely. */}
          <Reveal>
            <div className="h-full rounded-2xl border border-gold/20 bg-surface-raised/50 p-7">
              <StarOrnament className="mb-4" />
              <h3 className="font-display text-xl text-text-primary">
                {t('sourcingTitle')}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                {t('sourcingBody')}
              </p>
            </div>
          </Reveal>

          {/* The streak, as a progression: 3 → 5 → 10. */}
          <Reveal delay={80}>
            <div className="h-full rounded-2xl border border-gold/20 bg-surface-raised/50 p-7">
              <h3 className="font-display text-xl text-text-primary">
                {t('progressionTitle')}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                {t('progressionLede')}
              </p>
              <ol className="mt-6 space-y-4">
                {progression.map((step) => (
                  <li key={step.step} className="flex gap-4">
                    <span
                      aria-hidden
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gold/45 bg-surface-inset font-display text-lg text-gold"
                    >
                      {step.step}
                    </span>
                    <div>
                      <p className="font-display text-base text-text-primary">
                        {step.title}
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-text-secondary">
                        {step.body}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </Reveal>
        </div>

        <Reveal className="mt-12">
          <ButtonLink href="/knowledge" variant="secondary">
            {t('cta')}
          </ButtonLink>
        </Reveal>
      </div>
    </Section>
  );
}
