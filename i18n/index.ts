import { en, type Strings } from './locales/en';

export type { Strings } from './locales/en';

// The same 16 languages as Penko Plaza. Native names, in picker order.
export const languageNames = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  it: 'Italiano',
  pt: 'Português',
  pl: 'Polski',
  tr: 'Türkçe',
  ru: 'Русский',
  uk: 'Українська',
  hi: 'हिन्दी',
  id: 'Bahasa Indonesia',
  vi: 'Tiếng Việt',
  zh: '中文',
  ja: '日本語',
  ko: '한국어',
} as const;

export type Language = keyof typeof languageNames;

export const LANGUAGES = Object.keys(languageNames) as Language[];

export const isLanguage = (value: unknown): value is Language => typeof value === 'string' && value in languageNames;

// The browser's language if we have it, else English
export const browserLanguage = (): Language => {
  for (const tag of navigator.languages ?? [navigator.language]) {
    const code = tag.toLowerCase().split('-')[0];
    if (isLanguage(code)) return code;
  }
  return 'en';
};

// English ships in the main bundle; every other language is its own chunk, loaded when
// chosen (the service worker precaches them all, so switching works offline too).
// A language without a file yet falls back to English.
const files = import.meta.glob<{ default: Strings }>(['./locales/*.ts', '!./locales/en.ts']);

const cache = new Map<Language, Strings>([['en', en]]);

export const loadStrings = async (lang: Language): Promise<Strings> => {
  const cached = cache.get(lang);
  if (cached) return cached;
  const load = files[`./locales/${lang}.ts`];
  const strings = load ? (await load()).default : en;
  cache.set(lang, strings);
  return strings;
};

// Fills {placeholders} in a string: fill('Rod {n}', { n: 3 }) -> 'Rod 3'
export const fill = (text: string, values: Record<string, string | number>) =>
  text.replace(/\{(\w+)\}/g, (match, key) => (key in values ? String(values[key]) : match));
