import React, { useMemo, useState } from 'react';
import type { Activity } from '../../core/lessons';
import { listProblem, rodsFor } from '../../core/problems';
import { useApp } from '../../AppContext';
import { Bubble } from '../../components/Bubble';
import { ListOnAbacus } from '../../components/ListOnAbacus';
import { Counter, ContinueButton, type ActivityProps } from './shared';

type AbacusActivity = Extract<Activity, { type: 'abacus' }>;

const AbacusPractice: React.FC<ActivityProps<AbacusActivity>> = ({ activity, onDone }) => {
  const { t } = useApp();
  const rods = Math.max(3, rodsFor(activity.spec));
  const problems = useMemo(() => Array.from({ length: activity.count }, () => listProblem({ ...activity.spec, rods })), [activity, rods]);
  const [index, setIndex] = useState(0);
  const [slips, setSlips] = useState(0);
  const [solved, setSolved] = useState(false);

  const finish = (problemSlips: number) => {
    setSlips(s => s + problemSlips);
    setSolved(true);
  };

  const next = () => {
    setSolved(false);
    if (index + 1 >= problems.length) onDone(slips);
    else setIndex(i => i + 1);
  };

  return (
    <div className="space-y-4">
      <Counter n={index + 1} total={problems.length} />
      <ListOnAbacus key={index} problem={problems[index]} rods={rods} prompt={t.activity.practice} onFinish={finish} />
      {solved && (
        <div className="space-y-4">
          <Bubble tone="good" pose="jump">{t.common.correct}</Bubble>
          <ContinueButton onClick={next} />
        </div>
      )}
    </div>
  );
};

export default AbacusPractice;
