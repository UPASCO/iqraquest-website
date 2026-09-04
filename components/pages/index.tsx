import { useTranslations } from 'next-intl';
import { Reveal } from '@/components/Reveal';
import { Hero } from '@/components/home/Hero';
import {
  BrandStrip,
  ComingSoon,
  Family,
  Gameplay,
  HowToPlay,
  Pitch,
  Questions,
  Universe,
} from '@/components/home/Sections';
import { StoreBadges } from '@/components/StoreBadges';
import { ContactForm, type ContactFormLabels } from '@/components/ContactForm';
import {
  Link,
  ButtonLink,
  Card,
  Eyebrow,
  Lede,
  Section,
  SectionTitle,
  StarOrnament,
} from '@/components/ui/primitives';
import { FaqList, LegalBody, PageHeader, TextBlock } from './shared';
import { siteConfig } from '@/config/site.config';

/* ================================================================== */
/* Home                                                               */
/* ================================================================== */

export function HomePage() {
  return (
    <>
      <Hero />
      <Pitch />
      <HowToPlay />
      <Gameplay />
      <Universe />
      <Questions />
      <Family />
      <ComingSoon />
      <BrandStrip />
    </>
  );
}

/* ================================================================== */
/* The game                                                           */
/* ================================================================== */

const gameSectionKeys = [
  'board',
  'deck',
  'modes',
  'courses',
  'progress',
  'premium',
  'accessibility',
  'languages',
] as const;

export function GamePage() {
  const t = useTranslations('gamePage');

  return (
    <>
      <PageHeader
        eyebrow={t('eyebrow')}
        title={t('title')}
        lede={t('lede')}
      />

      <Section className="py-16 sm:py-20">
        <div className="container-page">
          <Reveal>
            <figure className="mx-auto max-w-3xl">
              <picture>
                <source
                  type="image/avif"
                  srcSet="/assets/board-cross-sm.avif 800w, /assets/board-cross.avif 1600w"
                  sizes="(min-width: 768px) 48rem, 92vw"
                />
                <source
                  type="image/webp"
                  srcSet="/assets/board-cross-sm.webp 800w, /assets/board-cross.webp 1600w"
                  sizes="(min-width: 768px) 48rem, 92vw"
                />
                <img
                  src="/assets/board-cross-sm.webp"
                  alt={t('sections.board.title')}
                  width={1600}
                  height={1600}
                  loading="lazy"
                  decoding="async"
                  className="rounded-2xl border border-gold/25 shadow-[0_40px_80px_-40px_rgba(0,0,0,0.95)]"
                />
              </picture>
            </figure>
          </Reveal>

          <div className="mt-16 grid gap-10 md:grid-cols-2">
            {gameSectionKeys.map((key, index) => (
              <Reveal key={key} delay={(index % 2) * 70}>
                <Card className="h-full">
                  <StarOrnament className="mb-4" />
                  <h2 className="font-display text-xl text-text-primary">
                    {t(`sections.${key}.title`)}
                  </h2>
                  <p className="mt-3 text-base leading-relaxed text-text-secondary">
                    {t(`sections.${key}.body`)}
                  </p>
                </Card>
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-14 text-center">
            <ButtonLink href="/how-to-play">{t('cta')}</ButtonLink>
          </Reveal>
        </div>
      </Section>

      <ComingSoon />
    </>
  );
}

/* ================================================================== */
/* How to play                                                        */
/* ================================================================== */

export function HowToPlayPage() {
  const t = useTranslations('howToPlayPage');
  const steps = t.raw('turn.steps') as { title: string; body: string }[];
  const rules = t.raw('rules.items') as { title: string; body: string }[];
  const faq = t.raw('faq') as { question: string; answer: string }[];

  return (
    <>
      <PageHeader eyebrow={t('eyebrow')} title={t('title')} lede={t('lede')} />

      <Section className="py-16 sm:py-20">
        <div className="container-page">
          <Reveal>
            <SectionTitle className="text-2xl sm:text-3xl">
              {t('turn.title')}
            </SectionTitle>
          </Reveal>

          <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <Reveal as="li" key={step.title} delay={index * 70}>
                <Card className="h-full">
                  <span
                    aria-hidden
                    className="font-display text-4xl leading-none text-gold/35"
                  >
                    {index + 1}
                  </span>
                  <h3 className="mt-4 font-display text-lg text-text-primary">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                    {step.body}
                  </p>
                </Card>
              </Reveal>
            ))}
          </ol>
        </div>
      </Section>

      <Section tone="raised" className="py-16 sm:py-20">
        <div className="container-page">
          <Reveal>
            <SectionTitle className="text-2xl sm:text-3xl">
              {t('rules.title')}
            </SectionTitle>
          </Reveal>

          <ul className="mt-10 grid gap-6 md:grid-cols-2">
            {rules.map((rule, index) => (
              <Reveal as="li" key={rule.title} delay={(index % 2) * 70}>
                <div className="border-s-2 border-gold/35 ps-5">
                  <h3 className="font-display text-lg text-text-primary">
                    {rule.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                    {rule.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </Section>

      <Section className="py-16 sm:py-20">
        <div className="container-prose">
          <FaqList entries={faq} title={t('faqTitle')} />
        </div>
      </Section>

      <ComingSoon />
    </>
  );
}

/* ================================================================== */
/* About                                                              */
/* ================================================================== */

export function AboutPage() {
  const t = useTranslations('aboutPage');
  const sections = t.raw('sections') as { title: string; body: string }[];

  return (
    <>
      <PageHeader eyebrow={t('eyebrow')} title={t('title')} lede={t('lede')} />

      <LegalBody>
        {sections.map((section) => (
          <TextBlock key={section.title} title={section.title}>
            <p>{section.body}</p>
          </TextBlock>
        ))}

        <TextBlock title={t('publisherTitle')}>
          <p>{t('publisherBody', { domain: siteConfig.domain })}</p>
        </TextBlock>
      </LegalBody>
    </>
  );
}

/* ================================================================== */
/* Support                                                            */
/* ================================================================== */

export function SupportPage() {
  const t = useTranslations('supportPage');
  const tNav = useTranslations('nav');
  const faq = t.raw('faq') as { question: string; answer: string }[];

  return (
    <>
      <PageHeader eyebrow={t('eyebrow')} title={t('title')} lede={t('lede')} />

      <Section className="py-16 sm:py-20">
        <div className="container-page grid gap-10 lg:grid-cols-[1fr_1fr]">
          <Reveal>
            <Card className="h-full">
              <h2 className="font-display text-xl text-text-primary">
                {t('contactTitle')}
              </h2>
              <p className="mt-3 text-base leading-relaxed text-text-secondary">
                {t('contactBody')}
              </p>
              <p className="mt-6 text-xs uppercase tracking-[0.18em] text-gold">
                {t('emailLabel')}
              </p>
              <a
                href={`mailto:${siteConfig.supportEmail}`}
                className="mt-2 inline-flex min-h-11 items-center font-display text-lg text-text-primary underline decoration-gold/50 underline-offset-4 transition-colors hover:text-gold"
              >
                {siteConfig.supportEmail}
              </a>
              <div className="mt-6">
                <Link
                  href="/contact"
                  className="inline-flex min-h-11 items-center text-sm text-gold underline underline-offset-4 hover:text-gold-bright"
                >
                  {t('formLink')}
                </Link>
              </div>
            </Card>
          </Reveal>

          <Reveal delay={80}>
            <Card className="h-full">
              <h2 className="font-display text-xl text-text-primary">
                {t('legalTitle')}
              </h2>
              <p className="mt-3 text-base leading-relaxed text-text-secondary">
                {t('legalBody')}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <ButtonLink href="/privacy" variant="secondary">
                  {tNav('privacy')}
                </ButtonLink>
                <ButtonLink href="/terms" variant="secondary">
                  {tNav('terms')}
                </ButtonLink>
                <ButtonLink href="/intellectual-property" variant="secondary">
                  {tNav('intellectualProperty')}
                </ButtonLink>
              </div>
            </Card>
          </Reveal>
        </div>
      </Section>

      <Section tone="raised" className="py-16 sm:py-20">
        <div className="container-prose">
          <FaqList entries={faq} title={t('faqTitle')} />
        </div>
      </Section>
    </>
  );
}

/* ================================================================== */
/* Contact                                                            */
/* ================================================================== */

export function ContactPage() {
  const t = useTranslations('contactPage');
  const tf = useTranslations('contactPage.form');

  // The form is a client component; its strings are resolved here and
  // passed as plain props, so no catalogue or ICU formatter is shipped.
  const formLabels: ContactFormLabels = {
    subjectLabel: tf('subjectLabel'),
    subjectPlaceholder: tf('subjectPlaceholder'),
    subjects: {
      support: tf('subjects.support'),
      press: tf('subjects.press'),
      partnership: tf('subjects.partnership'),
      ip: tf('subjects.ip'),
      bug: tf('subjects.bug'),
      other: tf('subjects.other'),
    },
    nameLabel: tf('nameLabel'),
    namePlaceholder: tf('namePlaceholder'),
    emailLabel: tf('emailLabel'),
    emailPlaceholder: tf('emailPlaceholder'),
    messageLabel: tf('messageLabel'),
    messagePlaceholder: tf('messagePlaceholder'),
    submit: tf('submit'),
    submitting: tf('submitting'),
    openMail: tf('openMail'),
    consent: tf('consent'),
    errors: {
      subject: tf('errors.subject'),
      name: tf('errors.name'),
      email: tf('errors.email'),
      messageShort: tf('errors.messageShort'),
      messageLong: tf('errors.messageLong'),
      failed: tf('errors.failed', { email: siteConfig.supportEmail }),
    },
    successTitle: tf('successTitle'),
    successBody: tf('successBody'),
    mailFallbackTitle: tf('mailFallbackTitle'),
    mailFallbackBody: tf('mailFallbackBody', {
      email: siteConfig.supportEmail,
    }),
    supportEmail: siteConfig.supportEmail,
    siteName: siteConfig.siteName,
  };

  return (
    <>
      <PageHeader eyebrow={t('eyebrow')} title={t('title')} lede={t('lede')} />

      <Section className="py-16 sm:py-20">
        <div className="container-prose">
          <ContactForm labels={formLabels} />

          <div className="mt-12 rounded-2xl border border-gold/15 bg-surface-raised/50 p-6">
            <h2 className="font-display text-lg text-text-primary">
              {t('directTitle')}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-text-secondary">
              {t('directBody', { email: siteConfig.supportEmail })}
            </p>
            <a
              href={`mailto:${siteConfig.supportEmail}`}
              className="mt-3 inline-flex min-h-11 items-center font-display text-lg text-text-primary underline decoration-gold/50 underline-offset-4 transition-colors hover:text-gold"
            >
              {siteConfig.supportEmail}
            </a>
          </div>
        </div>
      </Section>
    </>
  );
}

/* ================================================================== */
/* Privacy                                                            */
/* ================================================================== */

export function PrivacyPage() {
  const t = useTranslations('privacyPage');
  const tc = useTranslations('common');
  const sections = t.raw('sections') as { title: string; body: string }[];

  return (
    <>
      <PageHeader
        eyebrow={t('eyebrow')}
        title={t('title')}
        updated={t('updated')}
        updatedLabel={tc('lastUpdated')}
      />

      <LegalBody precedence>
        <Reveal>
          <Card className="border-gold/25">
            <h2 className="font-display text-lg text-gold">
              {t('summaryTitle')}
            </h2>
            <p className="mt-3 text-base leading-relaxed text-text-secondary">
              {t('summaryBody')}
            </p>
          </Card>
        </Reveal>

        {sections.map((section) => (
          <TextBlock key={section.title} title={section.title}>
            <p>
              {section.body
                .replace('{domain}', siteConfig.domain)
                .replace('{email}', siteConfig.supportEmail)}
            </p>
          </TextBlock>
        ))}
      </LegalBody>
    </>
  );
}

/* ================================================================== */
/* Terms                                                              */
/* ================================================================== */

export function TermsPage() {
  const t = useTranslations('termsPage');
  const tc = useTranslations('common');
  const sections = t.raw('sections') as { title: string; body: string }[];

  return (
    <>
      <PageHeader
        eyebrow={t('eyebrow')}
        title={t('title')}
        updated={t('updated')}
        updatedLabel={tc('lastUpdated')}
      />

      <LegalBody precedence>
        <Reveal>
          <p className="text-base leading-relaxed text-text-secondary">
            {t('intro', { domain: siteConfig.domain })}
          </p>
        </Reveal>

        {sections.map((section) => (
          <TextBlock key={section.title} title={section.title}>
            <p>{section.body.replace('{email}', siteConfig.supportEmail)}</p>
          </TextBlock>
        ))}
      </LegalBody>
    </>
  );
}

/* ================================================================== */
/* Intellectual property                                              */
/* ================================================================== */

export function IntellectualPropertyPage() {
  const t = useTranslations('ipPage');
  const tc = useTranslations('common');
  const protectedItems = t.raw('protectedItems') as string[];
  const limitsItems = t.raw('limitsItems') as string[];

  // These messages carry ICU placeholders, so the values go to `t()`
  // itself. Formatting them afterwards is too late: next-intl throws on
  // a missing parameter and falls back to rendering the key.
  const values = {
    email: siteConfig.supportEmail,
    domain: siteConfig.domain,
  };

  return (
    <>
      <PageHeader
        eyebrow={t('eyebrow')}
        title={t('title')}
        lede={t('lede')}
        updated={t('updated')}
        updatedLabel={tc('lastUpdated')}
      />

      <LegalBody precedence>
        <TextBlock title={t('ownershipTitle')}>
          <p>{t('ownershipBody')}</p>
        </TextBlock>

        <TextBlock title={t('protectedTitle')}>
          <p>{t('protectedIntro')}</p>
          <ul className="mt-4 space-y-2">
            {protectedItems.map((item) => (
              <li key={item} className="flex gap-3">
                <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-gold" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </TextBlock>

        <TextBlock title={t('usageTitle')}>
          <p>{t('usageBody')}</p>
        </TextBlock>

        <TextBlock title={t('extractionTitle')}>
          <p>{t('extractionBody')}</p>
        </TextBlock>

        <TextBlock title={t('trademarkTitle')}>
          <p>{t('trademarkBody')}</p>
        </TextBlock>

        {/* Stating the limits is what makes the rest credible. */}
        <Reveal as="section">
          <h2 className="font-display text-xl text-text-primary sm:text-2xl">
            {t('limitsTitle')}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-text-secondary">
            {t('limitsIntro')}
          </p>
          <ul className="mt-5 space-y-4">
            {limitsItems.map((item) => (
              <li
                key={item}
                className="border-s-2 border-gold/30 ps-5 text-base leading-relaxed text-text-secondary"
              >
                {item}
              </li>
            ))}
          </ul>
        </Reveal>

        <TextBlock title={t('provenanceTitle')}>
          <p>{t('provenanceBody', values)}</p>
        </TextBlock>

        <TextBlock title={t('permissionTitle')}>
          <p>{t('permissionBody', values)}</p>
        </TextBlock>

        <TextBlock title={t('reportTitle')}>
          <p>{t('reportBody', values)}</p>
        </TextBlock>
      </LegalBody>
    </>
  );
}

/* ================================================================== */
/* 404                                                                */
/* ================================================================== */

export function NotFoundPage() {
  const t = useTranslations('notFound');

  return (
    <section className="relative isolate flex min-h-[70svh] items-center overflow-hidden">
      <picture className="absolute inset-0 -z-20">
        <source type="image/avif" srcSet="/assets/brand-key-art.avif" />
        <img
          src="/assets/brand-key-art.webp"
          alt=""
          aria-hidden
          width={1024}
          height={1024}
          className="h-full w-full object-cover opacity-45"
        />
      </picture>
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(6,31,24,0.88),rgba(6,31,24,0.94))]"
      />

      <div className="container-page relative text-center">
        <p className="font-display text-[clamp(4rem,18vw,9rem)] leading-none text-gold/45">
          {t('code')}
        </p>
        <SectionTitle as="h1" className="mt-4">
          {t('title')}
        </SectionTitle>
        <p className="mx-auto mt-5 max-w-lg text-lg text-text-secondary">
          {t('body')}
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/">{t('cta')}</ButtonLink>
          <ButtonLink href="/game" variant="secondary">
            {t('secondary')}
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}

/* Re-exported so route files import from one place. */
export { Eyebrow, Lede, StoreBadges };
