import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { readJson, writeJson } from './storage';

// Where the learner is in the course, saved in this browser only. Deliberately minimal: which
// lessons are finished (so "Continue" knows where to pick up) and which exams are passed (for
// the certificates). No dates, scores, streaks or activity of any kind are kept.
export interface Progress {
  version: 2;
  lessons: string[];
  exams: string[];
}

const KEY = 'penko-soroban/progress';
const EMPTY: Progress = { version: 2, lessons: [], exams: [] };

const isIdList = (value: unknown): value is string[] => Array.isArray(value) && value.every(v => typeof v === 'string');

// Accepts this version, and the first preview build's records (whose extra details are dropped)
export const parseProgress = (value: unknown): Progress | null => {
  if (!value || typeof value !== 'object') return null;
  const data = value as Record<string, unknown>;
  if (data.version === 2 && isIdList(data.lessons) && isIdList(data.exams)) return { version: 2, lessons: data.lessons, exams: data.exams };
  if (data.version === 1 && data.lessons && typeof data.lessons === 'object' && data.exams && typeof data.exams === 'object') {
    return { version: 2, lessons: Object.keys(data.lessons), exams: Object.keys(data.exams) };
  }
  return null;
};

// The previous Penko Soroban (1.x) kept a leaderboard of names and scores, the language and
// passed levels under these keys. None of it carries over; it's cleared rather than left behind.
const OLD_KEYS = ['penko_soroban_leaderboard', 'soroban_lang', 'soroban_passed_levels'];
const clearOldAppData = () => {
  try { OLD_KEYS.forEach(k => localStorage.removeItem(k)); } catch { /* storage unavailable: nothing to clear */ }
};

// Ask the browser to keep this site's storage even when the device runs low on space, so
// progress isn't silently cleared. Chrome and Safari decide on their own; Firefox asks the user,
// so this only runs once there's something worth keeping (a finished lesson, exam or restore).
const keepStorage = () => {
  try {
    navigator.storage?.persisted?.().then(already => { if (!already) navigator.storage.persist?.(); }).catch(() => undefined);
  } catch { /* not supported: storage stays best-effort, and backups still work */ }
};

interface ProgressApi {
  progress: Progress;
  lessonDone: (id: string) => boolean;
  examPassed: (id: string) => boolean;
  finishLesson: (id: string) => void;
  passExam: (id: string) => void;
  exportBackup: () => string;
  importBackup: (json: string) => boolean;
  reset: () => void;
}

const ProgressContext = createContext<ProgressApi | null>(null);

export const useProgress = () => {
  const value = useContext(ProgressContext);
  if (!value) throw new Error('useProgress must be used inside <ProgressProvider>');
  return value;
};

export const ProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [progress, setProgress] = useState<Progress>(() => {
    clearOldAppData();
    const saved = parseProgress(readJson<unknown>(KEY, null));
    // Rewrite older saves straight away, so details they held don't linger in storage
    if (saved) writeJson(KEY, saved);
    return saved ?? EMPTY;
  });

  const update = useCallback((change: (p: Progress) => Progress) => {
    setProgress(prev => {
      const next = change(prev);
      writeJson(KEY, next);
      return next;
    });
  }, []);

  const api = useMemo<ProgressApi>(() => ({
    progress,
    lessonDone: id => progress.lessons.includes(id),
    examPassed: id => progress.exams.includes(id),
    finishLesson: id => { keepStorage(); update(p => (p.lessons.includes(id) ? p : { ...p, lessons: [...p.lessons, id] })); },
    passExam: id => { keepStorage(); update(p => (p.exams.includes(id) ? p : { ...p, exams: [...p.exams, id] })); },
    exportBackup: () => JSON.stringify({ app: 'penko-soroban', ...progress }, null, 2),
    importBackup: json => {
      try {
        const { app, ...data } = JSON.parse(json);
        const parsed = app === 'penko-soroban' ? parseProgress(data) : null;
        if (!parsed) return false;
        update(() => parsed);
        keepStorage();
        return true;
      } catch {
        return false;
      }
    },
    reset: () => update(() => EMPTY),
  }), [progress, update]);

  return <ProgressContext.Provider value={api}>{children}</ProgressContext.Provider>;
};
