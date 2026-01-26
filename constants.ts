import { ExamLevel, LanguageOption } from './types';

export const LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English' },
  { code: 'ja', label: '日本語' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
  { code: 'zh', label: '中文' },
  { code: 'pt', label: 'Português' },
  { code: 'ru', label: 'Русский' },
  { code: 'uk', label: 'Українська' },
];

export const LEADERBOARD_KEY = 'penko_soroban_leaderboard';

export const EXAM_LEVELS: ExamLevel[] = [
  {
    id: 'kyu-10',
    name: '10th Kyu',
    digits: 1,
    count: 3,
    speedMs: 2000,
    passScore: 100, 
    description: "Beginner",
  },
  {
    id: 'kyu-9',
    name: '9th Kyu',
    digits: 1,
    count: 5,
    speedMs: 1800,
    passScore: 100,
    description: "Novice",
  },
  {
    id: 'kyu-8',
    name: '8th Kyu',
    digits: 2,
    count: 3,
    speedMs: 2500,
    passScore: 100,
    description: "Double Digits",
  },
  {
    id: 'kyu-5',
    name: '5th Kyu',
    digits: 2,
    count: 8,
    speedMs: 1500,
    passScore: 100,
    description: "Intermediate",
  },
  {
    id: 'kyu-1',
    name: '1st Kyu',
    digits: 3,
    count: 10,
    speedMs: 1000,
    passScore: 100,
    description: "Advanced",
  },
  {
    id: 'dan-1',
    name: '1st Dan',
    digits: 3,
    count: 15,
    speedMs: 800,
    passScore: 100,
    description: "Expert",
  },
    {
    id: 'dan-5',
    name: '5th Dan',
    digits: 4,
    count: 15,
    speedMs: 400,
    passScore: 100,
    description: "Grandmaster",
  }
];

// Realistic Wooden Palette
export const COLORS = {
    woodDark: '#3f1d0b', // Deep wood frame
    woodLight: '#78350f', // Lighter wood rods
    bead: '#92400e', // Standard bead wood
    beadHighlight: '#d97706', // Active bead
    rod: '#cbd5e1', // Metal rod
};