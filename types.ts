export enum AppMode {
  HOME = 'HOME',
  PRACTICE = 'PRACTICE', // Free play & Interactive challenges
  FLASH_ANZAN = 'FLASH_ANZAN', // The actual game running
  EXAM_SELECT = 'EXAM_SELECT', // Selecting a belt level
  CUSTOM_SETUP = 'CUSTOM_SETUP', // Setting up custom training
  TUTORIAL = 'TUTORIAL' // Interactive walkthrough
}

export type Language = 'en' | 'ja' | 'es' | 'fr' | 'de' | 'zh' | 'pt' | 'ru' | 'uk';

export interface ExamLevel {
  id: string;
  name: string;
  digits: number;
  count: number; // How many numbers to sum
  speedMs: number; // Time per number
  passScore: number; // Required score
  description: string;
}

export interface FlashSettings {
  digits: number;
  count: number;
  interval: number; // ms
}

export interface HistoryItem {
  date: string;
  mode: string;
  score: string;
  result: 'PASS' | 'FAIL' | 'DONE';
}

export interface BeadColumn {
  value: number; // 0-9
}

export interface LanguageOption {
  code: Language;
  label: string;
}

export interface LeaderboardEntry {
  name: string;
  score: number;
  date: number;
  details: string;
}