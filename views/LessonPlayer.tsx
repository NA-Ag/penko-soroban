import React, { useState } from 'react';
import { X } from 'lucide-react';
import { routeHref, useApp } from '../AppContext';
import { findLesson, LESSONS, type Activity } from '../core/lessons';
import { useProgress } from '../core/progress';
import { UNITS } from '../core/course';
import { fill } from '../i18n';
import { Penko } from '../components/Penko';
import { Seal } from '../components/Seal';
import { Card, Page, buttonClass } from '../components/ui';
import Say from './activities/Say';
import SetNumber from './activities/SetNumber';
import ReadNumber from './activities/ReadNumber';
import Guided from './activities/Guided';
import AbacusPractice from './activities/AbacusPractice';
import Quiz from './activities/Quiz';
import { DivActivity, MulActivity } from './activities/MulDiv';
import { BeadFlash, Flash, MentalList } from './activities/Mental';
import type { ActivityProps } from './activities/shared';

const renderActivity = (props: ActivityProps<Activity>) => {
  const { activity } = props;
  switch (activity.type) {
    case 'say': return <Say {...props} activity={activity} />;
    case 'set': case 'set-random': return <SetNumber {...props} activity={activity} />;
    case 'read': return <ReadNumber {...props} activity={activity} />;
    case 'guided': return <Guided {...props} activity={activity} />;
    case 'abacus': return <AbacusPractice {...props} activity={activity} />;
    case 'quiz': return <Quiz {...props} activity={activity} />;
    case 'mul': return <MulActivity {...props} activity={activity} />;
    case 'div': return <DivActivity {...props} activity={activity} />;
    case 'bead-flash': return <BeadFlash {...props} activity={activity} />;
    case 'mental': return <MentalList {...props} activity={activity} />;
    case 'flash': return <Flash {...props} activity={activity} />;
  }
};

const LessonPlayer: React.FC<{ id: string }> = ({ id }) => {
  const { t } = useApp();
  const { finishLesson } = useProgress();
  const lesson = findLesson(id);
  const [step, setStep] = useState(0);
  const [round, setRound] = useState(0); // bumps on "Do it again" to remount everything

  if (!lesson) return null;
  const texts = t.lessons[lesson.id as keyof typeof t.lessons] as Record<string, string>;
  const unitIndex = UNITS.findIndex(u => u.id === lesson.unit);
  const done = step >= lesson.activities.length;
  const next = LESSONS[LESSONS.indexOf(lesson) + 1];

  const complete = () => {
    if (step + 1 >= lesson.activities.length) finishLesson(lesson.id);
    setStep(s => s + 1);
    window.scrollTo({ top: 0 });
  };

  return (
    <Page className="max-w-2xl !pt-3 lg:!pt-10">
      <div className="flex items-center gap-3 mb-3 lg:mb-6">
        <a href={routeHref('learn', lesson.unit)} aria-label={t.lesson.exit} className="p-2 -ml-2 rounded-lg text-muted hover:text-ink">
          <X size={22} aria-hidden="true" />
        </a>
        <div className="flex-1 h-2 rounded-full bg-sunken overflow-hidden" role="progressbar"
          aria-valuemin={0} aria-valuemax={lesson.activities.length} aria-valuenow={step}
          aria-label={fill(t.lesson.step, { n: Math.min(step + 1, lesson.activities.length), total: lesson.activities.length })}>
          <div className="h-full bg-shu transition-all duration-300" style={{ width: `${(step / lesson.activities.length) * 100}%` }} />
        </div>
      </div>

      <p className="text-sm font-semibold text-shu">{fill(t.course.unit, { n: unitIndex + 1 })} · {t.units[lesson.unit].title}</p>
      <h1 className="font-display text-xl sm:text-3xl font-extrabold mb-4 lg:mb-6">{texts.title}</h1>

      {done ? (
        <Card className="p-6 text-center">
          <div className="relative w-fit mx-auto mb-4">
            <Penko size={96} pose="jump" />
            <span className="absolute -right-6 -top-2 text-shu rotate-12"><Seal kanji="済" filled size={44} /></span>
          </div>
          <h2 className="font-display text-2xl font-extrabold mb-1">{t.lesson.completeTitle}</h2>
          <p className="text-muted mb-6">{t.lesson.completeBody}</p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            {next && <a href={routeHref('lesson', next.id)} className={buttonClass()}>{t.lesson.nextLesson}</a>}
            <button className={buttonClass('quiet')} onClick={() => { setStep(0); setRound(r => r + 1); }}>{t.lesson.again}</button>
            <a href={routeHref('learn', lesson.unit)} className={buttonClass('quiet')}>{t.lesson.backToUnit}</a>
          </div>
        </Card>
      ) : (
        <div key={`${round}-${step}`}>
          {renderActivity({ activity: lesson.activities[step], texts, onDone: complete })}
        </div>
      )}
    </Page>
  );
};

export default LessonPlayer;
