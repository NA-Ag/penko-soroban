// The course content: every lesson as a list of activities. The words Penko says live in the
// language files (lessons.<lesson id>.<text key>); this file is the structure, numbers and checks.

import type { Technique } from './abacus';
import type { ListSpec, Term } from './problems';
import type { UnitId } from './course';

// What a lesson asks the learner to do, one screen at a time
export type Activity =
  // Penko explains, optionally with an abacus showing a number
  | { type: 'say'; text: string; board?: { value: number; rods: number; glow?: 'heaven' | 'earth' | 'beam' } }
  // Show these numbers on the abacus
  | { type: 'set'; text?: string; values: number[]; rods: number }
  // Show random numbers with this many digits
  | { type: 'set-random'; text?: string; digits: number; count: number; rods: number }
  // Read the abacus and type the number
  | { type: 'read'; text?: string; digits: number; count: number; rods: number }
  // Penko walks through a problem move by move: the glowing beads show what to do
  | { type: 'guided'; text?: string; start: number; terms: Term[]; rods: number; teaches?: Technique }
  // Problems on the abacus; hints on request
  | { type: 'abacus'; text?: string; spec: ListSpec; count: number }
  // Typed answers: what makes 5 or 10 with n, or a times-table fact
  | { type: 'quiz'; text?: string; kind: 'five' | 'ten' | 'table'; count: number }
  // Multiplication on the abacus, one digit pair at a time
  | { type: 'mul'; text?: string; problems: [number, number][] | { a: number; b: number; count: number } }
  // Division on the abacus: choose each answer digit, then subtract
  | { type: 'div'; text?: string; problems: [number, number][] | { quotient: number; divisor: number; remainder?: boolean; count: number } }
  // A soroban flashes for a moment: type the number it showed
  | { type: 'bead-flash'; text?: string; digits: number; count: number; ms: number }
  // Problems in your head, typed answers (the abacus can be peeked at as a hint)
  | { type: 'mental'; text?: string; spec: ListSpec; count: number }
  // Flash Anzan: numbers flash one at a time, type the total
  | { type: 'flash'; text?: string; digits: number; numbers: number; ms: number; rounds: number };

export interface Lesson {
  id: string;
  unit: UnitId;
  activities: Activity[];
}

const add = (value: number): Term => ({ op: '+', value });
const sub = (value: number): Term => ({ op: '-', value });

const DIRECT: Technique[] = ['direct'];
const FIVE: Technique[] = ['direct', 'five'];
const TEN: Technique[] = ['direct', 'five', 'ten'];
const ALL: Technique[] = ['direct', 'five', 'ten', 'ten-five'];

export const LESSONS: Lesson[] = [
  // ── Unit 1: Meet the soroban ───────────────────────────────────────────────
  {
    id: 'meet-beads', unit: 'meet', activities: [
      { type: 'say', text: 'intro', board: { value: 0, rods: 3 } },
      { type: 'say', text: 'heaven', board: { value: 5, rods: 1, glow: 'heaven' } },
      { type: 'say', text: 'earth', board: { value: 3, rods: 1, glow: 'earth' } },
      { type: 'say', text: 'count', board: { value: 7, rods: 1 } },
      { type: 'set', text: 'setEarth', values: [1, 3, 4, 2], rods: 1 },
      { type: 'set', text: 'setHeaven', values: [5, 7, 9, 6], rods: 1 },
      { type: 'say', text: 'fingers' },
      { type: 'set-random', digits: 1, count: 5, rods: 1 },
    ],
  },
  {
    id: 'meet-places', unit: 'meet', activities: [
      { type: 'say', text: 'places', board: { value: 352, rods: 5 } },
      { type: 'say', text: 'dots', board: { value: 0, rods: 7, glow: 'beam' } },
      { type: 'set', values: [23, 40, 105, 350], rods: 4 },
      { type: 'set-random', digits: 2, count: 4, rods: 4 },
      { type: 'set-random', digits: 3, count: 3, rods: 4 },
    ],
  },
  {
    id: 'meet-read', unit: 'meet', activities: [
      { type: 'say', text: 'intro', board: { value: 68, rods: 3 } },
      { type: 'read', digits: 1, count: 3, rods: 3 },
      { type: 'read', digits: 2, count: 3, rods: 3 },
      { type: 'read', digits: 3, count: 3, rods: 4 },
    ],
  },

  // ── Unit 2: Direct moves ───────────────────────────────────────────────────
  {
    id: 'direct-earth', unit: 'direct', activities: [
      { type: 'say', text: 'intro' },
      { type: 'guided', start: 2, terms: [add(1)], rods: 2, teaches: 'direct' },
      { type: 'guided', start: 1, terms: [add(3)], rods: 2, teaches: 'direct' },
      { type: 'guided', start: 11, terms: [add(12)], rods: 3, teaches: 'direct' },
      { type: 'abacus', spec: { digits: 1, terms: 2, ops: '+', allow: DIRECT }, count: 5 },
    ],
  },
  {
    id: 'direct-heaven', unit: 'direct', activities: [
      { type: 'say', text: 'intro' },
      { type: 'guided', start: 2, terms: [add(5)], rods: 2, teaches: 'direct' },
      { type: 'guided', start: 1, terms: [add(7)], rods: 2, teaches: 'direct' },
      { type: 'guided', start: 3, terms: [add(6)], rods: 2, teaches: 'direct' },
      { type: 'abacus', spec: { digits: 1, terms: 3, ops: '+', allow: DIRECT }, count: 5 },
    ],
  },
  {
    id: 'direct-sub', unit: 'direct', activities: [
      { type: 'say', text: 'intro' },
      { type: 'guided', start: 4, terms: [sub(3)], rods: 2, teaches: 'direct' },
      { type: 'guided', start: 8, terms: [sub(5)], rods: 2, teaches: 'direct' },
      { type: 'guided', start: 9, terms: [sub(7)], rods: 2, teaches: 'direct' },
      { type: 'abacus', spec: { digits: 1, terms: 3, ops: '+-', allow: DIRECT }, count: 5 },
    ],
  },
  {
    id: 'direct-two', unit: 'direct', activities: [
      { type: 'say', text: 'intro' },
      { type: 'guided', start: 12, terms: [add(31)], rods: 3, teaches: 'direct' },
      { type: 'guided', start: 58, terms: [sub(23)], rods: 3, teaches: 'direct' },
      { type: 'abacus', spec: { digits: 2, terms: 3, ops: '+-', allow: DIRECT }, count: 5 },
    ],
  },

  // ── Unit 3: Small friends ──────────────────────────────────────────────────
  {
    id: 'five-meet', unit: 'five', activities: [
      { type: 'say', text: 'problem', board: { value: 4, rods: 1 } },
      { type: 'say', text: 'friends' },
      { type: 'quiz', kind: 'five', count: 6 },
    ],
  },
  {
    id: 'five-add', unit: 'five', activities: [
      { type: 'say', text: 'intro', board: { value: 4, rods: 1 } },
      { type: 'guided', start: 4, terms: [add(1)], rods: 2, teaches: 'five' },
      { type: 'guided', start: 3, terms: [add(2)], rods: 2, teaches: 'five' },
      { type: 'guided', start: 2, terms: [add(4)], rods: 2, teaches: 'five' },
      { type: 'guided', start: 4, terms: [add(4)], rods: 2, teaches: 'five' },
      { type: 'abacus', spec: { digits: 1, terms: 2, ops: '+', allow: FIVE, require: ['five'] }, count: 6 },
    ],
  },
  {
    id: 'five-sub', unit: 'five', activities: [
      { type: 'say', text: 'intro', board: { value: 5, rods: 1 } },
      { type: 'guided', start: 5, terms: [sub(1)], rods: 2, teaches: 'five' },
      { type: 'guided', start: 6, terms: [sub(3)], rods: 2, teaches: 'five' },
      { type: 'guided', start: 7, terms: [sub(4)], rods: 2, teaches: 'five' },
      { type: 'abacus', spec: { digits: 1, terms: 3, ops: '+-', allow: FIVE, require: ['five'] }, count: 6 },
    ],
  },
  {
    id: 'five-practice', unit: 'five', activities: [
      { type: 'say', text: 'intro' },
      { type: 'abacus', spec: { digits: 1, terms: 4, ops: '+-', allow: FIVE, require: ['five'] }, count: 6 },
      { type: 'abacus', spec: { digits: 2, terms: 3, ops: '+-', allow: FIVE, require: ['five'] }, count: 4 },
    ],
  },

  // ── Unit 4: Big friends ────────────────────────────────────────────────────
  {
    id: 'ten-meet', unit: 'ten', activities: [
      { type: 'say', text: 'problem', board: { value: 7, rods: 2 } },
      { type: 'say', text: 'friends' },
      { type: 'quiz', kind: 'ten', count: 8 },
    ],
  },
  {
    id: 'ten-add', unit: 'ten', activities: [
      { type: 'say', text: 'intro', board: { value: 7, rods: 2 } },
      { type: 'guided', start: 7, terms: [add(5)], rods: 2, teaches: 'ten' },
      { type: 'guided', start: 9, terms: [add(1)], rods: 2, teaches: 'ten' },
      { type: 'guided', start: 4, terms: [add(9)], rods: 2, teaches: 'ten' },
      { type: 'guided', start: 8, terms: [add(3)], rods: 2, teaches: 'ten' },
      { type: 'abacus', spec: { digits: 1, terms: 2, ops: '+', allow: TEN, require: ['ten'] }, count: 6 },
    ],
  },
  {
    id: 'ten-sub', unit: 'ten', activities: [
      { type: 'say', text: 'intro', board: { value: 12, rods: 2 } },
      { type: 'guided', start: 12, terms: [sub(5)], rods: 2, teaches: 'ten' },
      { type: 'guided', start: 10, terms: [sub(1)], rods: 2, teaches: 'ten' },
      { type: 'guided', start: 15, terms: [sub(9)], rods: 2, teaches: 'ten' },
      { type: 'abacus', spec: { digits: 1, terms: 3, ops: '+-', allow: TEN, require: ['ten'] }, count: 6 },
    ],
  },
  {
    id: 'ten-practice', unit: 'ten', activities: [
      { type: 'say', text: 'intro' },
      { type: 'abacus', spec: { digits: 1, terms: 4, ops: '+-', allow: TEN, require: ['ten'] }, count: 6 },
      { type: 'abacus', spec: { digits: 2, terms: 3, ops: '+-', allow: TEN, require: ['ten'] }, count: 4 },
    ],
  },

  // ── Unit 5: Both friends at once ───────────────────────────────────────────
  {
    id: 'mixed-add', unit: 'mixed', activities: [
      { type: 'say', text: 'intro', board: { value: 5, rods: 2 } },
      { type: 'guided', start: 5, terms: [add(6)], rods: 2, teaches: 'ten-five' },
      { type: 'guided', start: 6, terms: [add(7)], rods: 2, teaches: 'ten-five' },
      { type: 'guided', start: 8, terms: [add(6)], rods: 2, teaches: 'ten-five' },
      { type: 'abacus', spec: { digits: 1, terms: 2, ops: '+', allow: ALL, require: ['ten-five'] }, count: 6 },
    ],
  },
  {
    id: 'mixed-sub', unit: 'mixed', activities: [
      { type: 'say', text: 'intro', board: { value: 11, rods: 2 } },
      { type: 'guided', start: 11, terms: [sub(6)], rods: 2, teaches: 'ten-five' },
      { type: 'guided', start: 12, terms: [sub(7)], rods: 2, teaches: 'ten-five' },
      { type: 'guided', start: 14, terms: [sub(9)], rods: 2, teaches: 'ten-five' },
      { type: 'abacus', spec: { digits: 1, terms: 3, ops: '+-', allow: ALL, require: ['ten-five'] }, count: 6 },
    ],
  },
  {
    id: 'mixed-practice', unit: 'mixed', activities: [
      { type: 'say', text: 'intro' },
      { type: 'abacus', spec: { digits: 1, terms: 5, ops: '+-', allow: ALL }, count: 6 },
      { type: 'abacus', spec: { digits: 2, terms: 4, ops: '+-', allow: ALL }, count: 4 },
    ],
  },

  // ── Unit 6: Bigger numbers ─────────────────────────────────────────────────
  {
    id: 'multi-carry', unit: 'multi', activities: [
      { type: 'say', text: 'intro', board: { value: 99, rods: 3 } },
      { type: 'guided', start: 99, terms: [add(1)], rods: 3 },
      { type: 'guided', start: 195, terms: [add(8)], rods: 4 },
      { type: 'guided', start: 1000, terms: [sub(1)], rods: 4 },
      { type: 'abacus', spec: { digits: 2, terms: 3, ops: '+-', allow: ALL }, count: 5 },
    ],
  },
  {
    id: 'multi-lists', unit: 'multi', activities: [
      { type: 'say', text: 'intro' },
      { type: 'abacus', spec: { digits: 2, terms: 5, ops: '+-', allow: ALL }, count: 4 },
      { type: 'abacus', spec: { digits: 3, terms: 4, ops: '+-', allow: ALL }, count: 3 },
    ],
  },
  {
    id: 'multi-big', unit: 'multi', activities: [
      { type: 'say', text: 'intro' },
      { type: 'abacus', spec: { digits: [3, 4], terms: 4, ops: '+-', allow: ALL }, count: 4 },
    ],
  },

  // ── Unit 7: Multiplication ─────────────────────────────────────────────────
  {
    id: 'mul-tables', unit: 'multiply', activities: [
      { type: 'say', text: 'intro' },
      { type: 'quiz', kind: 'table', count: 12 },
    ],
  },
  {
    id: 'mul-one', unit: 'multiply', activities: [
      { type: 'say', text: 'intro' },
      { type: 'say', text: 'places' },
      { type: 'mul', problems: [[34, 6], [21, 4]] },
      { type: 'mul', problems: { a: 2, b: 1, count: 3 } },
      { type: 'mul', problems: { a: 3, b: 1, count: 2 } },
    ],
  },
  {
    id: 'mul-two', unit: 'multiply', activities: [
      { type: 'say', text: 'intro' },
      { type: 'mul', problems: [[23, 14]] },
      { type: 'mul', problems: { a: 2, b: 2, count: 3 } },
      { type: 'mul', problems: { a: 3, b: 2, count: 2 } },
    ],
  },

  // ── Unit 8: Division ───────────────────────────────────────────────────────
  {
    id: 'div-one', unit: 'divide', activities: [
      { type: 'say', text: 'intro' },
      { type: 'say', text: 'steps' },
      { type: 'div', problems: [[84, 4], [75, 5]] },
      { type: 'div', problems: { quotient: 2, divisor: 1, count: 3 } },
      { type: 'div', problems: { quotient: 3, divisor: 1, count: 2 } },
    ],
  },
  {
    id: 'div-remainder', unit: 'divide', activities: [
      { type: 'say', text: 'intro' },
      { type: 'div', problems: [[47, 3]] },
      { type: 'div', problems: { quotient: 2, divisor: 1, remainder: true, count: 4 } },
    ],
  },
  {
    id: 'div-two', unit: 'divide', activities: [
      { type: 'say', text: 'intro' },
      { type: 'div', problems: [[312, 24]] },
      { type: 'div', problems: { quotient: 2, divisor: 2, count: 3 } },
    ],
  },

  // ── Unit 9: The soroban in your head ───────────────────────────────────────
  {
    id: 'anzan-picture', unit: 'anzan', activities: [
      { type: 'say', text: 'intro' },
      { type: 'bead-flash', digits: 1, count: 4, ms: 1500 },
      { type: 'bead-flash', digits: 2, count: 4, ms: 1500 },
      { type: 'bead-flash', digits: 3, count: 3, ms: 2000 },
    ],
  },
  {
    id: 'anzan-beads', unit: 'anzan', activities: [
      { type: 'say', text: 'intro' },
      { type: 'mental', spec: { digits: 1, terms: 2, ops: '+', allow: ALL }, count: 6 },
      { type: 'mental', spec: { digits: 1, terms: 3, ops: '+-', allow: ALL }, count: 6 },
    ],
  },
  {
    id: 'anzan-flash', unit: 'anzan', activities: [
      { type: 'say', text: 'intro' },
      { type: 'flash', digits: 1, numbers: 3, ms: 1500, rounds: 3 },
      { type: 'flash', digits: 1, numbers: 5, ms: 1200, rounds: 3 },
    ],
  },
  {
    id: 'anzan-graduate', unit: 'anzan', activities: [
      { type: 'say', text: 'intro' },
      { type: 'mental', spec: { digits: 2, terms: 3, ops: '+-', allow: ALL }, count: 5 },
      { type: 'say', text: 'next' },
    ],
  },
];

export const lessonsIn = (unit: UnitId) => LESSONS.filter(l => l.unit === unit);
export const findLesson = (id: string) => LESSONS.find(l => l.id === id);
