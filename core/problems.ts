// Problem generators. Lessons and drills ask for problems that practise a given technique
// and use only techniques already taught; exams and mental math ask for plain number lists.

import { AbacusError, emptyBoard, planOperation, type Op, type Technique } from './abacus';

export type Random = () => number;

// Seeded random numbers, so tests (and "try the same set again") can repeat a sequence
export const seededRandom = (seed: number): Random => {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13; s >>>= 0;
    s ^= s >>> 17;
    s ^= s << 5; s >>>= 0;
    return s / 2 ** 32;
  };
};

export const randomInt = (random: Random, min: number, max: number) => min + Math.floor(random() * (max - min + 1));

// A number with exactly `digits` digits (1 digit: 1-9)
export const randomWithDigits = (random: Random, digits: number) =>
  digits === 1 ? randomInt(random, 1, 9) : randomInt(random, 10 ** (digits - 1), 10 ** digits - 1);

export interface Term { op: Op; value: number }

// A list problem in the soroban style: start from zero, add or subtract each term in turn
export interface ListProblem {
  kind: 'list';
  terms: Term[];
  answer: number;
  // Running total after each term
  totals: number[];
}

export interface ListSpec {
  digits: number | readonly [number, number];
  terms: number;
  ops: '+' | '-' | '+-';
  // Techniques that may appear; anything else is rejected
  allow: readonly Technique[];
  // At least one step must use one of these (what the lesson is about)
  require?: readonly Technique[];
  rods?: number;
}

export const ALL_TECHNIQUES: readonly Technique[] = ['direct', 'five', 'ten', 'ten-five'];

const pickDigits = (random: Random, digits: ListSpec['digits']) =>
  typeof digits === 'number' ? digits : randomInt(random, digits[0], digits[1]);

const maxDigits = (digits: ListSpec['digits']) => (typeof digits === 'number' ? digits : digits[1]);

export const rodsFor = (spec: Pick<ListSpec, 'digits' | 'terms' | 'ops'>) =>
  maxDigits(spec.digits) + (spec.ops === '-' ? 1 : Math.ceil(Math.log10(spec.terms + 1)) + 1);

export const listProblem = (spec: ListSpec, random: Random = Math.random): ListProblem => {
  const rods = spec.rods ?? rodsFor(spec);
  for (let attempt = 0; attempt < 400; attempt++) {
    const terms: Term[] = [];
    const totals: number[] = [];
    const used = new Set<Technique>();
    let board = emptyBoard(rods);
    let total = 0;
    let ok = true;
    for (let i = 0; i < spec.terms && ok; i++) {
      let placed = false;
      for (let tries = 0; tries < 60 && !placed; tries++) {
        // The first term starts the list, so it's always added; subtraction-only lists start
        // with a bigger number to have something to take away from
        const op: Op = i === 0 ? '+' : spec.ops === '+-' ? (random() < 0.5 ? '-' : '+') : spec.ops;
        const digits = pickDigits(random, spec.digits);
        const value = randomWithDigits(random, i === 0 && spec.ops === '-' ? Math.min(digits + 1, rods - 1) : digits);
        if (op === '-' && value > total) continue;
        if (i > 0 && value === terms[i - 1].value) continue; // no repeats in a row
        try {
          const steps = planOperation(board, op, value);
          if (steps.some(s => !spec.allow.includes(s.technique))) continue;
          steps.forEach(s => used.add(s.technique));
          board = steps.length ? steps[steps.length - 1].after : board;
          total = op === '+' ? total + value : total - value;
          terms.push({ op, value });
          totals.push(total);
          placed = true;
        } catch (e) {
          if (!(e instanceof AbacusError)) throw e;
        }
      }
      if (!placed) ok = false;
    }
    if (!ok) continue;
    if (spec.require && ![...used].some(t => spec.require!.includes(t))) continue;
    return { kind: 'list', terms, answer: total, totals };
  }
  throw new Error(`Couldn't make a problem for ${JSON.stringify(spec)}`);
};

// Plain additions for Flash Anzan: positive numbers, no number twice in a row
export const flashNumbers = (digits: number, count: number, random: Random = Math.random) => {
  const out: number[] = [];
  while (out.length < count) {
    const n = randomWithDigits(random, digits);
    if (n !== out[out.length - 1]) out.push(n);
  }
  return out;
};

// Multiplication and division problems
export interface MulProblem { kind: 'mul'; a: number; b: number; answer: number }
export interface DivProblem { kind: 'div'; dividend: number; divisor: number; answer: number; remainder: number }

export const mulProblem = (aDigits: number, bDigits: number, random: Random = Math.random): MulProblem => {
  let a = 0;
  let b = 0;
  // Avoid trivial factors (x1, x10) and round numbers that teach nothing
  do {
    a = randomWithDigits(random, aDigits);
    b = randomWithDigits(random, bDigits);
  } while (b === 1 || a % 10 === 0 || b % 10 === 0);
  return { kind: 'mul', a, b, answer: a * b };
};

// Exact division unless `remainder` is allowed. The quotient has `quotientDigits` digits.
export const divProblem = (quotientDigits: number, divisorDigits: number, remainder = false, random: Random = Math.random): DivProblem => {
  let divisor = 0;
  let quotient = 0;
  do {
    divisor = randomWithDigits(random, divisorDigits);
    quotient = randomWithDigits(random, quotientDigits);
  } while (divisor === 1 || divisor % 10 === 0 || quotient % 10 === 0);
  const rest = remainder ? randomInt(random, 1, divisor - 1) : 0;
  return { kind: 'div', dividend: divisor * quotient + rest, divisor, answer: quotient, remainder: rest };
};

// Times-table and complement quick questions
export const tableQuestion = (random: Random = Math.random) => {
  const a = randomInt(random, 2, 9);
  const b = randomInt(random, 2, 9);
  return { a, b, answer: a * b };
};
