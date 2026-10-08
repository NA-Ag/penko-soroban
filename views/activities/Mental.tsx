import React, { useMemo, useState } from 'react';
import type { Activity } from '../../core/lessons';
import { emptyBoard, fromNumber, type Board } from '../../core/abacus';
import { flashNumbers, listProblem, randomWithDigits } from '../../core/problems';
import { fill } from '../../i18n';
import { useApp } from '../../AppContext';
import { Abacus } from '../../components/Abacus';
import { AnswerInput } from '../../components/AnswerInput';
import { Bubble } from '../../components/Bubble';
import { FlashRunner } from '../../components/FlashRunner';
import { ProblemList } from '../../components/ProblemList';
import { Button } from '../../components/ui';
import { AFTER_CORRECT_MS, ContinueButton, Counter, type ActivityProps } from './shared';

// Shared flow for typed answers: right answers move on, wrong ones show the answer first
const useAnswers = (count: number, onDone: (slips: number) => void) => {
  const [index, setIndex] = useState(0);
  const [slips, setSlips] = useState(0);
  const [feedback, setFeedback] = useState<'good' | 'bad' | null>(null);
  const next = () => {
    setFeedback(null);
    if (index + 1 >= count) onDone(slips);
    else setIndex(i => i + 1);
  };
  const answer = (given: number, right: number) => {
    if (given === right) {
      setFeedback('good');
      window.setTimeout(next, AFTER_CORRECT_MS);
    } else {
      setFeedback('bad');
      setSlips(s => s + 1);
    }
  };
  return { index, feedback, answer, next };
};

// A soroban appears for a moment: type the number it showed
type BeadFlashActivity = Extract<Activity, { type: 'bead-flash' }>;
export const BeadFlash: React.FC<ActivityProps<BeadFlashActivity>> = ({ activity, onDone }) => {
  const { t } = useApp();
  const values = useMemo(() => Array.from({ length: activity.count }, () => randomWithDigits(Math.random, activity.digits)), [activity]);
  const { index, feedback, answer, next } = useAnswers(values.length, onDone);
  const [phase, setPhase] = useState<'wait' | 'show' | 'answer'>('wait');
  const rods = activity.digits + 1;
  const value = values[index];

  const show = () => {
    setPhase('show');
    window.setTimeout(() => setPhase('answer'), activity.ms);
  };

  return (
    <div className="space-y-5">
      <Counter n={index + 1} total={values.length} />
      <Bubble tone={feedback ?? 'plain'} pose={feedback === 'good' ? 'jump' : 'talk'}>
        {feedback === 'good' ? t.common.correct : feedback === 'bad' ? fill(t.common.wrong, { answer: value }) : t.activity.beadFlash}
      </Bubble>
      <div className={phase === 'show' || feedback === 'bad' ? '' : 'invisible'} aria-hidden={phase !== 'show'}>
        <Abacus board={fromNumber(value, rods)} readOnly />
      </div>
      {phase === 'wait' && <Button onClick={show} autoFocus>{t.activity.beadFlashShow}</Button>}
      {phase === 'answer' && (feedback === 'bad'
        ? <ContinueButton onClick={() => { setPhase('wait'); next(); }} />
        : <AnswerInput key={index} onSubmit={n => { answer(n, value); if (n === value) window.setTimeout(() => setPhase('wait'), AFTER_CORRECT_MS); }} disabled={feedback === 'good'} />)}
    </div>
  );
};

// Number lists in your head; peeking at a soroban counts as a hint
type MentalActivity = Extract<Activity, { type: 'mental' }>;
export const MentalList: React.FC<ActivityProps<MentalActivity>> = ({ activity, onDone }) => {
  const { t, settings } = useApp();
  const problems = useMemo(() => Array.from({ length: activity.count }, () => listProblem(activity.spec)), [activity]);
  const [peeks, setPeeks] = useState(0);
  const { index, feedback, answer, next } = useAnswers(problems.length, slips => onDone(slips + peeks));
  const [peek, setPeek] = useState(false);
  const [board, setBoard] = useState<Board>(() => emptyBoard(5));
  const problem = problems[index];

  return (
    <div className="space-y-5">
      <Counter n={index + 1} total={problems.length} />
      <Bubble tone={feedback ?? 'plain'} pose={feedback === 'good' ? 'jump' : 'talk'}>
        {feedback === 'good' ? t.common.correct : feedback === 'bad' ? fill(t.common.wrong, { answer: problem.answer }) : t.activity.mental}
      </Bubble>
      <div className="flex justify-center"><ProblemList terms={problem.terms} /></div>
      {feedback === 'bad'
        ? <ContinueButton onClick={() => { setPeek(false); setBoard(emptyBoard(5)); next(); }} />
        : <AnswerInput key={index} onSubmit={n => { answer(n, problem.answer); if (n === problem.answer) { setPeek(false); setBoard(emptyBoard(5)); } }} disabled={feedback === 'good'} />}
      {peek
        ? <Abacus board={board} onChange={setBoard} showValues={settings.showRodValues} />
        : <Button variant="quiet" onClick={() => { setPeek(true); setPeeks(p => p + 1); }}>{t.activity.peek}</Button>}
    </div>
  );
};

// Flash Anzan rounds
type FlashActivity = Extract<Activity, { type: 'flash' }>;
export const Flash: React.FC<ActivityProps<FlashActivity>> = ({ activity, onDone }) => {
  const { t } = useApp();
  const rounds = useMemo(() => Array.from({ length: activity.rounds }, () => flashNumbers(activity.digits, activity.numbers)), [activity]);
  const { index, feedback, answer, next } = useAnswers(rounds.length, onDone);
  const [phase, setPhase] = useState<'wait' | 'flash' | 'answer'>('wait');
  const numbers = rounds[index];
  const total = numbers.reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-5">
      <p className="text-xs font-bold uppercase tracking-wider text-muted">{fill(t.activity.flashRound, { n: index + 1, total: rounds.length })}</p>
      {phase === 'flash' ? <FlashRunner numbers={numbers} ms={activity.ms} onComplete={() => setPhase('answer')} /> : (
        <Bubble tone={feedback ?? 'plain'} pose={feedback === 'good' ? 'jump' : 'talk'}>
          {feedback === 'good' ? t.common.correct
            : feedback === 'bad' ? `${fill(t.common.wrong, { answer: total })} ${fill(t.activity.flashNumbers, { numbers: numbers.join(', ') })}`
            : t.activity.flash}
        </Bubble>
      )}
      {phase === 'wait' && <Button onClick={() => setPhase('flash')} autoFocus>{t.common.start}</Button>}
      {phase === 'answer' && (feedback === 'bad'
        ? <ContinueButton onClick={() => { setPhase('wait'); next(); }} />
        : <AnswerInput key={index} onSubmit={n => { answer(n, total); if (n === total) window.setTimeout(() => setPhase('wait'), AFTER_CORRECT_MS); }} disabled={feedback === 'good'} />)}
    </div>
  );
};
