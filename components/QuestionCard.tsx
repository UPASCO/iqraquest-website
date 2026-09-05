'use client';

import { useState } from 'react';
import { cx } from '@/components/ui/primitives';
import type {
  Category,
  Difficulty,
  SampleQuestion,
} from '@/lib/sample-questions';

/**
 * A question card, as the game shows one.
 *
 * Follows the application's own question-card specification
 * (DESIGN_SYSTEM.md §Question card), top to bottom: category chip and
 * difficulty dots, the question, four answer tiles with a letter badge,
 * and — once answered — an inline result band, the explanation and the
 * source citation in a quiet caption. Never a modal, never a shake or a
 * buzzer on a wrong answer; the app's rule is that being wrong must not
 * feel humiliating, least of all for a child.
 *
 * It is interactive because that is the point: a visitor who taps an
 * answer has played one turn of the actual game. Every string is passed
 * in as a prop — this is a client component, and the site ships no
 * translation runtime to the browser.
 */

export interface QuestionCardLabels {
  levels: Record<Difficulty, string>;
  categories: Record<Category, string>;
  answerHint: string;
  correct: string;
  incorrect: string;
  neverBack: string;
  sourceLabel: string;
}

const LETTERS = ['A', 'B', 'C', 'D'] as const;

const DOTS: Record<Difficulty, number> = { easy: 1, medium: 2, hard: 3 };

export function QuestionCard({
  question,
  labels,
  className,
}: {
  question: SampleQuestion;
  labels: QuestionCardLabels;
  className?: string;
}) {
  const [picked, setPicked] = useState<number | null>(null);
  const answered = picked !== null;
  const wasRight = picked === question.correct;

  return (
    <article
      className={cx(
        'motif-lattice relative flex flex-col overflow-hidden rounded-2xl border border-gold/20 bg-surface-raised/80 p-5 shadow-[0_1px_0_0_rgba(200,155,69,0.1)_inset,0_28px_50px_-36px_rgba(0,0,0,0.9)] sm:p-6',
        className,
      )}
    >
      {/* Category chip + difficulty dots */}
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-gold">
          {labels.categories[question.category]}
        </span>
        <span
          className="flex items-center gap-1"
          aria-label={labels.levels[question.difficulty]}
          title={labels.levels[question.difficulty]}
        >
          {[1, 2, 3].map((n) => (
            <span
              key={n}
              aria-hidden
              className={cx(
                'h-1.5 w-1.5 rounded-full',
                n <= DOTS[question.difficulty] ? 'bg-gold' : 'bg-gold/25',
              )}
            />
          ))}
          <span className="ms-2 text-[0.68rem] uppercase tracking-[0.14em] text-text-muted">
            {labels.levels[question.difficulty]}
          </span>
        </span>
      </div>

      {/* The question */}
      <h3 className="mt-5 font-display text-lg leading-snug text-text-primary sm:text-xl">
        {question.question}
      </h3>

      {/* Answer tiles */}
      <div
        role="group"
        aria-label={labels.answerHint}
        className="mt-5 grid gap-2"
      >
        {question.answers.map((answer, index) => {
          const isCorrect = index === question.correct;
          const isPicked = index === picked;
          const state = !answered
            ? 'idle'
            : isCorrect
              ? 'correct'
              : isPicked
                ? 'wrong'
                : 'dim';
          return (
            <button
              key={answer}
              type="button"
              disabled={answered}
              onClick={() => setPicked(index)}
              aria-pressed={isPicked}
              className={cx(
                'flex min-h-12 items-center gap-3 rounded-xl border px-3 py-2.5 text-start text-sm transition-colors duration-200',
                state === 'idle' &&
                  'border-gold/20 bg-surface-inset/60 text-text-primary hover:border-gold/55 hover:bg-gold/8',
                state === 'correct' &&
                  'border-success/70 bg-success/18 text-text-primary',
                state === 'wrong' && 'border-error/60 bg-error/14 text-text-primary',
                state === 'dim' && 'border-gold/10 text-text-muted opacity-60',
                answered && 'cursor-default',
              )}
            >
              <span
                aria-hidden
                className={cx(
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-semibold',
                  state === 'correct'
                    ? 'bg-success text-ivory'
                    : state === 'wrong'
                      ? 'bg-error text-ivory'
                      : 'bg-gold/15 text-gold',
                )}
              >
                {LETTERS[index]}
              </span>
              <span>{answer}</span>
            </button>
          );
        })}
      </div>

      {/* After answering: result band, explanation, source. Rendered in
          a live region so a screen reader hears the outcome. */}
      <div aria-live="polite" className="mt-4">
        {answered && (
          <div className="rounded-xl border border-gold/15 bg-surface-inset/70 p-4">
            <p
              className={cx(
                'text-sm font-semibold',
                wasRight ? 'text-success' : 'text-sand',
              )}
            >
              {wasRight ? labels.correct : labels.incorrect}
            </p>
            {!wasRight && (
              <p className="mt-1 text-xs text-text-muted">{labels.neverBack}</p>
            )}
            <p className="mt-3 text-sm leading-relaxed text-text-secondary">
              {question.explanation}
            </p>
            <p className="mt-3 text-xs text-text-muted">
              <span className="uppercase tracking-[0.14em]">
                {labels.sourceLabel}
              </span>
              {' — '}
              <span className="text-sand">{question.source}</span>
            </p>
          </div>
        )}
      </div>
    </article>
  );
}
