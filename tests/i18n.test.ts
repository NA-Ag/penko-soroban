import { describe, expect, it } from 'vitest';
import { LANGUAGES, loadStrings, type Strings } from '../i18n';
import { en } from '../i18n/locales/en';

const OTHER = LANGUAGES.filter(l => l !== 'en');
const files = import.meta.glob<{ default: Strings }>('../i18n/locales/*.ts', { eager: true });

// Every string in a nested object, by dotted path ("lessons.five-add.intro", "places.0")
const flatten = (value: unknown, path = ''): [string, unknown][] =>
  value !== null && typeof value === 'object'
    ? Object.entries(value).flatMap(([k, v]) => flatten(v, path ? `${path}.${k}` : k))
    : [[path, value]];

const placeholders = (text: string) => [...text.matchAll(/\{(\w+)\}/g)].map(m => m[1]).sort();

const english = new Map(flatten(en));

// Real words, not counting {placeholders} or symbols: formulas like "{a} × {b} = {answer}" have none
const words = (text: string) => text.replace(/\{\w+\}/g, '').split(/\s+/).filter(w => /\p{L}{2,}/u.test(w)).length;

describe.each(OTHER)('%s', lang => {
  const file = files[`../i18n/locales/${lang}.ts`];

  it('has a language file', () => {
    expect(file, `i18n/locales/${lang}.ts is missing`).toBeTruthy();
  });

  if (!file) return;
  const strings = new Map(flatten(file.default));

  it('has exactly the same keys as English', () => {
    expect([...strings.keys()].sort()).toEqual([...english.keys()].sort());
  });

  it('has no empty strings', () => {
    const empty = [...strings].filter(([, v]) => typeof v !== 'string' || !v.trim()).map(([k]) => k);
    expect(empty).toEqual([]);
  });

  it('keeps every {placeholder}', () => {
    const broken = [...english]
      .filter(([k, v]) => typeof v === 'string' && strings.has(k) && placeholders(v).join() !== placeholders(String(strings.get(k))).join())
      .map(([k]) => k);
    expect(broken).toEqual([]);
  });

  // Short labels can match English (names, "OK"), but a whole sentence identical to English
  // is almost certainly untranslated
  it('has no sentences left in English', () => {
    const untranslated = [...english]
      .filter(([k, v]) => typeof v === 'string' && words(v) >= 4 && strings.get(k) === v && k !== 'appName')
      .map(([k]) => k);
    expect(untranslated).toEqual([]);
  });

  it('loads through the app loader', async () => {
    expect((await loadStrings(lang)).appName).toBeTruthy();
  });
});
