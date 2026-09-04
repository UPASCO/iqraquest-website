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
 */

export const fontSans = Noto_Sans({
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-sans-family',
  // The variable font covers the whole range; only the weights the
  // design actually uses are declared so the subset stays small.
  weight: ['400', '500', '600', '700'],
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
  weight: ['500', '600'],
  style: ['normal'],
  fallback: [
    'Iowan Old Style',
    'Palatino Linotype',
    'Book Antiqua',
    'Georgia',
    'serif',
  ],
  adjustFontFallback: true,
});

export const fontArabic = Noto_Naskh_Arabic({
  subsets: ['arabic'],
  display: 'swap',
  variable: '--font-arabic-family',
  weight: ['400', '500', '600', '700'],
  fallback: ['Geeza Pro', 'Traditional Arabic', 'serif'],
  // Arabic metrics differ enough from any Latin fallback that an
  // adjusted fallback would shift the layout rather than steady it.
  adjustFontFallback: false,
});

/** The class list every `<html>` element carries. */
export const fontVariables = `${fontSans.variable} ${fontDisplay.variable} ${fontArabic.variable}`;
