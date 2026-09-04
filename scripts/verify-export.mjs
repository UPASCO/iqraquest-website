#!/usr/bin/env node
/**
 * Post-build verification of the static export.
 *
 * The build succeeding only proves the code compiles. This proves the
 * thing that actually gets uploaded is publishable: every route exists
 * in every language, the files GitHub Pages needs are present, the
 * canonical and hreflang blocks are right, and no page links to a URL
 * the export does not contain.
 *
 * It runs in CI before the deploy step, so a broken export never
 * reaches the domain.
 */
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const OUT = path.resolve('out');
const CANONICAL = 'https://iqraquest.org';

const ROUTES = [
  '',
  'game',
  'how-to-play',
  'about',
  'support',
  'contact',
  'privacy',
  'terms',
  'intellectual-property',
];

const LOCALES = [
  'fr',
  'en',
  'ar',
  'de',
  'es',
  'id',
  'it',
  'ms',
  'nl',
  'pt',
  'tr',
  'ur',
];

const DEFAULT_LOCALE = 'fr';

const failures = [];
const notes = [];

function fail(message) {
  failures.push(message);
}

async function exists(target) {
  try {
    await stat(target);
    return true;
  } catch {
    return false;
  }
}

/** The on-disk file for a locale + route, as the host will resolve it. */
function pageFile(locale, route) {
  const prefix = locale === DEFAULT_LOCALE ? '' : locale;
  return path.join(OUT, prefix, route, 'index.html');
}

/** Site-absolute URL path for a locale + route. */
function pagePath(locale, route) {
  const prefix = locale === DEFAULT_LOCALE ? '' : `/${locale}`;
  return route ? `${prefix}/${route}/` : `${prefix}/`;
}

async function checkPagesExist() {
  for (const locale of LOCALES) {
    for (const route of ROUTES) {
      const file = pageFile(locale, route);
      if (!(await exists(file))) {
        fail(`missing page: ${pagePath(locale, route)} (expected ${path.relative(OUT, file)})`);
      }
    }
  }
}

async function checkHostFiles() {
  const required = [
    ['404.html', 'the 404 document GitHub Pages serves for unknown paths'],
    ['.nojekyll', 'without it GitHub Pages drops the /_next directory'],
    ['CNAME', 'binds the custom domain across deploys'],
    ['sitemap.xml', 'advertised in robots.txt'],
    ['robots.txt', 'crawler directives'],
    ['manifest.webmanifest', 'home-screen icon and theme'],
    ['assets/og-card.jpg', 'the social share image'],
  ];

  for (const [file, why] of required) {
    if (!(await exists(path.join(OUT, file)))) {
      fail(`missing ${file} — ${why}`);
    }
  }

  const cnamePath = path.join(OUT, 'CNAME');
  if (await exists(cnamePath)) {
    const value = (await readFile(cnamePath, 'utf8')).trim();
    if (value !== 'iqraquest.org') {
      fail(`CNAME says "${value}", expected "iqraquest.org"`);
    }
  }
}

async function checkHomeMetadata() {
  const html = await readFile(pageFile(DEFAULT_LOCALE, ''), 'utf8');

  if (!html.includes(`<link rel="canonical" href="${CANONICAL}/"`)) {
    fail('the French homepage does not carry the expected canonical link');
  }

  // Every locale must be advertised, plus x-default.
  for (const locale of LOCALES) {
    const expected = `${CANONICAL}${pagePath(locale, '')}`;
    if (!html.includes(expected)) {
      fail(`homepage hreflang block is missing ${locale} (${expected})`);
    }
  }
  if (!html.includes('hreflang="x-default"')) {
    fail('homepage is missing the x-default hreflang');
  }

  for (const needle of [
    ['og:image', 'Open Graph image'],
    ['og:title', 'Open Graph title'],
    ['twitter:card', 'Twitter card'],
    ['application/ld+json', 'structured data'],
    ['"@type":"VideoGame"', 'VideoGame schema'],
    ['"@type":"Organization"', 'Organization schema'],
  ]) {
    if (!html.includes(needle[0])) fail(`homepage is missing ${needle[1]}`);
  }

  // The trademark discipline is a hard rule, not a preference.
  if (/IqraQuest\s*®/.test(html)) {
    fail('the registered-trademark symbol ® appears on the homepage');
  }
}

async function checkRtl() {
  for (const locale of ['ar', 'ur']) {
    const html = await readFile(pageFile(locale, ''), 'utf8');
    if (!html.includes('dir="rtl"')) {
      fail(`${locale} homepage is not marked dir="rtl"`);
    }
    if (!html.includes(`lang="${locale}"`)) {
      fail(`${locale} homepage is not marked lang="${locale}"`);
    }
  }
}

/**
 * Every internal href must resolve to a file in the export. This is the
 * check that catches a broken link before a visitor does.
 */
async function checkInternalLinks() {
  const pages = [];
  for (const locale of LOCALES) {
    for (const route of ROUTES) pages.push([locale, route]);
  }

  const seen = new Set();

  for (const [locale, route] of pages) {
    const file = pageFile(locale, route);
    if (!(await exists(file))) continue;
    const html = await readFile(file, 'utf8');

    for (const match of html.matchAll(/href="(\/[^"#?]*)"/g)) {
      const href = match[1];
      if (href.startsWith('/_next/')) continue;
      const key = href;
      if (seen.has(key)) continue;
      seen.add(key);

      // A directory-style href resolves to its index.html; anything with
      // an extension is a file.
      const target = href.endsWith('/')
        ? path.join(OUT, href, 'index.html')
        : path.join(OUT, href);

      if (!(await exists(target))) {
        fail(`broken internal link ${href} (found on ${pagePath(locale, route)})`);
      }
    }
  }

  notes.push(`${seen.size} distinct internal links checked`);
}

/**
 * Catches the failure mode where a message did not render.
 *
 * next-intl falls back to printing the message key when formatting
 * throws — most often because a message carries an ICU placeholder the
 * caller forgot to pass. The page still builds, still deploys, and
 * quietly shows `ipPage.provenanceBody` to a visitor. Two shapes are
 * checked: a bare dotted key in the body text, and an unsubstituted
 * `{placeholder}` that reached the HTML.
 */
async function checkRenderedMessages() {
  // Message namespaces, from messages/fr.json's top level.
  const namespaces = Object.keys(
    JSON.parse(await readFile(path.resolve('messages/fr.json'), 'utf8')),
  );
  const keyPattern = new RegExp(
    `>\\s*(?:${namespaces.join('|')})\\.[A-Za-z0-9_.]+\\s*<`,
    'g',
  );

  for (const locale of LOCALES) {
    for (const route of ROUTES) {
      const file = pageFile(locale, route);
      if (!(await exists(file))) continue;
      const html = await readFile(file, 'utf8');

      // Strip the JSON-LD blocks: they legitimately contain dotted
      // strings and braces.
      const body = html.replace(
        /<script type="application\/ld\+json"[\s\S]*?<\/script>/g,
        '',
      );

      for (const match of body.matchAll(keyPattern)) {
        fail(
          `unrendered message key ${match[0].slice(1, -1).trim()} on ${pagePath(locale, route)}`,
        );
      }

      for (const match of body.matchAll(/>[^<>{}]*\{(email|domain|year|mark)\}/g)) {
        fail(
          `unsubstituted {${match[1]}} placeholder on ${pagePath(locale, route)}`,
        );
      }
    }
  }
}

/** Warns when the LCP artwork has grown past what a phone should fetch. */
async function checkAssetWeight() {
  const assetsDir = path.join(OUT, 'assets');
  if (!(await exists(assetsDir))) {
    fail('out/assets is missing');
    return;
  }

  const budgets = [
    ['hero-key-art.avif', 260_000],
    ['hero-key-art.webp', 360_000],
    ['og-card.jpg', 160_000],
  ];

  for (const [name, limit] of budgets) {
    const target = path.join(assetsDir, name);
    if (!(await exists(target))) {
      fail(`missing asset ${name}`);
      continue;
    }
    const { size } = await stat(target);
    if (size > limit) {
      fail(`${name} is ${Math.round(size / 1024)} kB, over its ${Math.round(limit / 1024)} kB budget`);
    }
  }

  const files = await readdir(assetsDir);
  notes.push(`${files.length} asset files exported`);
}

async function main() {
  if (!(await exists(OUT))) {
    console.error('out/ does not exist — run `npm run build` first.');
    process.exit(1);
  }

  await checkPagesExist();
  await checkHostFiles();
  await checkHomeMetadata();
  await checkRtl();
  await checkInternalLinks();
  await checkRenderedMessages();
  await checkAssetWeight();

  for (const note of notes) console.log(`  ${note}`);

  if (failures.length > 0) {
    console.error(`\n${failures.length} problem(s) with the export:\n`);
    for (const failure of failures) console.error(`  ✗ ${failure}`);
    process.exit(1);
  }

  console.log(
    `\n✓ export verified: ${ROUTES.length} routes × ${LOCALES.length} locales`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
