import React from 'react';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { routeHref, useApp } from '../AppContext';
import { UNITS, type UnitId } from '../core/course';
import { lessonsIn } from '../core/lessons';
import { useProgress } from '../core/progress';
import { fill } from '../i18n';
import { Seal } from '../components/Seal';
import { Page } from '../components/ui';

const UnitView: React.FC<{ id: UnitId }> = ({ id }) => {
  const { t } = useApp();
  const { lessonDone } = useProgress();
  const index = UNITS.findIndex(u => u.id === id);
  const unit = UNITS[index];
  const lessons = lessonsIn(id);
  const nextId = lessons.find(l => !lessonDone(l.id))?.id;

  return (
    <Page className="max-w-2xl">
      <a href={routeHref('learn')} className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink mb-4">
        <ArrowLeft size={16} aria-hidden="true" /> {t.course.title}
      </a>
      <div className="flex items-center gap-4 mb-2">
        <span className="text-shu"><Seal kanji={unit.kanji} size={56} /></span>
        <div>
          <p className="text-sm font-semibold text-shu">{fill(t.course.unit, { n: index + 1 })}</p>
          <h1 className="font-display text-3xl font-extrabold">{t.units[id].title}</h1>
        </div>
      </div>
      <p className="text-muted mb-8">{t.units[id].blurb}</p>

      <h2 className="font-display text-lg font-extrabold mb-3">{t.course.lessons}</h2>
      <ol className="space-y-2">
        {lessons.map((lesson, i) => {
          const done = lessonDone(lesson.id);
          const texts = t.lessons[lesson.id as keyof typeof t.lessons] as { title: string };
          return (
            <li key={lesson.id}>
              <a href={routeHref('lesson', lesson.id)}
                className={`flex items-center gap-4 p-4 rounded-2xl border transition-colors ${lesson.id === nextId ? 'border-shu bg-shu/5' : 'border-line bg-surface hover:bg-sunken'}`}>
                <span className="w-8 text-center font-extrabold text-muted tabular">{i + 1}</span>
                <span className="flex-1 min-w-0">
                  <span className="block font-bold">{texts.title}</span>
                  {lesson.id === nextId && <span className="text-sm font-semibold text-shu">{t.course.lessonNext}</span>}
                </span>
                {done && (
                  <CheckCircle2 size={20} className="text-ok shrink-0" aria-label={t.course.lessonDone} />
                )}
              </a>
            </li>
          );
        })}
      </ol>
    </Page>
  );
};

export default UnitView;
