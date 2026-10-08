import React, { useEffect, useMemo, useState } from 'react';
import { emptyBoard, fromNumber, planOperation, type Board } from '../core/abacus';
import { mulRods, mulSteps } from '../core/muldiv';
import { createTracker, track } from '../core/tracker';
import { placeName } from '../core/explain';
import { fill } from '../i18n';
import { useApp } from '../AppContext';
import { useBoard } from '../views/activities/useBoard';
import { Abacus } from './Abacus';
import { Bubble } from './Bubble';
import { ToolButton, Toolbar } from './ui';

// a × b on the soroban: one digit pair at a time, each product added in its place
export const MulOnAbacus: React.FC<{ a: number; b: number; guided: boolean; onFinish: (slips: number) => void }> = ({ a, b, guided, onFinish }) => {
  const { t, settings } = useApp();
  const rods = mulRods(a, b);
  const unitRod = rods - 1;
  const steps = useMemo(() => mulSteps(a, b), [a, b]);
  const [index, setIndex] = useState(0);
  const [running, setRunning] = useState(0);
  const { board, set, undo, reset, canUndo } = useBoard(emptyBoard(rods));
  const [slips, setSlips] = useState(0);
  const [showHint, setShowHint] = useState(guided);
  const finished = index >= steps.length;
  const step = steps[Math.min(index, steps.length - 1)];

  const before = useMemo(() => fromNumber(running, rods), [running, rods]);
  const tracker = useMemo(() => finished ? null : createTracker(before, planOperation(before, '+', step.value, unitRod).flatMap(s => s.moves)), [before, step, unitRod, finished]);
  const state = tracker ? track(tracker, board) : { status: 'done' as const };

  useEffect(() => { if (finished) onFinish(slips); }, [finished]); // eslint-disable-line react-hooks/exhaustive-deps

  const change = (next: Board) => {
    if (!tracker) return;
    set(next);
    const after = track(tracker, next);
    if (after.status === 'off-track' && state.status !== 'off-track') setSlips(s => s + 1);
    if (after.status === 'done') {
      reset(next);
      setRunning(r => r + step.value);
      setIndex(i => i + 1);
      setShowHint(guided);
    }
  };

  const productRods = finished ? [] : [unitRod - step.place - 1, unitRod - step.place].filter(r => r >= 0);

  return (
    <div className="space-y-4">
      <p className="text-center font-extrabold text-4xl tabular">{a} × {b}</p>
      <Bubble tone={finished ? 'good' : state.status === 'off-track' ? 'bad' : 'plain'} pose={finished ? 'jump' : 'talk'}>
        {finished ? fill(t.mul.done, { a, b, answer: a * b })
          : state.status === 'off-track' ? t.activity.offTrackGuided
          : fill(t.mul.step, { x: step.x, y: step.y, p: step.product, place: placeName(t, unitRod - step.place, unitRod) })}
      </Bubble>
      {!finished && (
        <Toolbar>
          {!guided && <ToolButton onClick={() => { setShowHint(true); setSlips(s => s + 1); }} disabled={showHint}>{t.common.hint}</ToolButton>}
          <ToolButton onClick={undo} disabled={!canUndo}>{t.common.undo}</ToolButton>
          <ToolButton onClick={() => reset(before)} disabled={!canUndo}>{t.common.restart}</ToolButton>
        </Toolbar>
      )}
      <Abacus board={board} onChange={change} unitRod={unitRod} showValues={settings.showRodValues} focusRods={productRods}
        hint={showHint && state.status === 'on-track' ? state.next : null} />
    </div>
  );
};
