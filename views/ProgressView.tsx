import React, { useRef, useState } from 'react';
import { Download, Trash2, Upload } from 'lucide-react';
import { useApp } from '../AppContext';
import { UNITS } from '../core/course';
import { EXAMS } from '../core/exams';
import { lessonsIn } from '../core/lessons';
import { useProgress } from '../core/progress';
import { Seal } from '../components/Seal';
import { Button, Card, Page, PageTitle } from '../components/ui';
import { Certificate } from './Exams';

const ProgressView: React.FC = () => {
  const { t } = useApp();
  const { lessonDone, examPassed, exportBackup, importBackup, reset } = useProgress();
  const [message, setMessage] = useState<string | null>(null);
  const file = useRef<HTMLInputElement>(null);
  const passed = EXAMS.filter(e => examPassed(e.id)).reverse();

  const download = () => {
    const url = URL.createObjectURL(new Blob([exportBackup()], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `penko-soroban-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const restore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const chosen = e.target.files?.[0];
    e.target.value = '';
    if (!chosen) return;
    setMessage(importBackup(await chosen.text()) ? t.progress.imported : t.progress.importFailed);
  };

  return (
    <Page>
      <PageTitle>{t.progress.title}</PageTitle>


      {/* The stamp card: one seal per lesson, filled when done */}
      <section className="mb-8">
        <h2 className="font-display text-xl font-extrabold">{t.progress.stampCard}</h2>
        <p className="text-sm text-muted mb-3">{t.progress.stampCardBody}</p>
        <Card className="p-4 sm:p-5 space-y-4">
          {UNITS.map((unit, i) => (
            <div key={unit.id} className="flex items-center gap-3">
              <span className="w-28 sm:w-44 shrink-0 text-sm font-semibold truncate" title={t.units[unit.id].title}>
                {i + 1}. {t.units[unit.id].title}
              </span>
              <span className="flex flex-wrap gap-1.5">
                {lessonsIn(unit.id).map(lesson => {
                  const done = lessonDone(lesson.id);
                  const title = (t.lessons[lesson.id as keyof typeof t.lessons] as { title: string }).title;
                  return (
                    <span key={lesson.id} title={title} role="img" aria-label={`${title}${done ? ` · ${t.course.lessonDone}` : ''}`}
                      className={done ? 'text-shu' : 'text-line'}>
                      <Seal kanji={done ? '済' : unit.kanji} filled={done} size={30} />
                    </span>
                  );
                })}
              </span>
            </div>
          ))}
        </Card>
      </section>

      <section className="mb-8">
        <h2 className="font-display text-xl font-extrabold mb-3">{t.progress.certificates}</h2>
        {passed.length ? (
          <div className="grid sm:grid-cols-2 gap-4">
            {passed.map(e => <Certificate key={e.id} exam={e} />)}
          </div>
        ) : <p className="text-muted">{t.progress.noCertificates}</p>}
      </section>

      <section>
        <h2 className="font-display text-xl font-extrabold mb-1">{t.progress.backup}</h2>
        <p className="text-sm text-muted mb-3 max-w-2xl">{t.progress.backupBody}</p>
        <div className="flex flex-wrap gap-2">
          <Button variant="quiet" onClick={download}><Download size={16} aria-hidden="true" />{t.progress.export}</Button>
          <Button variant="quiet" onClick={() => file.current?.click()}><Upload size={16} aria-hidden="true" />{t.progress.import}</Button>
          <Button variant="quiet" onClick={() => { if (window.confirm(t.progress.resetConfirm)) reset(); }}>
            <Trash2 size={16} aria-hidden="true" />{t.progress.reset}
          </Button>
          <input ref={file} type="file" accept="application/json,.json" className="hidden" onChange={restore} />
        </div>
        {message && <p className="mt-3 font-semibold" role="status">{message}</p>}
      </section>
    </Page>
  );
};

export default ProgressView;
