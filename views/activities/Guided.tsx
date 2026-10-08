import React, { useMemo, useState } from 'react';
import type { Activity } from '../../core/lessons';
import { fromNumber, planOperation, type Board } from '../../core/abacus';
import { createTracker, track } from '../../core/tracker';
import { explainStep, formatProblem } from '../../core/explain';
import { fill } from '../../i18n';
import { useApp } from '../../AppContext';
import { Abacus } from '../../components/Abacus';
import { Bubble } from '../../components/Bubble';
import { ToolButton, Toolbar } from '../../components/ui';
import { ContinueButton, type ActivityProps } from './shared';
import { useBoard } from './useBoard';

type Guided = Extract<Activity, { type: 'guided' }>;

// Penko walks through a problem one digit step at a time; the glowing beads show each move
const Guided: React.FC<ActivityProps<Guided>> = ({ activity, onDone }) => {
  const { t, settings } = useApp();
  const unitRod = activity.rods - 1;
  const start = useMemo(() => fromNumber(activity.start, activity.rods), [activity]);

  // All digit steps of all terms, in order
  const steps = useMemo(() => {
    let board: Board = start;
    return activity.terms.flatMap(term => {
      const planned = planOperation(board, term.op, term.value, unitRod);
      if (planned.length) board = planned[planned.length - 1].after;
      return planned;
    });
  }, [activity, start, unitRod]);

  const [index, setIndex] = useState(0);
  const { board, set, undo, reset, canUndo } = useBoard(start);
  const [slips, setSlips] = useState(0);
  const finished = index >= steps.length;
  const step = steps[Math.min(index, steps.length - 1)];
  const tracker = useMemo(() => createTracker(step.before, step.moves), [step]);
  const state = finished ? { status: 'done' as const } : track(tracker, board);

  const change = (next: Board) => {
    if (finished) return;
    set(next);
    const after = track(tracker, next);
    if (after.status === 'off-track') setSlips(s => s + 1);
    if (after.status === 'done') {
      // Start the next step from this board, so undo can't jump back into a finished step
      window.setTimeout(() => { reset(next); setIndex(i => i + 1); }, 450);
    }
  };

  const answer = activity.terms.reduce((sum, term) => (term.op === '+' ? sum + term.value : sum - term.value), activity.start);

  return (
    <div className="space-y-5">
      <p className="text-center font-extrabold text-3xl sm:text-4xl tabular">{formatProblem(activity.start, activity.terms)}</p>
      <Bubble tone={finished ? 'good' : state.status === 'off-track' ? 'bad' : 'plain'} pose={finished ? 'jump' : 'talk'}>
        {finished ? fill(t.activity.guidedDone, { answer })
          : state.status === 'off-track' ? t.activity.offTrackGuided
          : explainStep(t, step, unitRod)}
      </Bubble>
      {finished ? <ContinueButton onClick={() => onDone(slips)} /> : (
        <Toolbar>
          <ToolButton onClick={undo} disabled={!canUndo}>{t.common.undo}</ToolButton>
          <ToolButton onClick={() => reset(step.before)} disabled={!canUndo}>{t.common.restart}</ToolButton>
        </Toolbar>
      )}
      <Abacus board={board} onChange={change} unitRod={unitRod} showValues={settings.showRodValues}
        hint={state.status === 'on-track' ? state.next : null} />
    </div>
  );
};

export default Guided;
