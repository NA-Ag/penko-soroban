// Follows the learner's bead moves towards a goal, so lessons can tell whether they're on a
// good path, show the next move as a hint, and spot a wrong turn.
//
// The planned moves are taught in a set order, but real hands vary: some push the heaven and
// earth beads in the other order, some push two earth beads in one flick and some in two.
// So any order of the planned bead movements, in any size of flick, counts as on track.

import { applyMove, applyMoves, earth, type Board, type Move } from './abacus';

const key = (board: Board) => board.join(',');

// A planned move split into single-bead units (heaven moves are already one bead)
interface Unit { rod: number; bead: Move['bead']; sign: 1 | -1; from: number }

const toUnits = (moves: readonly Move[]): Unit[] =>
  moves.flatMap((m, from) => Array.from({ length: Math.abs(m.delta) }, () => ({ rod: m.rod, bead: m.bead, sign: Math.sign(m.delta) as 1 | -1, from })));

const applyUnit = (board: Board, u: Unit): Board | null => {
  try {
    return applyMove(board, { rod: u.rod, bead: u.bead, delta: u.sign });
  } catch {
    return null;
  }
};

export interface Tracker {
  start: Board;
  goal: Board;
  moves: readonly Move[];
  // Every board state on some good path, with which planned units are still to do there
  reachable: Map<string, Unit[]>;
}

export const createTracker = (start: Board, moves: readonly Move[]): Tracker => {
  const units = toUnits(moves);
  const reachable = new Map<string, Unit[]>([[key(start), units]]);
  const queue: [Board, Unit[]][] = [[start, units]];
  // The goal is where the planned moves end, however the learner gets there
  const goal = applyMoves(start, moves);
  while (queue.length) {
    const [board, left] = queue.shift()!;
    // Try each distinct remaining unit (units of the same planned move are interchangeable)
    const tried = new Set<string>();
    left.forEach((u, i) => {
      const id = `${u.rod}:${u.bead}:${u.sign}`;
      if (tried.has(id)) return;
      tried.add(id);
      const next = applyUnit(board, u);
      if (!next || reachable.has(key(next))) return;
      const rest = left.filter((_, j) => j !== i);
      reachable.set(key(next), rest);
      queue.push([next, rest]);
    });
  }
  return { start, goal, moves, reachable };
};

export type TrackState =
  | { status: 'done' }
  | { status: 'on-track'; next: Move }
  | { status: 'off-track' };

// Where the board stands against the tracker, and the next move to suggest
export const track = (tracker: Tracker, board: Board): TrackState => {
  if (key(board) === key(tracker.goal)) return { status: 'done' };
  const reached = tracker.reachable.get(key(board));
  if (!reached) return { status: 'off-track' };
  // Moves still to do can include a push and a pull of the same bead (when a carry and a borrow
  // meet on one rod): they cancel out, so only the net movement is suggested, never a back-and-forth
  const net = new Map<string, number>();
  for (const u of reached) net.set(`${u.rod}:${u.bead}`, (net.get(`${u.rod}:${u.bead}`) ?? 0) + u.sign);
  const left = reached.filter(u => {
    const k = `${u.rod}:${u.bead}`;
    const n = net.get(k)!;
    if (Math.sign(n) !== u.sign) return false;
    net.set(k, n - u.sign);
    return true;
  });
  // Suggest the earliest planned move that still has beads to move and can be made now,
  // as one flick of all its remaining beads
  const byMove = new Map<number, Unit[]>();
  for (const u of left) byMove.set(u.from, [...(byMove.get(u.from) ?? []), u]);
  for (const from of [...byMove.keys()].sort((a, b) => a - b)) {
    const group = byMove.get(from)!;
    const move: Move = { rod: group[0].rod, bead: group[0].bead, delta: group[0].sign * group.length };
    try {
      applyMove(board, move);
      return { status: 'on-track', next: move };
    } catch {
      /* not possible yet from here: try the next planned move */
    }
  }
  return { status: 'off-track' };
};

// The plain moves to change a board into another, rod by rod (heaven first): used for
// "show this number" tasks, where the method doesn't matter
export const movesToSet = (from: Board, to: Board): Move[] =>
  from.flatMap((value, rod) => {
    const target = to[rod];
    const moves: Move[] = [];
    if ((value >= 5) !== (target >= 5)) moves.push({ rod, bead: 'heaven', delta: target >= 5 ? 1 : -1 });
    const delta = earth(target) - earth(value);
    if (delta) moves.push({ rod, bead: 'earth', delta });
    return moves;
  });
