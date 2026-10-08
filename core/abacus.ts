// The soroban, as data and rules. No UI here: lessons, hints, checks and problem
// generators all build on these functions.
//
// A board is a list of rod values, leftmost rod first. Each rod shows 0-9:
//   - one heaven bead above the beam, worth 5 when pushed down to it
//   - four earth beads below the beam, worth 1 each when pushed up to it
//
// Adding and subtracting follow the standard Japanese method, one digit at a time,
// working from the highest place to the lowest:
//   direct      the beads you need are free: just move them
//   five        "small friends" (5-complements): +4 on 1 is +5 then -1
//   ten         "big friends" (10-complements): +9 on 3 is -1 here, then +1 on the rod to the left
//   ten-five    a 10-complement whose own step needs a 5-complement: +6 on 5 is (+1 -5) here, +1 left

export type Board = readonly number[];

export type BeadKind = 'heaven' | 'earth';

// One physical action: push beads on one rod. Heaven delta is +1/-1 (adds or removes 5);
// earth delta is the number of earth beads pushed up (+) or down (-).
export interface Move {
  rod: number;
  bead: BeadKind;
  delta: number;
}

export type Technique = 'direct' | 'five' | 'ten' | 'ten-five';

export type Op = '+' | '-';

// Adding or subtracting one digit on one rod, including any carry or borrow it causes
export interface DigitStep {
  rod: number;
  op: Op;
  digit: number;
  technique: Technique;
  // Moves on this rod and, for carries and borrows, on rods to the left, in teaching order
  moves: Move[];
  before: Board;
  after: Board;
  // How a carry or borrow was made on the rod to the left, if one was needed
  carry?: DigitStep;
}

export class AbacusError extends Error {}

export const heaven = (value: number) => (value >= 5 ? 1 : 0);
export const earth = (value: number) => value % 5;

export const emptyBoard = (rods: number): Board => Array<number>(rods).fill(0);

// Puts a whole number on the board with its ones digit on `unitRod` (default: rightmost rod)
export const fromNumber = (value: number, rods: number, unitRod = rods - 1): Board => {
  if (!Number.isInteger(value) || value < 0) throw new AbacusError(`Can't show ${value} on a soroban`);
  const board = Array<number>(rods).fill(0);
  let rest = value;
  for (let rod = unitRod; rod >= 0 && rest > 0; rod--) {
    board[rod] = rest % 10;
    rest = Math.floor(rest / 10);
  }
  if (rest > 0) throw new AbacusError(`${value} doesn't fit on ${rods} rods`);
  return board;
};

// Reads the board as a whole number, with the ones digit on `unitRod`. Rods to the right of the
// unit rod are ignored.
export const toNumber = (board: Board, unitRod = board.length - 1): number =>
  board.slice(0, unitRod + 1).reduce((total, digit) => total * 10 + digit, 0);

export const sameBoard = (a: Board, b: Board) => a.length === b.length && a.every((v, i) => v === b[i]);

export const applyMove = (board: Board, move: Move): Board => {
  const value = board[move.rod];
  if (value === undefined) throw new AbacusError(`There is no rod ${move.rod}`);
  let next: number;
  if (move.bead === 'heaven') {
    if (move.delta === 1 && heaven(value) === 0) next = value + 5;
    else if (move.delta === -1 && heaven(value) === 1) next = value - 5;
    else throw new AbacusError(`Can't move the heaven bead on rod ${move.rod} by ${move.delta}`);
  } else {
    const beads = earth(value) + move.delta;
    if (move.delta === 0 || beads < 0 || beads > 4) throw new AbacusError(`Can't move ${move.delta} earth beads on rod ${move.rod}`);
    next = value + move.delta;
  }
  const out = [...board];
  out[move.rod] = next;
  return out;
};

export const applyMoves = (board: Board, moves: readonly Move[]): Board => moves.reduce(applyMove, board);

// What tapping a bead does, like on a real soroban: tapping a resting earth bead pushes it
// and the ones between it and the beam up; tapping an active one lets it and the ones
// below it fall back. Earth beads are numbered from the beam outwards (0 = nearest the beam).
export const tapBead = (board: Board, rod: number, bead: BeadKind, index = 0): Move => {
  const value = board[rod];
  if (bead === 'heaven') return { rod, bead, delta: heaven(value) ? -1 : 1 };
  const active = earth(value);
  const target = index < active ? index : index + 1;
  return { rod, bead, delta: target - active };
};

// Moves to add (or remove) `amount` (1-9) on a single rod with no carry, as a direct move
const directMoves = (rod: number, amount: number, sign: 1 | -1): Move[] => {
  const moves: Move[] = [];
  if (amount >= 5) moves.push({ rod, bead: 'heaven', delta: sign });
  if (amount % 5) moves.push({ rod, bead: 'earth', delta: sign * (amount % 5) });
  return moves;
};

const canAddDirect = (value: number, n: number) =>
  n < 5 ? earth(value) + n <= 4 : heaven(value) === 0 && earth(value) + (n - 5) <= 4;

const canSubtractDirect = (value: number, n: number) =>
  n < 5 ? earth(value) >= n : heaven(value) === 1 && earth(value) >= n - 5;

// Adds n (1-9) on one rod without touching other rods, if that's possible: direct or 5-complement
const addOnRod = (value: number, rod: number, n: number): { technique: 'direct' | 'five'; moves: Move[] } | null => {
  if (canAddDirect(value, n)) return { technique: 'direct', moves: directMoves(rod, n, 1) };
  // Small friend: +n = +5 - (5 - n). Only for 1-4, with the heaven bead free and enough earth beads up.
  if (n < 5 && heaven(value) === 0 && earth(value) >= 5 - n) {
    return { technique: 'five', moves: [{ rod, bead: 'heaven', delta: 1 }, { rod, bead: 'earth', delta: -(5 - n) }] };
  }
  return null;
};

const subtractOnRod = (value: number, rod: number, n: number): { technique: 'direct' | 'five'; moves: Move[] } | null => {
  if (canSubtractDirect(value, n)) return { technique: 'direct', moves: directMoves(rod, n, -1) };
  // Small friend: -n = +(5 - n) - 5. Only for 1-4, with the heaven bead down and room for the earth beads.
  if (n < 5 && heaven(value) === 1 && earth(value) + (5 - n) <= 4) {
    return { technique: 'five', moves: [{ rod, bead: 'earth', delta: 5 - n }, { rod, bead: 'heaven', delta: -1 }] };
  }
  return null;
};

// Adds a digit (1-9) on `rod`, the way it is taught. Carries go to the rod on the left.
export const addDigit = (board: Board, rod: number, digit: number): DigitStep => {
  if (!Number.isInteger(digit) || digit < 1 || digit > 9) throw new AbacusError(`Can only add one digit at a time, not ${digit}`);
  const value = board[rod];
  if (value === undefined) throw new AbacusError(`There is no rod ${rod}`);

  const onRod = value + digit <= 9 ? addOnRod(value, rod, digit) : null;
  if (onRod) {
    return { rod, op: '+', digit, technique: onRod.technique, moves: onRod.moves, before: board, after: applyMoves(board, onRod.moves) };
  }

  // Big friend: +n = -(10 - n) here, then +1 on the left ("take the complement, carry one")
  if (rod === 0) throw new AbacusError('The answer is too big for this soroban');
  const complement = 10 - digit;
  const take = subtractOnRod(value, rod, complement);
  if (!take) throw new AbacusError(`Can't add ${digit} to ${value}`); // unreachable: value + digit >= 10 means value >= complement
  const afterTake = applyMoves(board, take.moves);
  const carry = addDigit(afterTake, rod - 1, 1);
  return {
    rod, op: '+', digit,
    technique: take.technique === 'five' ? 'ten-five' : 'ten',
    moves: [...take.moves, ...carry.moves],
    before: board,
    after: carry.after,
    carry,
  };
};

// Subtracts a digit (1-9) on `rod`. Borrows come from the rod on the left.
export const subtractDigit = (board: Board, rod: number, digit: number): DigitStep => {
  if (!Number.isInteger(digit) || digit < 1 || digit > 9) throw new AbacusError(`Can only subtract one digit at a time, not ${digit}`);
  const value = board[rod];
  if (value === undefined) throw new AbacusError(`There is no rod ${rod}`);

  const onRod = value >= digit ? subtractOnRod(value, rod, digit) : null;
  if (onRod) {
    return { rod, op: '-', digit, technique: onRod.technique, moves: onRod.moves, before: board, after: applyMoves(board, onRod.moves) };
  }

  // Big friend: -n = -1 on the left ("borrow one"), then +(10 - n) here
  if (rod === 0 || board.slice(0, rod).every(v => v === 0)) throw new AbacusError('The answer would be below zero');
  const borrow = subtractDigit(board, rod - 1, 1);
  const complement = 10 - digit;
  const give = addOnRod(borrow.after[rod], rod, complement);
  if (!give) throw new AbacusError(`Can't subtract ${digit} from ${value}`); // unreachable: value < digit means value + complement <= 9
  return {
    rod, op: '-', digit,
    technique: give.technique === 'five' ? 'ten-five' : 'ten',
    moves: [...borrow.moves, ...give.moves],
    before: board,
    after: applyMoves(borrow.after, give.moves),
    carry: borrow,
  };
};

// Adds or subtracts a whole number, its ones digit on `unitRod`, highest place first as on a
// real soroban. Returns one step per non-zero digit.
export const planOperation = (board: Board, op: Op, amount: number, unitRod = board.length - 1): DigitStep[] => {
  if (!Number.isInteger(amount) || amount < 0) throw new AbacusError(`Can't ${op === '+' ? 'add' : 'subtract'} ${amount}`);
  const digits = String(amount).split('').map(Number);
  const steps: DigitStep[] = [];
  let current = board;
  digits.forEach((digit, i) => {
    if (digit === 0) return;
    const rod = unitRod - (digits.length - 1 - i);
    if (rod < 0) throw new AbacusError(`${amount} doesn't fit on this soroban`);
    const step = op === '+' ? addDigit(current, rod, digit) : subtractDigit(current, rod, digit);
    steps.push(step);
    current = step.after;
  });
  return steps;
};

// Every board state a step passes through, starting with `before`
export const stepStates = (step: DigitStep): Board[] => {
  const states: Board[] = [step.before];
  for (const move of step.moves) states.push(applyMove(states[states.length - 1], move));
  return states;
};

// Where the learner is within a step: the index of the next move to make, or -1 if the
// board isn't on the step's path. Equal to moves.length when the step is complete.
export const progressInStep = (board: Board, step: DigitStep): number => {
  const states = stepStates(step);
  for (let i = states.length - 1; i >= 0; i--) if (sameBoard(states[i], board)) return i;
  return -1;
};

export const techniquesUsed = (steps: readonly DigitStep[]): Set<Technique> => new Set(steps.map(s => s.technique));
