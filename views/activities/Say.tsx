import React from 'react';
import type { Activity } from '../../core/lessons';
import { fromNumber } from '../../core/abacus';
import { Abacus } from '../../components/Abacus';
import { Bubble } from '../../components/Bubble';
import { ContinueButton, type ActivityProps } from './shared';

type Say = Extract<Activity, { type: 'say' }>;

const Say: React.FC<ActivityProps<Say>> = ({ activity, texts, onDone }) => (
  <div className="space-y-6">
    <Bubble>{texts[activity.text]}</Bubble>
    {activity.board && (
      <div className="max-w-md mx-auto">
        <Abacus board={fromNumber(activity.board.value, activity.board.rods)} readOnly glow={activity.board.glow} showValues />
      </div>
    )}
    <ContinueButton onClick={() => onDone(0)} />
  </div>
);

export default Say;
