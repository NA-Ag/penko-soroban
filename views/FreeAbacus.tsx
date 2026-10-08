import React, { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { useApp } from '../AppContext';
import { emptyBoard, toNumber, type Board } from '../core/abacus';
import { Abacus } from '../components/Abacus';
import { Button, Choice, Page, PageTitle, Toggle } from '../components/ui';

const ROD_OPTIONS = [5, 7, 9, 13] as const;

// Play with the beads: nothing scored, nothing saved
const FreeAbacus: React.FC = () => {
  const { t, settings, updateSettings } = useApp();
  const [rods, setRods] = useState<number>(() => (window.innerWidth < 640 ? 5 : 9));
  const [board, setBoard] = useState<Board>(() => emptyBoard(rods));

  const changeRods = (n: number) => {
    setRods(n);
    setBoard(emptyBoard(n));
  };

  return (
    <Page className="max-w-5xl">
      <PageTitle>{t.free.title}</PageTitle>
      <p className="text-muted mb-6 max-w-2xl">{t.free.intro}</p>

      <div className="flex items-end justify-between gap-4 mb-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">{t.abacus.value}</p>
          <p className="font-display text-5xl font-extrabold tabular" aria-live="polite">{toNumber(board).toLocaleString()}</p>
        </div>
        <Button variant="quiet" onClick={() => setBoard(emptyBoard(rods))}>
          <RotateCcw size={16} aria-hidden="true" />
          {t.abacus.clear}
        </Button>
      </div>

      <Abacus board={board} onChange={setBoard} showValues={settings.showRodValues} />

      <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-2">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-muted">{t.free.rods}</span>
          <Choice label={t.free.rods} value={rods} options={ROD_OPTIONS.map(n => ({ value: n, label: String(n) }))} onChange={changeRods} />
        </div>
        <div className="min-w-[16rem]">
          <Toggle label={t.abacus.showValues} checked={settings.showRodValues} onChange={on => updateSettings({ showRodValues: on })} />
        </div>
      </div>
    </Page>
  );
};

export default FreeAbacus;
