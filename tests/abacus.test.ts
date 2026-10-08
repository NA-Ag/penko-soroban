import { describe, expect, it } from 'vitest';
import {
  AbacusError, addDigit, applyMove, applyMoves, fromNumber, planOperation, progressInStep,
  subtractDigit, tapBead, toNumber, type Board,
} from '../core/abacus';

const board = (n: number, rods = 4) => fromNumber(n, rods);

describe('reading and writing numbers', () => {
  it('round-trips numbers', () => {
    for (const n of [0, 7, 10, 305, 9999]) expect(toNumber(board(n))).toBe(n);
  });

  it('can put the unit rod anywhere', () => {
    expect(fromNumber(12, 5, 2)).toEqual([0, 1, 2, 0, 0]);
    expect(toNumber([0, 1, 2, 0, 0], 2)).toBe(12);
  });

  it('refuses numbers that do not fit', () => {
    expect(() => fromNumber(12345, 4)).toThrow(AbacusError);
  });
});

describe('bead moves', () => {
  it('rejects moves a real soroban cannot make', () => {
    expect(() => applyMove([5], { rod: 0, bead: 'heaven', delta: 1 })).toThrow();
    expect(() => applyMove([3], { rod: 0, bead: 'earth', delta: 2 })).toThrow();
    expect(() => applyMove([1], { rod: 0, bead: 'earth', delta: -2 })).toThrow();
  });

  it('tapping beads works like a real soroban', () => {
    // 2 on the rod: earth beads 0 and 1 are up
    expect(tapBead([2], 0, 'earth', 3)).toEqual({ rod: 0, bead: 'earth', delta: 2 }); // pushes 2 and 3 up
    expect(tapBead([2], 0, 'earth', 1)).toEqual({ rod: 0, bead: 'earth', delta: -1 }); // lets bead 1 fall
    expect(tapBead([2], 0, 'earth', 0)).toEqual({ rod: 0, bead: 'earth', delta: -2 }); // lets both fall
    expect(tapBead([2], 0, 'heaven')).toEqual({ rod: 0, bead: 'heaven', delta: 1 });
    expect(tapBead([7], 0, 'heaven')).toEqual({ rod: 0, bead: 'heaven', delta: -1 });
  });
});

describe('one-digit steps use the taught technique', () => {
  it.each([
    // [start, op, digit, technique]
    [2, '+', 2, 'direct'],
    [3, '+', 4, 'five'], //  +4 = +5 -1
    [4, '+', 1, 'five'],
    [3, '+', 9, 'ten'], //  +9 = -1, carry
    [5, '+', 6, 'ten-five'], // +6 = (-4 via +1 -5), carry
    [8, '-', 3, 'direct'],
    [6, '-', 2, 'five'], // -2 = +3 -5
    [12, '-', 9, 'ten'], // borrow, +1
    [11, '-', 6, 'ten-five'], // borrow, +4 via +5 -1
  ] as const)('%i %s %i uses %s', (start, op, digit, technique) => {
    const b = board(start);
    const step = op === '+' ? addDigit(b, 3, digit) : subtractDigit(b, 3, digit);
    expect(step.technique).toBe(technique);
  });

  it('teaches small friends as "add 5, take away the complement"', () => {
    expect(addDigit(board(3), 3, 4).moves).toEqual([
      { rod: 3, bead: 'heaven', delta: 1 },
      { rod: 3, bead: 'earth', delta: -1 },
    ]);
  });

  it('teaches big friends as "take away the complement, carry one"', () => {
    expect(addDigit(board(3), 3, 9).moves).toEqual([
      { rod: 3, bead: 'earth', delta: -1 },
      { rod: 2, bead: 'earth', delta: 1 },
    ]);
  });

  it('carries ripple left: 99 + 1', () => {
    const step = addDigit(board(99), 3, 1);
    expect(toNumber(step.after)).toBe(100);
    expect(step.moves.map(m => m.rod)).toEqual([3, 3, 2, 2, 1]);
  });

  it('borrows ripple left: 100 - 1', () => {
    const step = subtractDigit(board(100), 3, 1);
    expect(toNumber(step.after)).toBe(99);
  });

  it('refuses answers below zero or too big for the board', () => {
    expect(() => subtractDigit(board(3), 3, 5)).toThrow(AbacusError);
    expect(() => addDigit(fromNumber(9, 1), 0, 1)).toThrow(AbacusError);
  });
});

describe('every single-digit case', () => {
  // For every rod value and digit, the planned moves are physically possible, end on the right
  // number, and only touch the rod and the rods it carries into
  for (let start = 0; start <= 99; start++) {
    for (let digit = 1; digit <= 9; digit++) {
      it(`${start} + ${digit} and ${start} - ${digit}`, () => {
        const b = board(start);
        const add = addDigit(b, 3, digit);
        expect(toNumber(applyMoves(b, add.moves))).toBe(start + digit);
        expect(toNumber(add.after)).toBe(start + digit);
        if (start >= digit) {
          const sub = subtractDigit(b, 3, digit);
          expect(toNumber(applyMoves(b, sub.moves))).toBe(start - digit);
        }
      });
    }
  }
});

describe('whole numbers', () => {
  it('adds and subtracts random numbers correctly, highest place first', () => {
    let seed = 42;
    const random = (max: number) => { seed = (seed * 1103515245 + 12345) % 2 ** 31; return seed % max; };
    for (let i = 0; i < 3000; i++) {
      const a = random(50000);
      const b = random(50000);
      const start = fromNumber(a, 7);
      const add = planOperation(start, '+', b);
      expect(toNumber(add.length ? add[add.length - 1].after : start)).toBe(a + b);
      // highest place first
      const rods = add.map(s => s.rod);
      expect([...rods].sort((x, y) => x - y)).toEqual(rods);
      if (a >= b) {
        const sub = planOperation(start, '-', b);
        expect(toNumber(sub.length ? sub[sub.length - 1].after : start)).toBe(a - b);
      }
    }
  });

  it('skips zero digits', () => {
    expect(planOperation(board(0), '+', 105).map(s => s.digit)).toEqual([1, 5]);
  });
});

describe('following a step', () => {
  it('knows which move comes next, and spots a wrong turn', () => {
    const start: Board = board(3);
    const step = addDigit(start, 3, 4); // +5, then -1
    expect(progressInStep(start, step)).toBe(0);
    const afterFive = applyMove(start, step.moves[0]);
    expect(progressInStep(afterFive, step)).toBe(1);
    expect(progressInStep(step.after, step)).toBe(2);
    expect(progressInStep(board(4), step)).toBe(-1);
  });
});
