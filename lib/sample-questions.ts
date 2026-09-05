import data from '@/content/sample-questions.json';
import type { Locale } from '@/i18n/routing';

/**
 * Real questions from the game's bank, in every language the game ships.
 *
 * `content/sample-questions.json` is extracted verbatim from the
 * application's `assets/data/questions/<locale>/questions.json` files —
 * wording, answers, explanation and source citation exactly as a player
 * sees them. Nothing on the site is a made-up example, and nothing here
 * needed translating: the bank already exists in the twelve languages.
 */

export type Category = 'prophets' | 'sira' | 'quran' | 'faith' | 'virtues';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface SampleQuestion {
  id: string;
  category: Category;
  difficulty: Difficulty;
  question: string;
  answers: readonly string[];
  correct: number;
  explanation: string;
  source: string;
}

interface RawEntry {
  category: Category;
  difficulty: Difficulty;
  sourceWork: string;
  sourceReference: string;
  locales: Record<
    string,
    {
      question: string;
      answers: string[];
      correct: number;
      explanation: string;
      source: string;
    }
  >;
}

const bank = data as Record<string, RawEntry>;

/** The three shown on the homepage: one per difficulty, three realms. */
export const HOME_SAMPLE_IDS = ['prophets_001', 'sira_091', 'quran_006'] as const;

/** The five shown on the knowledge page: one per realm. */
export const KNOWLEDGE_SAMPLE_IDS = [
  'prophets_001',
  'sira_091',
  'quran_006',
  'faith_010',
  'virtues_001',
] as const;

export function sampleQuestions(
  locale: Locale,
  ids: readonly string[],
): SampleQuestion[] {
  return ids.map((id) => {
    const entry = bank[id];
    if (!entry) throw new Error(`sample question ${id} is not in the extract`);
    const text = entry.locales[locale] ?? entry.locales.fr;
    if (!text) throw new Error(`sample question ${id} has no ${locale} text`);
    return {
      id,
      category: entry.category,
      difficulty: entry.difficulty,
      question: text.question,
      answers: text.answers,
      correct: text.correct,
      explanation: text.explanation,
      source: text.source,
    };
  });
}
