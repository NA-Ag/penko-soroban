import React, { useMemo, useState } from 'react';
import type { Activity } from '../../core/lessons';
import { emptyBoard, fromNumber, sameBoard, type Board } from '../../core/abacus';
import { randomWithDigits } from '../../core/problems';
import { createTracker, movesToSet, track } from '../../core/tracker';
import { fill } from '../../i18n';
import { useApp } from '../../AppContext';
import { Abacus } from '../../components/Abacus';
import { Bubble } from '../../components/Bubble';
import { ToolButton, Toolbar } from '../../components/ui';
import { AFTER_CORRECT_MS, Counter, type ActivityProps } from './shared';

type SetActivity = Extract<Activity, { type: 'set' | 'set-random' }>;

// Show each number on the soroban. Checks itself as soon as the beads match.
const SetNumber: React.FC<ActivityProps<SetActivity>> = ({ activity, texts, onDone }) => {
  const { t, settings } = useApp();
  const targets = useMemo(() => activity.type === 'set'
    ? activity.values
    : Array.from({ length: activity.count }, () => randomWithDigits(Math.random, activity.digits)), [activity]);
  const [index, setIndex] = useState(0);
  const [board, setBoard] = useState<Board>(() => emptyBoard(activity.rods));
  const [slips, setSlips] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [solved, setSolved] = useState(false);

  const target = targets[index];
  const goal = fromNumber(target, activity.rods);
  const hint = useMemo(() => {
    if (!showHint) return null;
    const state = track(createTracker(board, movesToSet(board, goal)), board);
    return state.status === 'on-track' ? state.next : null;
  }, [showHint, board, goal]);

  const change = (next: Board) => {
    if (solved) return;
    setBoard(next);
    if (sameBoard(next, goal)) {
      setSolved(true);
      setShowHint(false);
      window.setTimeout(() => {
        if (index + 1 >= targets.length) return onDone(slips);
        setIndex(i => i + 1);
        setBoard(emptyBoard(activity.rods));
        setSolved(false);
      }, AFTER_CORRECT_MS);
    }
  };

  const prompt = activity.text ? fill(texts[activity.text], { n: target }) : fill(t.activity.set, { n: target });

  return (
    <div className="space-y-5">
      {targets.length > 1 && <Counter n={index + 1} total={targets.length} />}
      <Bubble tone={solved ? 'good' : 'plain'} pose={solved ? 'jump' : 'talk'}>
        {solved ? t.common.correct : prompt}
      </Bubble>
      <p className="text-center font-extrabold text-5xl tabular" aria-hidden="true">{target}</p>
      <Toolbar>
        <ToolButton onClick={() => { setShowHint(true); setSlips(s => s + 1); }} disabled={solved || showHint}>{t.common.hint}</ToolButton>
        <ToolButton onClick={() => setBoard(emptyBoard(activity.rods))} disabled={solved}>{t.abacus.clear}</ToolButton>
      </Toolbar>
      <Abacus board={board} onChange={change} hint={hint} showValues={settings.showRodValues} />
    </div>
  );
};

export default SetNumber;
