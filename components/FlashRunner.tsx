import React, { useEffect, useState } from 'react';
import { playBeep } from '../core/sound';
import { useApp } from '../AppContext';

// Flash Anzan: "Get ready", then each number for most of its interval with a short blank
// between (so two equal-looking numbers in a row still read as two), then calls onComplete
export const FlashRunner: React.FC<{ numbers: readonly number[]; ms: number; beep?: boolean; onComplete: () => void }> = ({
  numbers, ms, beep = false, onComplete,
}) => {
  const { t } = useApp();
  const [shown, setShown] = useState<number | 'ready' | null>('ready');

  useEffect(() => {
    const timers: number[] = [];
    const on = Math.round(ms * 0.8);
    let at = 1200; // "Get ready"
    timers.push(window.setTimeout(() => setShown(null), at - 250));
    numbers.forEach((n, i) => {
      timers.push(window.setTimeout(() => { setShown(i); if (beep) playBeep(); }, at));
      timers.push(window.setTimeout(() => setShown(null), at + on));
      at += ms;
    });
    timers.push(window.setTimeout(onComplete, at));
    return () => timers.forEach(clearTimeout);
  }, [numbers, ms, beep]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex items-center justify-center h-48 sm:h-64 rounded-2xl border border-line bg-surface shadow-card" aria-live="off">
      {shown === 'ready'
        ? <p className="text-xl font-bold text-muted">{t.common.ready}</p>
        : shown !== null && <p className="font-extrabold tabular text-7xl sm:text-8xl">{numbers[shown]}</p>}
    </div>
  );
};
