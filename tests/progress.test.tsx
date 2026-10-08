import { describe, expect, it } from 'vitest';
import { act, render } from '@testing-library/react';
import React from 'react';
import { parseProgress, ProgressProvider, useProgress } from '../core/progress';

describe('progress keeps only where you are in the course', () => {
  it('older saves lose everything but finished lessons and passed exams', () => {
    const v1 = {
      version: 1,
      lessons: { 'meet-beads': { stars: 3, at: '2026-10-01' } },
      exams: { 'kyu-10': { at: '2026-10-05', score: 93 } },
      days: ['2026-10-05'], solved: 40, correct: 37, bests: { tables: 12000 }, flashBest: { digits: 1, numbers: 5, ms: 1000 },
    };
    expect(parseProgress(v1)).toEqual({ version: 2, lessons: ['meet-beads'], exams: ['kyu-10'] });
  });

  it('rejects anything that is not a progress record', () => {
    expect(parseProgress(null)).toBeNull();
    expect(parseProgress({ version: 2, lessons: 'x', exams: [] })).toBeNull();
  });

  it('saves only lesson and exam ids, and clears the old app\'s data', () => {
    localStorage.setItem('penko_soroban_leaderboard', JSON.stringify([{ name: 'ABC', score: 9 }]));
    localStorage.setItem('soroban_passed_levels', '["kyu-10"]');
    let api: ReturnType<typeof useProgress> | null = null;
    const Probe = () => { api = useProgress(); return null; };
    render(<ProgressProvider><Probe /></ProgressProvider>);
    act(() => { api!.finishLesson('meet-beads'); api!.passExam('kyu-10'); });
    expect(JSON.parse(localStorage.getItem('penko-soroban/progress')!)).toEqual({ version: 2, lessons: ['meet-beads'], exams: ['kyu-10'] });
    expect(localStorage.getItem('penko_soroban_leaderboard')).toBeNull();
    expect(localStorage.getItem('soroban_passed_levels')).toBeNull();
  });
});
