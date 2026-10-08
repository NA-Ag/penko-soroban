import React, { useEffect, useMemo, useState } from 'react';
import { emptyBoard, fromNumber, planOperation, type Board } from '../core/abacus';
import type { ListProblem } from '../core/problems';
import { createTracker, track } from '../core/tracker';
import { fill } from '../i18n';
import { useApp } from '../AppContext';
import { useBoard } from '../views/activities/useBoard';
import { Abacus } from './Abacus';
import { Bubble } from './Bubble';
import { ProblemList } from './ProblemList';
import { Button, ToolButton, Toolbar } from './ui';

// One list problem worked on the soroban, number by number. Each number is checked as soon
// as the beads show the new total; a wrong turn is caught at once and can be undone.
export const ListOnAbacus: React.FC<{
  problem: ListProblem;
  rods: number;
  prompt?: string;
  onFinish: (slips: number) => void;
}> = ({ problem, rods, prompt, onFinish }) => {
  const { t, settings } = useApp();
  const unitRod = rods - 1;
  const [term, setTerm] = useState(0);
  const { board, set, undo, reset, canUndo } = useBoard(emptyBoard(rods));
  const [slips, setSlips] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const finished = term >= problem.terms.length;

  // The expected board before the current number, and the moves for adding/subtracting it
  const before = useMemo(() => fromNumber(term === 0 ? 0 : problem.totals[term - 1], rods), [term, problem, rods]);
  const tracker = useMemo(() => {
    if (finished) return null;
    const { op, value } = problem.terms[term];
    return createTracker(before, planOperation(before, op, value, unitRod).flatMap(s => s.moves));
  }, [before, term, problem, unitRod, finished]);
  const state = tracker ? track(tracker, board) : { status: 'done' as const };

  useEffect(() => { if (finished) onFinish(slips); }, [finished]); // eslint-disable-line react-hooks/exhaustive-deps

  const change = (next: Board) => {
    if (!tracker) return;
    set(next);
    const after = track(tracker, next);
    if (after.status === 'off-track' && state.status !== 'off-track') setSlips(s => s + 1);
    if (after.status === 'done') {
      setShowHint(false);
      reset(next);
      setTerm(i => i + 1);
    }
  };

  const total = term === 0 ? 0 : problem.totals[term - 1];

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <ProblemList terms={problem.terms} current={term} />
        <div className="text-right">
          <p className="text-xs font-bold uppercase tracking-wider text-muted">{t.activity.practiceTotal}</p>
          <p className="font-extrabold text-3xl tabular">{finished ? problem.answer : total}</p>
        </div>
      </div>
      {state.status === 'off-track' ? (
        <Bubble tone="bad" pose="hurt">
          {fill(t.activity.offTrack, { n: total })}
          <span className="flex flex-wrap gap-2 mt-3">
            <Button variant="quiet" onClick={undo} disabled={!canUndo}>{t.common.undo}</Button>
            <Button variant="quiet" onClick={() => reset(before)}>{fill(t.activity.setBack, { n: total })}</Button>
          </span>
        </Bubble>
      ) : prompt && term === 0 && board.every(v => v === 0) ? <Bubble>{prompt}</Bubble> : null}
      {!finished && (
        <Toolbar>
          <ToolButton onClick={() => { setShowHint(true); setSlips(s => s + 1); }} disabled={showHint || state.status !== 'on-track'}>
            {t.common.hint}
          </ToolButton>
        </Toolbar>
      )}
      <Abacus board={board} onChange={change} unitRod={unitRod} showValues={settings.showRodValues}
        hint={showHint && state.status === 'on-track' ? state.next : null} />
    </div>
  );
};
