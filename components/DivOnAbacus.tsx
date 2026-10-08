import React, { useEffect, useMemo, useState } from 'react';
import { fromNumber, planOperation, type Board } from '../core/abacus';
import { divRods, divSteps } from '../core/muldiv';
import { createTracker, track } from '../core/tracker';
import { placeName } from '../core/explain';
import { fill } from '../i18n';
import { useApp } from '../AppContext';
import { useBoard } from '../views/activities/useBoard';
import { Abacus } from './Abacus';
import { AnswerInput } from './AnswerInput';
import { Bubble } from './Bubble';
import { Button, ToolButton, Toolbar } from './ui';

// dividend ÷ divisor: for each place, choose the answer digit, then take that many divisors
// off the soroban. What's left at the end is the remainder.
export const DivOnAbacus: React.FC<{ dividend: number; divisor: number; guided: boolean; onFinish: (slips: number) => void }> = ({
  dividend, divisor, guided, onFinish,
}) => {
  const { t, settings } = useApp();
  const rods = divRods(dividend);
  const unitRod = rods - 1;
  const steps = useMemo(() => divSteps(dividend, divisor), [dividend, divisor]);
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<'ask' | 'zero' | 'take'>('ask');
  const [wrong, setWrong] = useState<number | null>(null);
  const [rest, setRest] = useState(dividend);
  const [quotient, setQuotient] = useState('');
  const { board, set, undo, reset, canUndo } = useBoard(fromNumber(dividend, rods));
  const [slips, setSlips] = useState(0);
  const [showHint, setShowHint] = useState(guided);
  const finished = index >= steps.length;
  const step = steps[Math.min(index, steps.length - 1)];

  const before = useMemo(() => fromNumber(rest, rods), [rest, rods]);
  const tracker = useMemo(() => (finished || phase !== 'take') ? null
    : createTracker(before, planOperation(before, '-', step.value, unitRod).flatMap(s => s.moves)), [before, step, unitRod, finished, phase]);
  const state = tracker ? track(tracker, board) : null;

  useEffect(() => { if (finished) onFinish(slips); }, [finished]); // eslint-disable-line react-hooks/exhaustive-deps

  const nextStep = () => {
    setRest(r => r - step.value);
    setIndex(i => i + 1);
    setPhase('ask');
    setShowHint(guided);
  };

  const guess = (digit: number) => {
    if (digit === step.digit) {
      setWrong(null);
      setQuotient(q => q + digit);
      setPhase(digit === 0 ? 'zero' : 'take');
    } else {
      setWrong(digit);
      setSlips(s => s + 1);
    }
  };

  const change = (next: Board) => {
    if (!tracker) return;
    set(next);
    const after = track(tracker, next);
    if (after.status === 'off-track' && state?.status !== 'off-track') setSlips(s => s + 1);
    if (after.status === 'done') { reset(next); nextStep(); }
  };

  const remainder = dividend % divisor;
  const values = { a: dividend, b: divisor, part: step.part, q: wrong ?? step.digit, p: (wrong ?? step.digit) * divisor };

  let message: string;
  let tone: 'plain' | 'good' | 'bad' = 'plain';
  if (finished) {
    message = fill(t.div.done, { a: dividend, b: divisor, answer: Math.floor(dividend / divisor) }) + (remainder ? ` ${fill(t.common.remainder, { r: remainder })}` : '');
    tone = 'good';
  } else if (phase === 'ask') {
    message = wrong === null ? fill(t.div.ask, values) : fill(wrong * divisor > step.part ? t.div.tooBig : t.div.tooSmall, values);
    if (wrong !== null) tone = 'bad';
  } else if (phase === 'zero') {
    message = fill(t.div.zero, values);
  } else if (state?.status === 'off-track') {
    message = t.activity.offTrackGuided;
    tone = 'bad';
  } else {
    message = fill(t.div.take, { ...values, q: step.digit, p: step.value / 10 ** step.place, place: placeName(t, unitRod - step.place, unitRod) });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <p className="font-extrabold text-4xl tabular">{dividend} ÷ {divisor}</p>
        <div className="text-right">
          <p className="text-xs font-bold uppercase tracking-wider text-muted">{t.div.quotient}</p>
          <p className="font-extrabold text-3xl tabular min-w-[2ch]">{quotient || '–'}</p>
        </div>
      </div>
      <Bubble tone={tone} pose={finished ? 'jump' : tone === 'bad' ? 'hurt' : 'talk'}>{message}</Bubble>
      {!finished && phase === 'ask' && <AnswerInput key={`${index}-${wrong}`} onSubmit={guess} />}
      {!finished && phase === 'zero' && <Button onClick={nextStep} autoFocus>{t.common.continue}</Button>}
      {!finished && phase === 'take' && (
        <Toolbar>
          {!guided && <ToolButton onClick={() => { setShowHint(true); setSlips(s => s + 1); }} disabled={showHint}>{t.common.hint}</ToolButton>}
          <ToolButton onClick={undo} disabled={!canUndo}>{t.common.undo}</ToolButton>
          <ToolButton onClick={() => reset(before)} disabled={!canUndo}>{t.common.restart}</ToolButton>
        </Toolbar>
      )}
      <Abacus board={board} onChange={phase === 'take' ? change : undefined} readOnly={phase !== 'take'} unitRod={unitRod}
        showValues={settings.showRodValues} hint={showHint && state?.status === 'on-track' ? state.next : null} />
    </div>
  );
};
