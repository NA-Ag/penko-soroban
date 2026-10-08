import React, { useRef, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { useApp } from '../AppContext';
import { fill } from '../i18n';
import { Penko } from './Penko';
import { Button, Card } from './ui';

export const formatTime = (ms: number) => {
  const s = Math.round(ms / 100) / 10;
  return s >= 60 ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}` : `${s.toFixed(1)} s`;
};

// End of a practice session: how it went this time. Nothing is saved or compared.
export const SessionResult: React.FC<{ correct: number; total: number; ms: number; onAgain: () => void; onBack: () => void }> = ({
  correct, total, ms, onAgain, onBack,
}) => {
  const { t } = useApp();
  return (
    <Card className="p-6 text-center">
      <Penko size={88} pose={correct === total ? 'jump' : 'talk'} className="mx-auto mb-3" />
      <h2 className="font-display text-2xl font-extrabold mb-1">{t.practice.resultTitle}</h2>
      <p className="text-4xl font-extrabold tabular my-3">{fill(t.practice.score, { correct, total })}</p>
      <p className="text-muted">{fill(t.practice.time, { time: formatTime(ms) })}</p>
      <div className="flex flex-col sm:flex-row gap-2 justify-center mt-6">
        <Button onClick={onAgain}><RotateCcw size={16} aria-hidden="true" />{t.common.again}</Button>
        <Button variant="quiet" onClick={onBack}>{t.nav.back}</Button>
      </div>
    </Card>
  );
};

// Runs a list of items one after another, timing the whole session
export const useSession = () => {
  const [round, setRound] = useState(0);
  const [index, setIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [ended, setEnded] = useState<number | null>(null);
  const startedAt = useRef(performance.now());
  return {
    round, index, correct, ms: ended ?? 0, done: ended !== null,
    answer: (right: boolean, total: number) => {
      if (right) setCorrect(c => c + 1);
      if (index + 1 >= total) setEnded(performance.now() - startedAt.current);
      else setIndex(i => i + 1);
    },
    restart: () => {
      setRound(r => r + 1); setIndex(0); setCorrect(0); setEnded(null);
      startedAt.current = performance.now();
    },
  };
};
