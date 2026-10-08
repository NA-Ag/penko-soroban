import React, { useMemo, useState } from 'react';
import type { Activity } from '../../core/lessons';
import { fromNumber } from '../../core/abacus';
import { randomWithDigits } from '../../core/problems';
import { fill } from '../../i18n';
import { useApp } from '../../AppContext';
import { Abacus } from '../../components/Abacus';
import { AnswerInput } from '../../components/AnswerInput';
import { Bubble } from '../../components/Bubble';
import { AFTER_CORRECT_MS, ContinueButton, Counter, type ActivityProps } from './shared';

type Read = Extract<Activity, { type: 'read' }>;

// The soroban shows a number: type what it says
const ReadNumber: React.FC<ActivityProps<Read>> = ({ activity, onDone }) => {
  const { t } = useApp();
  const values = useMemo(() => Array.from({ length: activity.count }, () => randomWithDigits(Math.random, activity.digits)), [activity]);
  const [index, setIndex] = useState(0);
  const [slips, setSlips] = useState(0);
  const [feedback, setFeedback] = useState<'good' | 'bad' | null>(null);

  const next = () => {
    setFeedback(null);
    if (index + 1 >= values.length) onDone(slips);
    else setIndex(i => i + 1);
  };

  const submit = (answer: number) => {
    if (answer === values[index]) {
      setFeedback('good');
      window.setTimeout(next, AFTER_CORRECT_MS);
    } else {
      setFeedback('bad');
      setSlips(s => s + 1);
    }
  };

  return (
    <div className="space-y-5">
      <Counter n={index + 1} total={values.length} />
      <Bubble tone={feedback ?? 'plain'} pose={feedback === 'good' ? 'jump' : 'talk'}>
        {feedback === 'good' ? t.common.correct : feedback === 'bad' ? fill(t.common.wrong, { answer: values[index] }) : t.activity.read}
      </Bubble>
      <Abacus board={fromNumber(values[index], activity.rods)} readOnly />
      {feedback === 'bad' ? <ContinueButton onClick={next} /> : <AnswerInput key={index} onSubmit={submit} disabled={feedback === 'good'} />}
    </div>
  );
};

export default ReadNumber;
