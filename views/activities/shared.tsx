import React from 'react';
import { useApp } from '../../AppContext';
import { Button } from '../../components/ui';

// Every activity reports back how many slips (mistakes and hints) it took; that sets the stars
export interface ActivityProps<A> {
  activity: A;
  // Lesson text for this lesson: activities with a `text` key look their words up here
  texts: Record<string, string>;
  onDone: (slips: number) => void;
}

export const ContinueButton: React.FC<{ onClick: () => void; label?: string }> = ({ onClick, label }) => {
  const { t } = useApp();
  return <Button onClick={onClick} autoFocus className="w-full sm:w-auto">{label ?? t.common.continue}</Button>;
};

// "3 of 5" above a run of problems
export const Counter: React.FC<{ n: number; total: number }> = ({ n, total }) => {
  const { t } = useApp();
  return (
    <p className="text-xs font-bold uppercase tracking-wider text-muted mb-2">
      {t.activity.problem.replace('{n}', String(n)).replace('{total}', String(total))}
    </p>
  );
};

// A short pause after a right answer, then move on
export const AFTER_CORRECT_MS = 900;
