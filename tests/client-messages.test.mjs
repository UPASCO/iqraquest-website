import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

/**
 * Guards the server/client message boundary.
 *
 * `SiteShell` ships only the namespaces in `CLIENT_NAMESPACES` to the
 * browser. A client component that reads a namespace outside that list
 * finds no message at runtime and renders the key — a defect that
 * compiles, typechecks and only shows up in the browser.
 *
 * This walks every file marked 'use client', extracts the namespaces it
 * reads, and asserts each one is shipped.
 */

async function walk(dir, out = []) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(full, out);
    else if (/\.tsx?$/.test(entry.name)) out.push(full);
  }
  return out;
}

test('every namespace a client component reads is shipped to the client', async () => {
  const shipped = new Set(
    [
      ...(await readFile(path.resolve('i18n/client-namespaces.ts'), 'utf8'))
        .slice(
          (await readFile(path.resolve('i18n/client-namespaces.ts'), 'utf8'))
            .indexOf('CLIENT_NAMESPACES'),
        )
        .matchAll(/'([a-zA-Z]+)'/g),
    ].map((m) => m[1]),
  );

  const files = [
    ...(await walk(path.resolve('components'))),
    ...(await walk(path.resolve('app'))),
  ];

  const problems = [];

  for (const file of files) {
    const source = await readFile(file, 'utf8');
    if (!/^['"]use client['"]/m.test(source)) continue;

    const used = new Set();

    // useTranslations('gamePage') and useTranslations('gamePage.faq')
    for (const m of source.matchAll(/useTranslations\(\s*'([a-zA-Z]+)/g)) {
      used.add(m[1]);
    }
    // useTranslations() followed by t('nav.game') — the namespace is the
    // first segment of the key.
    if (/useTranslations\(\s*\)/.test(source)) {
      for (const m of source.matchAll(/\bt\(\s*[`']([a-zA-Z]+)\./g)) {
        used.add(m[1]);
      }
    }

    for (const ns of used) {
      if (!shipped.has(ns)) {
        problems.push(
          `${path.relative(process.cwd(), file)} reads "${ns}", which is not in CLIENT_NAMESPACES`,
        );
      }
    }
  }

  assert.deepEqual(problems, []);
});
