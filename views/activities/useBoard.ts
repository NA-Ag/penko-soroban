import { useCallback, useState } from 'react';
import type { Board } from '../../core/abacus';

// A board with undo history, for activities where a wrong move can be taken back
export const useBoard = (initial: Board) => {
  const [history, setHistory] = useState<Board[]>([initial]);
  const board = history[history.length - 1];
  const set = useCallback((next: Board) => setHistory(h => [...h, next]), []);
  const undo = useCallback(() => setHistory(h => (h.length > 1 ? h.slice(0, -1) : h)), []);
  const reset = useCallback((to: Board) => setHistory([to]), []);
  return { board, set, undo, reset, canUndo: history.length > 1 };
};
