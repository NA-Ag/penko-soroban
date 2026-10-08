import React, { useMemo, useState } from 'react';
import type { Activity } from '../../core/lessons';
import { randomInt, tableQuestion } from '../../core/problems';
import { fill } from '../../i18n';
import { useApp } from '../../AppContext';
import { AnswerInput } from '../../components/AnswerInput';
import { Bubble } from '../../components/Bubble';
import { AFTER_CORRECT_MS, ContinueButton, Counter, type ActivityProps } from './shared';

type Quiz = Extract<Activity, { type: 'quiz' }>;

export const quizQuestions = (kind: Quiz['kind'], count: number) => Array.from({ length: count }, () => {
  if (kind === 'table') return tableQuestion();
  const total = kind === 'five' ? 5 : 10;
  const n = randomInt(Math.random, 1, total - 1);
  return { a: n, b: 0, answer: total - n };
});

// Quick typed answers: small friends, big friends or times tables
const Quiz: React.FC<ActivityProps<Quiz>> = ({ activity, onDone }) => {
  const { t } = useApp();
  const questions = useMemo(() => quizQuestions(activity.kind, activity.count), [activity]);
  const [index, setIndex] = useState(0);
  const [slips, setSlips] = useState(0);
  const [feedback, setFeedback] = useState<'good' | 'bad' | null>(null);
  const q = questions[index];

  const next = () => {
    setFeedback(null);
    if (index + 1 >= questions.length) onDone(slips);
    else setIndex(i => i + 1);
  };

  const submit = (answer: number) => {
    if (answer === q.answer) {
      setFeedback('good');
      window.setTimeout(next, AFTER_CORRECT_MS / 2);
    } else {
      setFeedback('bad');
      setSlips(s => s + 1);
    }
  };

  const question = activity.kind === 'five' ? fill(t.activity.quizFive, { n: q.a })
    : activity.kind === 'ten' ? fill(t.activity.quizTen, { n: q.a })
    : fill(t.activity.quizTable, { a: q.a, b: q.b });

  return (
    <div className="space-y-5">
      <Counter n={index + 1} total={questions.length} />
      <Bubble tone={feedback ?? 'plain'} pose={feedback === 'good' ? 'jump' : 'talk'}>
        {feedback === 'good' ? t.common.correct : feedback === 'bad' ? fill(t.common.wrong, { answer: q.answer }) : question}
      </Bubble>
      <p className="text-center font-extrabold text-5xl tabular py-4" aria-hidden="true">
        {activity.kind === 'table' ? `${q.a} × ${q.b}` : `${q.a} + ? = ${activity.kind === 'five' ? 5 : 10}`}
      </p>
      {feedback === 'bad' ? <ContinueButton onClick={next} /> : <AnswerInput key={index} onSubmit={submit} disabled={feedback === 'good'} />}
    </div>
  );
};

export default Quiz;
