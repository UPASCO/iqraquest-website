import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

/**
 * Message-catalogue parity.
 *
 * Twelve languages are only maintainable if the build refuses to ship a
 * catalogue that has drifted. These tests fail on a missing key, an
 * extra key, an array that changed length (the UI indexes into several
 * of them) and, most importantly, a lost ICU placeholder — a
 * `{email}` dropped in translation renders the literal braces to a
 * visitor.
 */

const MESSAGES_DIR = path.resolve('messages');
const REFERENCE = 'fr';

async function load(locale) {
  return JSON.parse(
    await readFile(path.join(MESSAGES_DIR, `${locale}.json`), 'utf8'),
  );
}

/** Flattens to `a.b.0.c` paths, recording the shape at each leaf. */
function flatten(value, prefix = '', out = new Map()) {
  if (Array.isArray(value)) {
    out.set(prefix, `array:${value.length}`);
    value.forEach((item, index) => flatten(item, `${prefix}.${index}`, out));
  } else if (value && typeof value === 'object') {
    out.set(prefix, 'object');
    for (const [key, child] of Object.entries(value)) {
      flatten(child, prefix ? `${prefix}.${key}` : key, out);
    }
  } else {
    out.set(prefix, typeof value);
  }
  return out;
}

/** Every `{placeholder}` in a message, as a sorted list. */
function placeholders(text) {
  return [...text.matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort();
}

function leafStrings(value, prefix = '', out = new Map()) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => leafStrings(item, `${prefix}.${index}`, out));
  } else if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) {
      leafStrings(child, prefix ? `${prefix}.${key}` : key, out);
    }
  } else if (typeof value === 'string') {
    out.set(prefix, value);
  }
  return out;
}

const files = (await readdir(MESSAGES_DIR)).filter((f) => f.endsWith('.json'));
const locales = files.map((f) => f.replace('.json', '')).sort();
const reference = await load(REFERENCE);
const referenceShape = flatten(reference);
const referenceStrings = leafStrings(reference);

test('the reference catalogue exists', () => {
  assert.ok(locales.includes(REFERENCE), 'messages/fr.json is missing');
});

for (const locale of locales) {
  if (locale === REFERENCE) continue;

  test(`${locale}: structure matches ${REFERENCE}`, async () => {
    const shape = flatten(await load(locale));

    const missing = [...referenceShape.keys()].filter((k) => !shape.has(k));
    const extra = [...shape.keys()].filter((k) => !referenceShape.has(k));
    assert.deepEqual(missing, [], `${locale}: missing keys`);
    assert.deepEqual(extra, [], `${locale}: unexpected keys`);

    const mismatched = [...referenceShape.entries()]
      .filter(([key, kind]) => shape.get(key) !== kind)
      .map(([key, kind]) => `${key}: expected ${kind}, got ${shape.get(key)}`);
    assert.deepEqual(mismatched, [], `${locale}: shape mismatch`);
  });

  test(`${locale}: ICU placeholders survive translation`, async () => {
    const strings = leafStrings(await load(locale));
    const broken = [];

    // Checked in both directions. A dropped placeholder renders literal
    // braces to a visitor; an ADDED one is worse — next-intl throws on
    // the missing parameter and falls back to printing the message key.
    for (const [key, source] of referenceStrings) {
      const expected = placeholders(source);
      const actual = placeholders(strings.get(key) ?? '');
      if (JSON.stringify(expected) !== JSON.stringify(actual)) {
        broken.push(
          `${key}: French has [${expected}], ${locale} has [${actual}]`,
        );
      }
    }
    assert.deepEqual(broken, [], `${locale}: placeholder drift`);
  });

  test(`${locale}: no message was left untranslated as an empty string`, async () => {
    const strings = leafStrings(await load(locale));
    const empty = [...strings.entries()]
      .filter(([, value]) => value.trim().length === 0)
      .map(([key]) => key);
    assert.deepEqual(empty, [], `${locale}: empty messages`);
  });
}
