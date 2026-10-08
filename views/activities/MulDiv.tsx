import React, { useMemo, useState } from 'react';
import type { Activity } from '../../core/lessons';
import { divProblem, mulProblem } from '../../core/problems';
import { DivOnAbacus } from '../../components/DivOnAbacus';
import { MulOnAbacus } from '../../components/MulOnAbacus';
import { ContinueButton, Counter, type ActivityProps } from './shared';

type Mul = Extract<Activity, { type: 'mul' }>;
type Div = Extract<Activity, { type: 'div' }>;

// Fixed problems are walkthroughs (beads always glow); random ones are practice (hints on request)
export const MulActivity: React.FC<ActivityProps<Mul>> = ({ activity, onDone }) => {
  const guided = Array.isArray(activity.problems);
  const problems = useMemo(() => Array.isArray(activity.problems) ? activity.problems
    : Array.from({ length: activity.problems.count }, () => {
      const p = mulProblem((activity.problems as { a: number }).a, (activity.problems as { b: number }).b);
      return [p.a, p.b] as [number, number];
    }), [activity]);
  const [index, setIndex] = useState(0);
  const [slips, setSlips] = useState(0);
  const [solved, setSolved] = useState(false);
  const [a, b] = problems[index];

  return (
    <div className="space-y-4">
      {problems.length > 1 && <Counter n={index + 1} total={problems.length} />}
      <MulOnAbacus key={index} a={a} b={b} guided={guided} onFinish={s => { setSlips(x => x + s); setSolved(true); }} />
      {solved && <ContinueButton onClick={() => {
        setSolved(false);
        if (index + 1 >= problems.length) onDone(slips); else setIndex(i => i + 1);
      }} />}
    </div>
  );
};

export const DivActivity: React.FC<ActivityProps<Div>> = ({ activity, onDone }) => {
  const guided = Array.isArray(activity.problems);
  const problems = useMemo(() => {
    if (Array.isArray(activity.problems)) return activity.problems;
    const spec = activity.problems;
    return Array.from({ length: spec.count }, () => {
      const p = divProblem(spec.quotient, spec.divisor, spec.remainder ?? false);
      return [p.dividend, p.divisor] as [number, number];
    });
  }, [activity]);
  const [index, setIndex] = useState(0);
  const [slips, setSlips] = useState(0);
  const [solved, setSolved] = useState(false);
  const [dividend, divisor] = problems[index];

  return (
    <div className="space-y-4">
      {problems.length > 1 && <Counter n={index + 1} total={problems.length} />}
      <DivOnAbacus key={index} dividend={dividend} divisor={divisor} guided={guided}
        onFinish={s => { setSlips(x => x + s); setSolved(true); }} />
      {solved && <ContinueButton onClick={() => {
        setSolved(false);
        if (index + 1 >= problems.length) onDone(slips); else setIndex(i => i + 1);
      }} />}
    </div>
  );
};
