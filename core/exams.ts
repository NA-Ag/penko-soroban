// Grading exams, from 10 Kyu (beginner) to 5 Dan, in the style of Japanese soroban grading.
// Each has three parts: problems on the soroban, mental math and Flash Anzan. To pass you need
// 80% overall and at least 60% in each part.

import { ALL_TECHNIQUES, divProblem, flashNumbers, listProblem, mulProblem, type ListProblem, type Random } from './problems';

export type Grade = { kind: 'kyu' | 'dan'; n: number };

export interface ExamDef {
  id: string;
  grade: Grade;
  // Soroban part: list problems, plus some multiplication / division from the middle grades
  abacus: { digits: number; terms: number; ops: '+' | '+-'; mul?: [number, number]; div?: [number, number] };
  mental: { digits: number; terms: number; ops: '+' | '+-' };
  flash: { digits: number; numbers: number; ms: number };
  // Minutes allowed for the soroban and mental parts
  minutes: { abacus: number; mental: number };
}

const kyu = (n: number, def: Omit<ExamDef, 'id' | 'grade'>): ExamDef => ({ id: `kyu-${n}`, grade: { kind: 'kyu', n }, ...def });
const dan = (n: number, def: Omit<ExamDef, 'id' | 'grade'>): ExamDef => ({ id: `dan-${n}`, grade: { kind: 'dan', n }, ...def });

export const EXAMS: ExamDef[] = [
  kyu(10, { abacus: { digits: 1, terms: 4, ops: '+' }, mental: { digits: 1, terms: 3, ops: '+' }, flash: { digits: 1, numbers: 3, ms: 1500 }, minutes: { abacus: 5, mental: 3 } }),
  kyu(9, { abacus: { digits: 1, terms: 6, ops: '+' }, mental: { digits: 1, terms: 4, ops: '+' }, flash: { digits: 1, numbers: 4, ms: 1200 }, minutes: { abacus: 5, mental: 3 } }),
  kyu(8, { abacus: { digits: 1, terms: 8, ops: '+-' }, mental: { digits: 1, terms: 5, ops: '+-' }, flash: { digits: 1, numbers: 5, ms: 1000 }, minutes: { abacus: 5, mental: 3 } }),
  kyu(7, { abacus: { digits: 2, terms: 4, ops: '+' }, mental: { digits: 1, terms: 6, ops: '+-' }, flash: { digits: 1, numbers: 7, ms: 900 }, minutes: { abacus: 5, mental: 3 } }),
  kyu(6, { abacus: { digits: 2, terms: 5, ops: '+-', mul: [2, 1] }, mental: { digits: 2, terms: 3, ops: '+' }, flash: { digits: 1, numbers: 10, ms: 800 }, minutes: { abacus: 6, mental: 3 } }),
  kyu(5, { abacus: { digits: 2, terms: 6, ops: '+-', mul: [2, 1] }, mental: { digits: 2, terms: 3, ops: '+-' }, flash: { digits: 2, numbers: 3, ms: 1200 }, minutes: { abacus: 6, mental: 3 } }),
  kyu(4, { abacus: { digits: 3, terms: 4, ops: '+-', mul: [3, 1], div: [2, 1] }, mental: { digits: 2, terms: 4, ops: '+-' }, flash: { digits: 2, numbers: 4, ms: 1000 }, minutes: { abacus: 7, mental: 4 } }),
  kyu(3, { abacus: { digits: 3, terms: 5, ops: '+-', mul: [2, 2], div: [3, 1] }, mental: { digits: 2, terms: 5, ops: '+-' }, flash: { digits: 2, numbers: 5, ms: 900 }, minutes: { abacus: 7, mental: 4 } }),
  kyu(2, { abacus: { digits: 3, terms: 6, ops: '+-', mul: [3, 2], div: [2, 2] }, mental: { digits: 2, terms: 6, ops: '+-' }, flash: { digits: 2, numbers: 7, ms: 800 }, minutes: { abacus: 8, mental: 4 } }),
  kyu(1, { abacus: { digits: 4, terms: 5, ops: '+-', mul: [3, 2], div: [3, 2] }, mental: { digits: 3, terms: 4, ops: '+-' }, flash: { digits: 2, numbers: 10, ms: 700 }, minutes: { abacus: 8, mental: 5 } }),
  dan(1, { abacus: { digits: 4, terms: 6, ops: '+-', mul: [3, 3], div: [3, 2] }, mental: { digits: 3, terms: 5, ops: '+-' }, flash: { digits: 3, numbers: 5, ms: 800 }, minutes: { abacus: 8, mental: 5 } }),
  dan(2, { abacus: { digits: 4, terms: 8, ops: '+-', mul: [4, 3], div: [4, 2] }, mental: { digits: 3, terms: 6, ops: '+-' }, flash: { digits: 3, numbers: 7, ms: 700 }, minutes: { abacus: 9, mental: 5 } }),
  dan(3, { abacus: { digits: 5, terms: 6, ops: '+-', mul: [4, 3], div: [4, 3] }, mental: { digits: 3, terms: 8, ops: '+-' }, flash: { digits: 3, numbers: 10, ms: 600 }, minutes: { abacus: 9, mental: 6 } }),
  dan(4, { abacus: { digits: 5, terms: 8, ops: '+-', mul: [4, 4], div: [5, 3] }, mental: { digits: 4, terms: 5, ops: '+-' }, flash: { digits: 3, numbers: 12, ms: 500 }, minutes: { abacus: 10, mental: 6 } }),
  dan(5, { abacus: { digits: 6, terms: 8, ops: '+-', mul: [5, 4], div: [5, 4] }, mental: { digits: 4, terms: 6, ops: '+-' }, flash: { digits: 3, numbers: 15, ms: 400 }, minutes: { abacus: 10, mental: 6 } }),
];

export type ExamQuestion =
  | { kind: 'list'; problem: ListProblem; answer: number }
  | { kind: 'mul'; a: number; b: number; answer: number }
  | { kind: 'div'; dividend: number; divisor: number; answer: number }
  | { kind: 'flash'; numbers: number[]; ms: number; answer: number };

export interface ExamPaper {
  abacus: ExamQuestion[];
  mental: ExamQuestion[];
  flash: ExamQuestion[];
}

export const PER_SECTION = { abacus: 5, mental: 5, flash: 3 } as const;

const list = (spec: { digits: number; terms: number; ops: '+' | '+-' }, random: Random): ExamQuestion => {
  const problem = listProblem({ ...spec, allow: ALL_TECHNIQUES }, random);
  return { kind: 'list', problem, answer: problem.answer };
};

export const makePaper = (exam: ExamDef, random: Random = Math.random): ExamPaper => {
  const abacus: ExamQuestion[] = [];
  if (exam.abacus.mul) {
    const p = mulProblem(exam.abacus.mul[0], exam.abacus.mul[1], random);
    abacus.push({ kind: 'mul', a: p.a, b: p.b, answer: p.answer });
  }
  if (exam.abacus.div) {
    // div sizes are [quotient digits, divisor digits]; exam divisions are exact
    const p = divProblem(exam.abacus.div[0], exam.abacus.div[1], false, random);
    abacus.push({ kind: 'div', dividend: p.dividend, divisor: p.divisor, answer: p.answer });
  }
  while (abacus.length < PER_SECTION.abacus) abacus.unshift(list(exam.abacus, random));
  const mental = Array.from({ length: PER_SECTION.mental }, () => list(exam.mental, random));
  const flash = Array.from({ length: PER_SECTION.flash }, (): ExamQuestion => {
    const numbers = flashNumbers(exam.flash.digits, exam.flash.numbers, random);
    return { kind: 'flash', numbers, ms: exam.flash.ms, answer: numbers.reduce((a, b) => a + b, 0) };
  });
  return { abacus, mental, flash };
};

export interface ExamScore { abacus: number; mental: number; flash: number }

// Percent overall, and whether that's a pass (80% overall, 60% in every part)
export const gradeExam = (score: ExamScore) => {
  const total = PER_SECTION.abacus + PER_SECTION.mental + PER_SECTION.flash;
  const percent = Math.round(((score.abacus + score.mental + score.flash) / total) * 100);
  const parts = (['abacus', 'mental', 'flash'] as const).every(s => score[s] / PER_SECTION[s] >= 0.6);
  return { percent, passed: percent >= 80 && parts };
};
