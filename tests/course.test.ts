import { describe, expect, it } from 'vitest';
import { fromNumber, planOperation, type Board } from '../core/abacus';
import { UNITS } from '../core/course';
import { EXAMS, gradeExam, makePaper } from '../core/exams';
import { LESSONS } from '../core/lessons';
import { divSteps, mulSteps } from '../core/muldiv';
import { listProblem, rodsFor, seededRandom } from '../core/problems';
import { en } from '../i18n/locales/en';

describe('course structure', () => {
  it('every unit has lessons, and lesson ids are unique', () => {
    for (const unit of UNITS) expect(LESSONS.some(l => l.unit === unit.id)).toBe(true);
    expect(new Set(LESSONS.map(l => l.id)).size).toBe(LESSONS.length);
  });

  it.each(LESSONS.map(l => [l.id, l] as const))('%s has a title and all its text', (id, lesson) => {
    const texts = (en.lessons as Record<string, Record<string, string>>)[id];
    expect(texts?.title).toBeTruthy();
    for (const a of lesson.activities) if ('text' in a && a.text) expect(texts[a.text], `${id}.${a.text}`).toBeTruthy();
    // No unused text either: every key but the title is said somewhere
    const used = new Set(lesson.activities.flatMap(a => ('text' in a && a.text ? [a.text] : [])));
    for (const key of Object.keys(texts)) if (key !== 'title') expect(used.has(key), `${id}.${key} is never used`).toBe(true);
  });

  it('every lesson in the language file exists', () => {
    expect(Object.keys(en.lessons).sort()).toEqual(LESSONS.map(l => l.id).sort());
  });
});

describe('lesson activities work', () => {
  for (const lesson of LESSONS) {
    lesson.activities.forEach((a, i) => {
      if (a.type === 'guided') {
        it(`${lesson.id} #${i}: ${a.start} ${a.terms.map(t => t.op + t.value).join(' ')} teaches ${a.teaches ?? 'anything'}`, () => {
          let board: Board = fromNumber(a.start, a.rods);
          const techniques: string[] = [];
          for (const term of a.terms) {
            const steps = planOperation(board, term.op, term.value);
            techniques.push(...steps.map(s => s.technique));
            board = steps[steps.length - 1].after;
          }
          if (a.teaches) expect(techniques).toContain(a.teaches);
        });
      }
      if (a.type === 'abacus' || a.type === 'mental') {
        it(`${lesson.id} #${i}: makes ${a.type} problems`, () => {
          const random = seededRandom(i + 1);
          for (let n = 0; n < 20; n++) listProblem({ ...a.spec, rods: Math.max(3, rodsFor(a.spec)) }, random);
        });
      }
      if ((a.type === 'set' || a.type === 'set-random') && a.type === 'set') {
        it(`${lesson.id} #${i}: numbers fit on ${a.rods} rods`, () => {
          for (const v of a.values) expect(() => fromNumber(v, a.rods)).not.toThrow();
        });
      }
    });
  }
});

describe('multiplication and division steps', () => {
  it('multiplication products add up to the answer', () => {
    for (const [a, b] of [[34, 6], [23, 14], [315, 26], [9999, 99]]) {
      expect(mulSteps(a, b).reduce((sum, s) => sum + s.value, 0)).toBe(a * b);
    }
  });

  it('division steps leave the remainder and spell the quotient', () => {
    for (const [dividend, divisor] of [[84, 4], [47, 3], [312, 24], [1005, 5], [9, 3]]) {
      const steps = divSteps(dividend, divisor);
      expect(Number(steps.map(s => s.digit).join(''))).toBe(Math.floor(dividend / divisor));
      expect(dividend - steps.reduce((sum, s) => sum + s.value, 0)).toBe(dividend % divisor);
      expect(steps.every(s => s.digit >= 0 && s.digit <= 9)).toBe(true);
    }
  });
});

describe('exams', () => {
  it.each(EXAMS.map(e => [e.id, e] as const))('%s makes a paper', (_, exam) => {
    const paper = makePaper(exam, seededRandom(5));
    expect(paper.abacus).toHaveLength(5);
    expect(paper.mental).toHaveLength(5);
    expect(paper.flash).toHaveLength(3);
  });

  it('grades by 80% overall and 60% per part', () => {
    expect(gradeExam({ abacus: 5, mental: 5, flash: 3 })).toEqual({ percent: 100, passed: true });
    expect(gradeExam({ abacus: 5, mental: 5, flash: 1 }).passed).toBe(false); // flash part below 60%
    expect(gradeExam({ abacus: 4, mental: 4, flash: 2 }).passed).toBe(false); // 77%
  });
});
