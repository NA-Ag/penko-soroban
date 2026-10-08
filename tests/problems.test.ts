import { describe, expect, it } from 'vitest';
import { applyMove, emptyBoard, fromNumber, planOperation, type Board, type Technique } from '../core/abacus';
import { divProblem, flashNumbers, listProblem, mulProblem, seededRandom, type ListSpec } from '../core/problems';
import { createTracker, movesToSet, track } from '../core/tracker';

const techniquesOf = (spec: ListSpec, terms: { op: '+' | '-'; value: number }[], rods: number) => {
  let board = emptyBoard(rods);
  const used = new Set<Technique>();
  for (const term of terms) {
    const steps = planOperation(board, term.op, term.value);
    steps.forEach(s => used.add(s.technique));
    if (steps.length) board = steps[steps.length - 1].after;
  }
  return used;
};

describe('list problems', () => {
  const specs: ListSpec[] = [
    { digits: 1, terms: 2, ops: '+', allow: ['direct'] },
    { digits: 1, terms: 3, ops: '+-', allow: ['direct'] },
    { digits: 1, terms: 2, ops: '+', allow: ['direct', 'five'], require: ['five'] },
    { digits: 1, terms: 3, ops: '+-', allow: ['direct', 'five'], require: ['five'] },
    { digits: 1, terms: 2, ops: '+', allow: ['direct', 'five', 'ten'], require: ['ten'] },
    { digits: 2, terms: 2, ops: '-', allow: ['direct', 'five', 'ten'], require: ['ten'] },
    { digits: 1, terms: 3, ops: '+-', allow: ['direct', 'five', 'ten', 'ten-five'], require: ['ten-five'] },
    { digits: [2, 3], terms: 5, ops: '+-', allow: ['direct', 'five', 'ten', 'ten-five'] },
  ];

  it.each(specs.map(s => [JSON.stringify(s), s] as const))('%s', (_, spec) => {
    const random = seededRandom(7);
    for (let i = 0; i < 40; i++) {
      const p = listProblem(spec, random);
      expect(p.terms).toHaveLength(spec.terms);
      const total = p.terms.reduce((sum, t) => (t.op === '+' ? sum + t.value : sum - t.value), 0);
      expect(p.answer).toBe(total);
      expect(p.totals.every(t => t >= 0)).toBe(true);
      const used = techniquesOf(spec, p.terms, 8);
      for (const t of used) expect(spec.allow).toContain(t);
      if (spec.require) expect([...used].some(t => spec.require!.includes(t))).toBe(true);
    }
  });
});

describe('other problems', () => {
  it('flash numbers never repeat back to back', () => {
    const n = flashNumbers(1, 200, seededRandom(3));
    expect(n.every((v, i) => i === 0 || v !== n[i - 1])).toBe(true);
    expect(n.every(v => v >= 1 && v <= 9)).toBe(true);
  });

  it('multiplication and division come out right', () => {
    const random = seededRandom(9);
    for (let i = 0; i < 50; i++) {
      const m = mulProblem(2, 2, random);
      expect(m.answer).toBe(m.a * m.b);
      const d = divProblem(2, 1, i % 2 === 0, random);
      expect(d.answer * d.divisor + d.remainder).toBe(d.dividend);
      expect(d.remainder).toBeLessThan(d.divisor);
    }
  });
});

describe('tracker', () => {
  it('accepts the taught order and other orders, and spots wrong turns', () => {
    const start = fromNumber(3, 3);
    const steps = planOperation(start, '+', 4); // +5 then -1
    const tracker = createTracker(start, steps.flatMap(s => s.moves));
    expect(track(tracker, start)).toEqual({ status: 'on-track', next: { rod: 2, bead: 'heaven', delta: 1 } });
    // Taught order
    const afterFive = applyMove(start, { rod: 2, bead: 'heaven', delta: 1 });
    expect(track(tracker, afterFive)).toEqual({ status: 'on-track', next: { rod: 2, bead: 'earth', delta: -1 } });
    // Other order: take one away first
    const takeFirst = applyMove(start, { rod: 2, bead: 'earth', delta: -1 });
    expect(track(tracker, takeFirst).status).toBe('on-track');
    expect(track(tracker, fromNumber(7, 3)).status).toBe('done');
    // Pushing an earth bead up is not part of +5 -1
    expect(track(tracker, fromNumber(4, 3)).status).toBe('off-track');
  });

  it('accepts several earth beads in one flick or one at a time', () => {
    const start = fromNumber(0, 2);
    const tracker = createTracker(start, planOperation(start, '+', 3).flatMap(s => s.moves));
    expect(track(tracker, fromNumber(1, 2)).status).toBe('on-track');
    expect(track(tracker, fromNumber(2, 2))).toEqual({ status: 'on-track', next: { rod: 1, bead: 'earth', delta: 1 } });
    expect(track(tracker, fromNumber(3, 2)).status).toBe('done');
  });

  it('follows long multi-digit terms with carries', () => {
    const start = fromNumber(1999, 6);
    const tracker = createTracker(start, planOperation(start, '+', 2468).flatMap(s => s.moves));
    expect(track(tracker, fromNumber(4467, 6)).status).toBe('done');
  });

  it('sets numbers directly', () => {
    const from = fromNumber(27, 3);
    const to = fromNumber(105, 3);
    const tracker = createTracker(from, movesToSet(from, to));
    expect(track(tracker, to).status).toBe('done');
  });
});

describe('tracker hints never go back and forth', () => {
  it('65 - 29: borrowing from a rod that just used a small friend', () => {
    const start = fromNumber(65, 4);
    const tracker = createTracker(start, planOperation(start, '-', 29).flatMap(s => s.moves));
    // Follow every hint from the start: it must reach the answer without revisiting a board
    let board = start;
    const seen = new Set<string>();
    for (let i = 0; i < 20; i++) {
      const state = track(tracker, board);
      if (state.status === 'done') break;
      expect(state.status).toBe('on-track');
      if (state.status !== 'on-track') return;
      expect(seen.has(board.join())).toBe(false);
      seen.add(board.join());
      board = applyMove(board, state.next);
    }
    expect(board).toEqual(fromNumber(36, 4));
  });

  it('following hints from any reachable board always finishes, for thousands of problems', () => {
    const random = seededRandom(11);
    for (let n = 0; n < 400; n++) {
      const a = Math.floor(random() * 9999);
      const b = Math.floor(random() * 999) + 1;
      const op = a >= b && random() < 0.5 ? '-' : '+';
      const start = fromNumber(a, 6);
      const tracker = createTracker(start, planOperation(start, op, b).flatMap(s => s.moves));
      for (const [k] of tracker.reachable) {
        let board: Board = k.split(',').map(Number);
        let steps = 0;
        while (track(tracker, board).status === 'on-track' && steps++ < 30) {
          const state = track(tracker, board);
          if (state.status !== 'on-track') break;
          board = applyMove(board, state.next);
        }
        expect(track(tracker, board).status, `${a} ${op} ${b} from ${k}`).toBe('done');
      }
    }
  }, 60000);
});
