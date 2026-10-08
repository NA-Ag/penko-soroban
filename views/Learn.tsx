import React from 'react';
import { ArrowRight } from 'lucide-react';
import { routeHref, useApp } from '../AppContext';
import { UNITS } from '../core/course';
import { LESSONS, lessonsIn } from '../core/lessons';
import { useProgress } from '../core/progress';
import { fill } from '../i18n';
import { Penko } from '../components/Penko';
import { Seal } from '../components/Seal';
import { Card, Page, buttonClass } from '../components/ui';

// The Learn tab: Penko's welcome (or "continue where you left off"), then the course path
const Learn: React.FC = () => {
  const { t } = useApp();
  const { progress } = useProgress();
  const started = progress.lessons.length > 0;
  const next = LESSONS.find(l => !progress.lessons.includes(l.id));
  const nextTitle = next && (t.lessons[next.id as keyof typeof t.lessons] as { title: string }).title;

  return (
    <Page>
      <section className="flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6 mb-10">
        <Penko size={112} pose="talk" className="shrink-0" />
        <Card className="relative p-5 sm:p-6 w-full">
          <span aria-hidden="true" className="absolute -top-2 left-1/2 -translate-x-1/2 sm:top-auto sm:bottom-6 sm:-left-2 sm:translate-x-0 w-4 h-4 rotate-45 bg-surface border-l border-t sm:border-t-0 sm:border-b border-line" />
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold mb-2">{started ? t.home.welcomeBack : t.home.greeting}</h1>
          <p className="text-muted leading-relaxed mb-4">{next ? t.home.intro : t.home.allDone}</p>
          {next && (
            <a href={routeHref('lesson', next.id)} className={buttonClass()}>
              {started ? fill(t.home.continue, { lesson: nextTitle ?? '' }) : t.home.start}
              <ArrowRight size={18} aria-hidden="true" />
            </a>
          )}
        </Card>
      </section>

      <h2 className="font-display text-xl font-extrabold mb-4">{t.course.title}</h2>
      <ol className="relative">
        <span aria-hidden="true" className="absolute left-[22px] top-6 bottom-6 border-l-2 border-dashed border-line" />
        {UNITS.map((unit, i) => {
          const lessons = lessonsIn(unit.id);
          const done = lessons.filter(l => progress.lessons.includes(l.id)).length;
          const complete = done === lessons.length;
          return (
            <li key={unit.id} className="relative mb-3">
              <a href={routeHref('learn', unit.id)} className="group flex items-start gap-4 p-3 -m-1 rounded-2xl hover:bg-surface transition-colors">
                <span className="relative z-10 bg-paper rounded-lg text-shu">
                  <Seal kanji={unit.kanji} size={46} filled={complete} />
                </span>
                <span className="min-w-0 flex-1 pt-0.5">
                  <span className="block text-xs font-bold uppercase tracking-wider text-muted">{fill(t.course.unit, { n: i + 1 })}</span>
                  <span className="block font-display text-lg font-extrabold leading-snug group-hover:text-shu transition-colors">{t.units[unit.id].title}</span>
                  <span className="block text-sm text-muted">{t.units[unit.id].blurb}</span>
                  {done > 0 && (
                    <span className="mt-2 flex items-center gap-2">
                      <span className="h-1.5 w-24 rounded-full bg-sunken overflow-hidden">
                        <span className="block h-full bg-shu" style={{ width: `${(done / lessons.length) * 100}%` }} />
                      </span>
                      <span className="text-xs text-muted">{fill(t.course.progress, { done, total: lessons.length })}</span>
                    </span>
                  )}
                </span>
              </a>
            </li>
          );
        })}
      </ol>
    </Page>
  );
};

export default Learn;
