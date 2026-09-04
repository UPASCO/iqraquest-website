import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { access } from 'node:fs/promises';
import path from 'node:path';

/**
 * The site's route list is written down in four places that must agree:
 *
 *   scripts/gen-routes.mjs   PAGES     — what gets built
 *   lib/seo.ts               routes    — what enters the sitemap
 *   scripts/verify-export.mjs ROUTES   — what the export check looks for
 *   i18n/routing.ts          locales   — and, separately, the languages
 *
 * A page added to one and forgotten in another fails silently: it
 * builds but never reaches the sitemap, or the export check passes
 * while the page is missing. These tests make the mismatch loud.
 */

const read = (p) => readFile(path.resolve(p), 'utf8');

/** Pulls a string-array literal out of a source file by variable name. */
function arrayLiteral(source, name) {
  const start = source.indexOf(name);
  assert.ok(start !== -1, `${name} not found`);
  const open = source.indexOf('[', start);
  const close = source.indexOf('];', open);
  return [...source.slice(open, close).matchAll(/'([^']*)'/g)].map((m) => m[1]);
}

test('the route lists agree across the generator, the sitemap and the export check', async () => {
  const gen = await read('scripts/gen-routes.mjs');
  const seo = await read('lib/seo.ts');
  const verify = await read('scripts/verify-export.mjs');

  // Scope to the PAGES table: the generator's template strings also
  // contain the literal text `path: '${page.path}'`.
  const pagesTable = gen.slice(
    gen.indexOf('const PAGES = ['),
    gen.indexOf('];', gen.indexOf('const PAGES = [')),
  );
  const genPaths = [...pagesTable.matchAll(/path:\s*'([^']*)'/g)].map(
    (m) => m[1],
  );
  const seoPaths = [...seo.matchAll(/\{ path: '([^']*)', priority/g)].map(
    (m) => m[1],
  );
  const verifyPaths = arrayLiteral(verify, 'const ROUTES');

  assert.ok(genPaths.length >= 9, 'expected at least nine routes');
  assert.deepEqual(
    [...genPaths].sort(),
    [...seoPaths].sort(),
    'scripts/gen-routes.mjs PAGES and lib/seo.ts routes disagree',
  );
  assert.deepEqual(
    [...genPaths].sort(),
    [...verifyPaths].sort(),
    'scripts/gen-routes.mjs PAGES and scripts/verify-export.mjs ROUTES disagree',
  );
});

test('the locale lists agree between routing and the export check', async () => {
  const routing = await read('i18n/routing.ts');
  const verify = await read('scripts/verify-export.mjs');

  const routingLocales = arrayLiteral(routing, 'export const locales');
  const verifyLocales = arrayLiteral(verify, 'const LOCALES');

  assert.deepEqual(
    [...routingLocales].sort(),
    [...verifyLocales].sort(),
    'i18n/routing.ts locales and scripts/verify-export.mjs LOCALES disagree',
  );
});

test('every locale has a message catalogue on disk', async () => {
  const routing = await read('i18n/routing.ts');
  const locales = arrayLiteral(routing, 'export const locales');

  const missing = [];
  for (const locale of locales) {
    try {
      await access(path.resolve('messages', `${locale}.json`));
    } catch {
      missing.push(locale);
    }
  }
  assert.deepEqual(missing, [], 'locales declared with no catalogue');
});

test('every locale has an endonym and hreflang mapping', async () => {
  const routing = await read('i18n/routing.ts');
  const locales = arrayLiteral(routing, 'export const locales');

  for (const block of ['localeNames', 'hreflangFor', 'openGraphLocale']) {
    const start = routing.indexOf(block);
    const body = routing.slice(start, routing.indexOf('};', start));
    for (const locale of locales) {
      assert.ok(
        new RegExp(`\\b${locale}:`).test(body),
        `${block} is missing an entry for "${locale}"`,
      );
    }
  }
});
