import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

/**
 * Guards the server/client boundary.
 *
 * Every string on the site is resolved on the server. The three
 * interactive components — the header, the language menu and the
 * contact form — receive their strings as plain props, so no message
 * catalogue and no ICU formatter is shipped to the browser. That is
 * worth about 55 kB of JavaScript, and it removes a whole class of bug
 * where a client component renders a message key because its namespace
 * was not handed over.
 *
 * Reaching for `useTranslations` inside a client component would put
 * all of it back, silently. This test refuses.
 */

const TRANSLATION_APIS = [
  'useTranslations',
  'NextIntlClientProvider',
  'useMessages',
  'useFormatter',
];

/** Navigation helpers are routing, not message formatting. */
const ALLOWED_IMPORTS = new Set(['@/i18n/navigation']);

async function walk(dir, out = []) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(full, out);
    else if (/\.tsx?$/.test(entry.name)) out.push(full);
  }
  return out;
}

test('no client component pulls in the translation runtime', async () => {
  const files = [
    ...(await walk(path.resolve('components'))),
    ...(await walk(path.resolve('app'))),
  ];

  const problems = [];

  for (const file of files) {
    const source = await readFile(file, 'utf8');
    if (!/^\s*['"]use client['"]/m.test(source)) continue;

    const rel = path.relative(process.cwd(), file);

    for (const api of TRANSLATION_APIS) {
      if (new RegExp(`\\b${api}\\b`).test(source)) {
        problems.push(`${rel} uses ${api} — pass the strings as props instead`);
      }
    }

    for (const m of source.matchAll(/from\s+'([^']*next-intl[^']*)'/g)) {
      if (!ALLOWED_IMPORTS.has(m[1])) {
        problems.push(`${rel} imports from '${m[1]}'`);
      }
    }
  }

  assert.deepEqual(problems, []);
});

test('at least one client component exists, so the check is meaningful', async () => {
  const files = await walk(path.resolve('components'));
  let found = 0;
  for (const file of files) {
    const source = await readFile(file, 'utf8');
    if (/^\s*['"]use client['"]/m.test(source)) found += 1;
  }
  assert.ok(found >= 3, `expected the interactive components, found ${found}`);
});
