import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Clock } from 'lucide-react';
import { routeHref, useApp } from '../AppContext';
import { emptyBoard, type Board } from '../core/abacus';
import { EXAMS, gradeExam, makePaper, PER_SECTION, type ExamDef, type ExamQuestion, type ExamScore, type Grade } from '../core/exams';
import { useProgress } from '../core/progress';
import { fill, type Strings } from '../i18n';
import { Abacus } from '../components/Abacus';
import { AnswerInput } from '../components/AnswerInput';
import { Bubble } from '../components/Bubble';
import { FlashRunner } from '../components/FlashRunner';
import { Penko } from '../components/Penko';
import { ProblemList } from '../components/ProblemList';
import { Seal } from '../components/Seal';
import { Button, Card, Page, PageTitle, buttonClass } from '../components/ui';

export const gradeName = (t: Strings, grade: Grade) => fill(grade.kind === 'kyu' ? t.exams.kyu : t.exams.dan, { n: grade.n });

// A certificate with Penko's red "passed" (合格) seal. The score shows only right after passing:
// nothing about how or when an exam went is kept.
export const Certificate: React.FC<{ exam: ExamDef; score?: number }> = ({ exam, score }) => {
  const { t } = useApp();
  return (
    <div className="relative rounded-2xl border-4 border-double border-gold/60 bg-surface p-6 sm:p-8 text-center shadow-card overflow-hidden">
      <p className="text-xs font-bold uppercase tracking-[0.25em] text-gold">{t.exams.certificate}</p>
      <p className="mt-3 text-muted">{t.exams.certifies}</p>
      <p className="font-display text-4xl font-extrabold my-2">{gradeName(t, exam.grade)}</p>
      {score !== undefined && <p className="text-sm text-muted tabular">{score}%</p>}
      <div className="flex items-end justify-center gap-4 mt-5">
        <Penko size={64} />
        <span className="text-shu -rotate-6"><Seal kanji="合格" filled size={64} className="!text-[22px] tracking-tighter" /></span>
      </div>
    </div>
  );
};

// ── Taking an exam ──────────────────────────────────────────────────────────

const SECTIONS = ['abacus', 'mental', 'flash'] as const;
type Section = (typeof SECTIONS)[number];

const Timer: React.FC<{ seconds: number; onEnd: () => void }> = ({ seconds, onEnd }) => {
  const { t } = useApp();
  const [left, setLeft] = useState(seconds);
  useEffect(() => {
    const started = Date.now();
    const timer = window.setInterval(() => {
      const remaining = seconds - Math.floor((Date.now() - started) / 1000);
      setLeft(remaining);
      if (remaining <= 0) { window.clearInterval(timer); onEnd(); }
    }, 250);
    return () => window.clearInterval(timer);
  }, [seconds]); // eslint-disable-line react-hooks/exhaustive-deps
  const time = `${Math.floor(Math.max(left, 0) / 60)}:${String(Math.max(left, 0) % 60).padStart(2, '0')}`;
  return (
    <p className={`inline-flex items-center gap-1.5 font-bold tabular ${left <= 30 ? 'text-shu' : 'text-muted'}`} role="timer" aria-live="off">
      <Clock size={16} aria-hidden="true" /> {fill(t.exams.timeLeft, { time })}
    </p>
  );
};

const Question: React.FC<{ q: ExamQuestion; section: Section; onAnswer: (n: number) => void }> = ({ q, section, onAnswer }) => {
  const { t, settings } = useApp();
  const [board, setBoard] = useState<Board>(() => emptyBoard(Math.min(13, Math.max(5, String(q.answer).length + 2, q.kind === 'div' ? String(q.dividend).length + 1 : 0))));
  const [flashed, setFlashed] = useState(section !== 'flash');

  return (
    <div className="space-y-5">
      {q.kind === 'list' && <div className="flex justify-center"><ProblemList terms={q.problem.terms} /></div>}
      {q.kind === 'mul' && <p className="text-center font-extrabold text-4xl tabular">{q.a} × {q.b}</p>}
      {q.kind === 'div' && <p className="text-center font-extrabold text-4xl tabular">{q.dividend} ÷ {q.divisor}</p>}
      {q.kind === 'flash' && !flashed && <FlashRunner numbers={q.numbers} ms={q.ms} onComplete={() => setFlashed(true)} />}
      {section === 'abacus' && (
        <>
          <p className="text-sm text-muted">{t.exams.scratch}</p>
          <Abacus board={board} onChange={setBoard} showValues={settings.showRodValues} />
          <Button variant="quiet" onClick={() => setBoard(emptyBoard(board.length))}>{t.abacus.clear}</Button>
        </>
      )}
      {flashed && <AnswerInput onSubmit={onAnswer} />}
    </div>
  );
};

const ExamRunner: React.FC<{ exam: ExamDef }> = ({ exam }) => {
  const { t } = useApp();
  const { passExam } = useProgress();
  const paper = useMemo(() => makePaper(exam), [exam]);
  const [stage, setStage] = useState<'intro' | Section | 'result'>('intro');
  const [index, setIndex] = useState(0);
  const [sectionStarted, setSectionStarted] = useState(false);
  const [score, setScore] = useState<ExamScore>({ abacus: 0, mental: 0, flash: 0 });

  const nextSection = (from: Section) => {
    const i = SECTIONS.indexOf(from);
    setIndex(0);
    setSectionStarted(false);
    setStage(i + 1 < SECTIONS.length ? SECTIONS[i + 1] : 'result');
  };

  const result = gradeExam(score);
  useEffect(() => {
    if (stage !== 'result') return;
    if (result.passed) passExam(exam.id);
  }, [stage]); // eslint-disable-line react-hooks/exhaustive-deps

  const sectionName = (s: Section) => t.exams.sections[s];

  if (stage === 'intro') {
    return (
      <Card className="p-6 space-y-4">
        <h2 className="font-display text-2xl font-extrabold">{gradeName(t, exam.grade)}</h2>
        <ol className="space-y-2">
          {SECTIONS.map((s, i) => (
            <li key={s} className="flex justify-between gap-4 border-b border-line pb-2">
              <span className="font-semibold">{fill(t.exams.sectionIntro, { n: i + 1, name: sectionName(s) })}</span>
              <span className="text-muted tabular">{PER_SECTION[s]}{s !== 'flash' && ` · ${fill(t.common.minutes, { m: exam.minutes[s] })}`}</span>
            </li>
          ))}
        </ol>
        <p className="text-sm text-muted">{t.exams.pass}. {t.exams.note}</p>
        <Button onClick={() => setStage('abacus')}>{t.common.start}</Button>
      </Card>
    );
  }

  if (stage === 'result') {
    return (
      <div className="space-y-5">
        {result.passed ? (
          <>
            <Bubble tone="good" pose="jump">{t.exams.passTitle} {fill(t.exams.passBody, { grade: gradeName(t, exam.grade) })}</Bubble>
            <Certificate exam={exam} score={result.percent} />
          </>
        ) : (
          <Bubble tone="bad" pose="hurt"><strong>{t.exams.failTitle}.</strong> {t.exams.failBody}</Bubble>
        )}
        <Card className="p-5">
          <p className="font-display text-3xl font-extrabold tabular mb-2">{result.percent}%</p>
          <ul className="space-y-1 text-muted">
            {SECTIONS.map(s => <li key={s}>{fill(t.exams.sectionScore, { name: sectionName(s), correct: score[s], total: PER_SECTION[s] })}</li>)}
          </ul>
        </Card>
        <a href={routeHref('exams')} className={buttonClass('quiet')}>{t.nav.back}</a>
      </div>
    );
  }

  const section = stage;
  const questions = paper[section];
  if (!sectionStarted) {
    return (
      <Card className="p-6 space-y-4 text-center">
        <p className="text-sm font-bold uppercase tracking-wider text-shu">{fill(t.exams.sectionIntro, { n: SECTIONS.indexOf(section) + 1, name: sectionName(section) })}</p>
        <p className="text-muted">{PER_SECTION[section]}{section !== 'flash' && ` · ${fill(t.common.minutes, { m: exam.minutes[section] })}`}</p>
        <Button autoFocus onClick={() => setSectionStarted(true)}>{t.common.start}</Button>
      </Card>
    );
  }

  const answer = (n: number) => {
    if (n === questions[index].answer) setScore(s => ({ ...s, [section]: s[section] + 1 }));
    if (index + 1 >= questions.length) nextSection(section);
    else setIndex(i => i + 1);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-bold uppercase tracking-wider text-shu">
          {sectionName(section)} · {fill(t.common.of, { n: index + 1, total: questions.length })}
        </p>
        {section !== 'flash' && <Timer key={section} seconds={exam.minutes[section] * 60} onEnd={() => nextSection(section)} />}
      </div>
      <Question key={`${section}-${index}`} q={questions[index]} section={section} onAnswer={answer} />
    </div>
  );
};

// ── The Exams tab ───────────────────────────────────────────────────────────

const Exams: React.FC<{ id?: string }> = ({ id }) => {
  const { t } = useApp();
  const { examPassed } = useProgress();
  const exam = id ? EXAMS.find(e => e.id === id) : undefined;

  if (exam) {
    return (
      <Page className="max-w-2xl">
        <a href={routeHref('exams')} className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink mb-4">
          <ArrowLeft size={16} aria-hidden="true" /> {t.exams.title}
        </a>
        <PageTitle>{gradeName(t, exam.grade)}</PageTitle>
        <ExamRunner exam={exam} />
      </Page>
    );
  }

  const next = EXAMS.find(e => !examPassed(e.id));
  return (
    <Page className="max-w-3xl">
      <PageTitle>{t.exams.title}</PageTitle>
      <p className="text-muted mb-2 max-w-2xl">{t.exams.intro}</p>
      <p className="text-sm text-muted mb-6 max-w-2xl">{t.exams.note}</p>
      <ol className="space-y-2">
        {EXAMS.map(e => {
          const passed = examPassed(e.id);
          const recommended = e.id === next?.id;
          return (
            <li key={e.id}>
              <a href={routeHref('exams', e.id)}
                className={`flex items-center gap-4 p-4 rounded-2xl border transition-colors ${recommended ? 'border-shu bg-shu/5' : 'border-line bg-surface hover:bg-sunken'}`}>
                <span className={passed ? 'text-shu' : 'text-muted'}>
                  <Seal kanji={e.grade.kind === 'kyu' ? '級' : '段'} filled={passed} size={40} />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block font-display font-extrabold text-lg">{gradeName(t, e.grade)}</span>
                  <span className="block text-sm text-muted">
                    {passed ? t.exams.passed
                      : recommended ? <span className="font-semibold text-shu">{t.exams.recommended}</span>
                      : fill(t.exams.contents, { abacus: PER_SECTION.abacus, mental: PER_SECTION.mental, flash: PER_SECTION.flash })}
                  </span>
                </span>
                <span className="text-sm font-semibold text-shu shrink-0">{t.exams.start}</span>
              </a>
            </li>
          );
        })}
      </ol>
    </Page>
  );
};

export default Exams;
