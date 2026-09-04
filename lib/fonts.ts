import { Noto_Naskh_Arabic, Noto_Sans, Spectral } from 'next/font/google';

/**
 * Typography.
 *
 * Body text is set in **Noto Sans** — the application's own UI face, so
 * the site and the game read in the same voice. Headings take
 * **Spectral**, a screen-built serif with enough weight to hold ivory
 * type over the key art's lit ground; a high-contrast Garamond would
 * go fragile there.
 *
 * Arabic and Urdu are set in **Noto Naskh Arabic**, again the app's
 * choice: a clear, modern, non-decorative Naskh. No faux-calligraphic
 * face is used anywhere — they render illegible or fabricated glyph
 * shapes for real text.
 *
 * All three are self-hosted by `next/font` at build time, so the site
 * makes no request to a third-party font CDN and the CSP needs no
 * external `font-src`.
 *
 * Only the weights the design actually uses are declared. The site uses
 * exactly three: regular, `font-medium` (500) and `font-semibold` (600),
 * with headings at 600. Every extra weight is another file the browser
 * may fetch for nothing.
 *
 * None of the faces is preloaded. `next/font` emits a `<link rel=preload>`
 * for every declared subset, and the `latin-ext` file is 164 kB against
 * 35 kB for `latin` — so a French page was eagerly fetching five times
 * its own font weight in glyphs it never renders. Of the twelve locales
 * only Turkish reaches outside Latin-1 (ğ, ş), and `unicode-range`
 * already fetches that file exactly when a page needs it. Without the
 * preload the request starts after the render-blocking stylesheet
 * instead of alongside it, which costs nothing measurable here: the
 * LCP element is an image, and `display: swap` paints text in the
 * metric-matched fallback immediately.
 */

export const fontSans = Noto_Sans({
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-sans-family',
  weight: ['400', '500', '600'],
  preload: false,
  fallback: [
    'ui-sans-serif',
    'system-ui',
    '-apple-system',
    'Segoe UI',
    'Roboto',
    'Helvetica Neue',
    'Arial',
  ],
  adjustFontFallback: true,
});

export const fontDisplay = Spectral({
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-display-family',
  // 400 for inline display text such as the wordmark, 600 for headings.
  weight: ['400', '600'],
  style: ['normal'],
  // The one face that IS preloaded. Headings are the largest text on
  // every page, so they cause the largest shift when the face swaps in,
  // and Spectral's subsets are ~14 kB each against Noto Sans's 164 kB
  // latin-ext — cheap enough to fetch eagerly.
  preload: true,
  fallback: [
    'Iowan Old Style',
    'Palatino Linotype',
    'Book Antiqua',
    'Georgia',
    'serif',
  ],
  adjustFontFallback: true,
});

/**
 * The Naskh face is large — a single weight is heavier than the whole
 * Latin set — and only two of the twelve locales set a single glyph in
 * it. `preload: false` keeps the `<link rel=preload>` off every page;
 * the browser then fetches the file only when it has Arabic-script text
 * to render, which happens on `/ar` and `/ur` and nowhere else. The
 * variable class is likewise applied only on those two locales, by
 * `SiteShell`.
 */
export const fontArabic = Noto_Naskh_Arabic({
  subsets: ['arabic'],
  display: 'swap',
  variable: '--font-arabic-family',
  weight: ['400', '600'],
  preload: false,
  fallback: ['Geeza Pro', 'Traditional Arabic', 'serif'],
  // Arabic metrics differ enough from any Latin fallback that an
  // adjusted fallback would shift the layout rather than steady it.
  adjustFontFallback: false,
});

/** The Latin faces, carried by every page. */
export const latinFontVariables = `${fontSans.variable} ${fontDisplay.variable}`;

/** Adds the Naskh face, for right-to-left locales only. */
export const rtlFontVariables = `${latinFontVariables} ${fontArabic.variable}`;

export function fontVariablesFor(rtl: boolean): string {
  return rtl ? rtlFontVariables : latinFontVariables;
}
