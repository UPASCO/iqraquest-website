import type { ReactNode } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Reveal } from '@/components/Reveal';
import {
  Eyebrow,
  GoldRule,
  Lede,
  Section,
  SectionTitle,
} from '@/components/ui/primitives';

/**
 * The masthead every inner page opens with. Keeping it in one place is
 * what makes nine pages feel like one site.
 */
export function PageHeader({
  eyebrow,
  title,
  lede,
  updated,
  updatedLabel,
}: {
  eyebrow: string;
  title: string;
  lede?: string;
  updated?: string;
  updatedLabel?: string;
}) {
  return (
    <section className="relative overflow-hidden border-b border-gold/10 bg-surface">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 motif-lattice opacity-50"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-48 glow-warm"
      />
      <div className="container-page relative py-20 sm:py-24">
        <div className="max-w-3xl">
          <Eyebrow>{eyebrow}</Eyebrow>
          <SectionTitle as="h1" className="text-[clamp(2rem,6vw,3.5rem)]">
            {title}
          </SectionTitle>
          {lede && <Lede className="text-xl">{lede}</Lede>}
          {updated && updatedLabel && (
            <p className="mt-6 text-sm text-text-muted">
              {updatedLabel} : {updated}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

/** A titled block of body copy, the unit every legal page is built from. */
export function TextBlock({
  title,
  children,
  id,
}: {
  title: string;
  children: ReactNode;
  id?: string;
}) {
  return (
    <Reveal as="section" className="scroll-mt-32">
      <h2
        id={id}
        className="font-display text-xl text-text-primary sm:text-2xl"
      >
        {title}
      </h2>
      <div className="mt-4 space-y-4 text-base leading-relaxed text-text-secondary">
        {children}
      </div>
    </Reveal>
  );
}

/**
 * The legal-page shell: a single measured column, generous leading, and
 * a rule between entries. Legal text is read, not scanned.
 *
 * Outside French, it closes with the precedence notice. The French text
 * is the one that was drafted; saying so is standard practice for a
 * translated legal document, and it is more honest than implying twelve
 * equally authoritative versions.
 */
export function LegalBody({
  children,
  precedence = false,
}: {
  children: ReactNode;
  /** Set on the three legal pages; other pages carry no such notice. */
  precedence?: boolean;
}) {
  const locale = useLocale();
  const t = useTranslations('common');

  return (
    <Section className="py-16 sm:py-20">
      <div className="container-prose space-y-12">
        {children}
        {precedence && locale !== 'fr' && (
          <p className="border-t border-gold/12 pt-8 text-sm leading-relaxed text-text-muted">
            {t('legalPrevails')}
          </p>
        )}
      </div>
    </Section>
  );
}

/** A question-and-answer list, used by the FAQ and support pages. */
export function FaqList({
  entries,
  headingId,
  title,
}: {
  entries: readonly { question: string; answer: string }[];
  headingId?: string;
  title?: string;
}) {
  return (
    <div>
      {title && (
        <SectionTitle id={headingId} className="text-2xl sm:text-3xl">
          {title}
        </SectionTitle>
      )}
      <dl className="mt-8 divide-y divide-gold/12 border-y border-gold/12">
        {entries.map((entry) => (
          <div key={entry.question} className="py-6">
            <dt className="font-display text-lg text-text-primary">
              {entry.question}
            </dt>
            <dd className="mt-3 text-base leading-relaxed text-text-secondary">
              {entry.answer}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export { GoldRule };
