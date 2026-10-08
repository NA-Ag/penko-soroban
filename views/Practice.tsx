import React, { useMemo, useState } from 'react';
import { ArrowLeft, Brain, Calculator, Divide, Grid3x3, Hand, Sparkles, X as Times } from 'lucide-react';
import { routeHref, useApp } from '../AppContext';
import type { Technique } from '../core/abacus';
import { divProblem, listProblem, mulProblem, randomInt, rodsFor, tableQuestion, type ListSpec } from '../core/problems';
import { fill } from '../i18n';
import { AnswerInput } from '../components/AnswerInput';
import { Bubble } from '../components/Bubble';
import { DivOnAbacus } from '../components/DivOnAbacus';
import { ListOnAbacus } from '../components/ListOnAbacus';
import { MulOnAbacus } from '../components/MulOnAbacus';
import { ProblemList } from '../components/ProblemList';
import { SessionResult, useSession } from '../components/Session';
import { Button, Card, Choice, Page, PageTitle, Toggle } from '../components/ui';
import FreeAbacus from './FreeAbacus';

const BackLink: React.FC<{ to: string; label: string }> = ({ to, label }) => (
  <a href={routeHref(to)} className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink mb-4">
    <ArrowLeft size={16} aria-hidden="true" /> {label}
  </a>
);

// ── Setup choices ───────────────────────────────────────────────────────────

type TechniqueChoice = 'direct' | 'five' | 'ten' | 'all';
const TECHNIQUES: Record<TechniqueChoice, { allow: Technique[]; require?: Technique[] }> = {
  direct: { allow: ['direct'] },
  five: { allow: ['direct', 'five'], require: ['five'] },
  ten: { allow: ['direct', 'five', 'ten'], require: ['ten'] },
  all: { allow: ['direct', 'five', 'ten', 'ten-five'] },
};

interface DrillSetup { technique: TechniqueChoice; ops: ListSpec['ops']; digits: number; terms: number; count: number }

const DrillSetupForm: React.FC<{ value: DrillSetup; onChange: (v: DrillSetup) => void; onStart: () => void }> = ({ value, onChange, onStart }) => {
  const { t } = useApp();
  const row = (label: string, control: React.ReactNode) => (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-semibold text-muted">{label}</span>
      {control}
    </div>
  );
  return (
    <Card className="p-5 space-y-5">
      <h2 className="font-display text-lg font-extrabold">{t.practice.setup}</h2>
      {row(t.practice.technique, <Choice label={t.practice.technique} value={value.technique} onChange={technique => onChange({ ...value, technique })}
        options={(['direct', 'five', 'ten', 'all'] as const).map(v => ({ value: v, label: t.practice.techniques[v] }))} />)}
      {row(t.practice.ops, <Choice label={t.practice.ops} value={value.ops} onChange={ops => onChange({ ...value, ops })}
        options={[{ value: '+', label: t.practice.opsAdd }, { value: '-', label: t.practice.opsSub }, { value: '+-', label: t.practice.opsBoth }]} />)}
      {row(t.practice.digits, <Choice label={t.practice.digits} value={value.digits} onChange={digits => onChange({ ...value, digits })}
        options={[1, 2, 3, 4].map(n => ({ value: n, label: String(n) }))} />)}
      {row(t.practice.numbers, <Choice label={t.practice.numbers} value={value.terms} onChange={terms => onChange({ ...value, terms })}
        options={[2, 3, 5, 8, 10].map(n => ({ value: n, label: String(n) }))} />)}
      {row(t.practice.problems, <Choice label={t.practice.problems} value={value.count} onChange={count => onChange({ ...value, count })}
        options={[5, 10, 20].map(n => ({ value: n, label: String(n) }))} />)}
      <Button onClick={onStart} className="w-full sm:w-auto">{t.common.start}</Button>
    </Card>
  );
};

const specFor = (setup: DrillSetup): ListSpec => ({
  digits: setup.digits, terms: setup.terms, ops: setup.ops, ...TECHNIQUES[setup.technique],
});

// ── Abacus and mental drills ────────────────────────────────────────────────

const Drill: React.FC<{ mental: boolean }> = ({ mental }) => {
  const { t, navigate } = useApp();
  const [setup, setSetup] = useState<DrillSetup>({ technique: 'all', ops: '+-', digits: 1, terms: 3, count: 10 });
  const [running, setRunning] = useState(false);
  const session = useSession();
  const spec = specFor(setup);
  const rods = Math.max(3, rodsFor(spec));
  const problems = useMemo(() => running ? Array.from({ length: setup.count }, () => listProblem({ ...spec, rods })) : [],
    [running, session.round]); // eslint-disable-line react-hooks/exhaustive-deps
  const [feedback, setFeedback] = useState<{ answer: number } | null>(null);
  const key = `${mental ? 'mental' : 'abacus'}:${setup.technique}:${setup.ops}:${setup.digits}:${setup.terms}:${setup.count}`;

  const title = mental ? t.practice.mentalTitle : t.practice.drillTitle;
  if (!running) {
    return (
      <Page className="max-w-2xl">
        <BackLink to="practice" label={t.practice.title} />
        <PageTitle>{title}</PageTitle>
        <DrillSetupForm value={setup} onChange={setSetup} onStart={() => { setRunning(true); session.restart(); }} />
      </Page>
    );
  }

  const problem = problems[session.index];
  return (
    <Page className="max-w-3xl">
      <BackLink to="practice" label={t.practice.title} />
      <PageTitle kicker={fill(t.activity.problem, { n: Math.min(session.index + 1, setup.count), total: setup.count })}>{title}</PageTitle>
      {session.done ? (
        <SessionResult correct={session.correct} total={setup.count} ms={session.ms} 
          onAgain={() => session.restart()} onBack={() => setRunning(false)} />
      ) : mental ? (
        <div className="space-y-5">
          {feedback && <Bubble tone="bad">{fill(t.common.wrong, { answer: feedback.answer })}</Bubble>}
          <div className="flex justify-center"><ProblemList terms={problem.terms} /></div>
          {feedback
            ? <Button onClick={() => { setFeedback(null); session.answer(false, setup.count); }} autoFocus>{t.common.next}</Button>
            : <AnswerInput key={`${session.round}-${session.index}`} onSubmit={n => {
              if (n === problem.answer) session.answer(true, setup.count); else setFeedback({ answer: problem.answer });
            }} />}
        </div>
      ) : (
        <ListOnAbacus key={`${session.round}-${session.index}`} problem={problem} rods={rods}
          onFinish={slips => { window.setTimeout(() => session.answer(slips === 0, setup.count), 500); }} />
      )}
      {!session.done && <Button variant="quiet" className="mt-6" onClick={() => navigate('practice')}>{t.common.close}</Button>}
    </Page>
  );
};

// ── Multiplication and division ─────────────────────────────────────────────

// Sizes, labelled with an example problem of that size
const MUL_SIZES = [[2, 1, '47 × 6'], [3, 1, '315 × 8'], [2, 2, '47 × 26'], [3, 2, '315 × 26']] as const;
const DIV_SIZES = [[2, 1, '84 ÷ 4'], [3, 1, '936 ÷ 6'], [2, 2, '312 ÷ 24']] as const;

const MulDivPractice: React.FC<{ kind: 'mul' | 'div' }> = ({ kind }) => {
  const { t } = useApp();
  const sizes = kind === 'mul' ? MUL_SIZES : DIV_SIZES;
  const [size, setSize] = useState(0);
  const [remainder, setRemainder] = useState(false);
  const [running, setRunning] = useState(false);
  const session = useSession();
  const count = 5;
  const problems = useMemo(() => !running ? [] : Array.from({ length: count }, () => {
    const [x, y] = sizes[size];
    if (kind === 'mul') { const p = mulProblem(x, y); return [p.a, p.b] as const; }
    const p = divProblem(x, y, remainder);
    return [p.dividend, p.divisor] as const;
  }), [running, session.round]); // eslint-disable-line react-hooks/exhaustive-deps
  const title = kind === 'mul' ? t.practice.mulTitle : t.practice.divTitle;

  if (!running) {
    return (
      <Page className="max-w-2xl">
        <BackLink to="practice" label={t.practice.title} />
        <PageTitle>{title}</PageTitle>
        <Card className="p-5 space-y-5">
          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-muted">{t.practice.factors}</span>
            <Choice label={t.practice.factors} value={size} onChange={setSize} options={sizes.map(([, , example], i) => ({ value: i, label: example }))} />
          </div>
          {kind === 'div' && <Toggle label={t.practice.remainders} checked={remainder} onChange={setRemainder} />}
          <Button onClick={() => { setRunning(true); session.restart(); }}>{t.common.start}</Button>
        </Card>
      </Page>
    );
  }

  const [x, y] = problems[session.index] ?? [0, 0];
  return (
    <Page className="max-w-3xl">
      <BackLink to="practice" label={t.practice.title} />
      <PageTitle kicker={fill(t.activity.problem, { n: Math.min(session.index + 1, count), total: count })}>{title}</PageTitle>
      {session.done ? (
        <SessionResult correct={session.correct} total={count} ms={session.ms}
          onAgain={() => session.restart()} onBack={() => setRunning(false)} />
      ) : kind === 'mul' ? (
        <MulOnAbacus key={`${session.round}-${session.index}`} a={x} b={y} guided={false}
          onFinish={slips => { window.setTimeout(() => session.answer(slips === 0, count), 900); }} />
      ) : (
        <DivOnAbacus key={`${session.round}-${session.index}`} dividend={x} divisor={y} guided={false}
          onFinish={slips => { window.setTimeout(() => session.answer(slips === 0, count), 1200); }} />
      )}
    </Page>
  );
};

// ── Quick-fire quizzes: times tables and friends ────────────────────────────

const QuickFire: React.FC<{ kind: 'tables' | 'friends' }> = ({ kind }) => {
  const { t } = useApp();
  const session = useSession();
  const count = 20;
  const questions = useMemo(() => Array.from({ length: count }, () => {
    if (kind === 'tables') { const q = tableQuestion(); return { text: `${q.a} × ${q.b}`, prompt: fill(t.activity.quizTable, q), answer: q.answer }; }
    const total = Math.random() < 0.5 ? 5 : 10;
    const n = randomInt(Math.random, 1, total - 1);
    return { text: `${n} + ? = ${total}`, prompt: fill(total === 5 ? t.activity.quizFive : t.activity.quizTen, { n }), answer: total - n };
  }), [kind, session.round, t]);
  const [wrong, setWrong] = useState<number | null>(null);
  const title = kind === 'tables' ? t.practice.tablesTitle : t.practice.friendsTitle;
  const q = questions[session.index];

  return (
    <Page className="max-w-xl">
      <BackLink to="practice" label={t.practice.title} />
      <PageTitle kicker={!session.done && fill(t.activity.problem, { n: session.index + 1, total: count })}>{title}</PageTitle>
      {session.done ? (
        <SessionResult correct={session.correct} total={count} ms={session.ms} onAgain={session.restart} onBack={() => history.back()} />
      ) : (
        <div className="space-y-5">
          <p className="text-center font-extrabold text-6xl tabular py-6" aria-hidden="true">{q.text}</p>
          <p className="sr-only">{q.prompt}</p>
          {wrong !== null && <Bubble tone="bad">{fill(t.common.wrong, { answer: q.answer })}</Bubble>}
          {wrong !== null
            ? <Button onClick={() => { setWrong(null); session.answer(false, count); }} autoFocus>{t.common.next}</Button>
            : <AnswerInput key={`${session.round}-${session.index}`} onSubmit={n => {
              if (n === q.answer) session.answer(true, count); else setWrong(n);
            }} />}
        </div>
      )}
    </Page>
  );
};

// ── The Practice tab ────────────────────────────────────────────────────────

const PracticeHome: React.FC = () => {
  const { t } = useApp();
  const items = [
    { to: 'drill', icon: Hand, title: t.practice.drillTitle, blurb: t.practice.drillBlurb },
    { to: 'mental', icon: Brain, title: t.practice.mentalTitle, blurb: t.practice.mentalBlurb },
    { to: 'mul', icon: Times, title: t.practice.mulTitle, blurb: t.practice.mulBlurb },
    { to: 'div', icon: Divide, title: t.practice.divTitle, blurb: t.practice.divBlurb },
    { to: 'tables', icon: Grid3x3, title: t.practice.tablesTitle, blurb: t.practice.tablesBlurb },
    { to: 'friends', icon: Sparkles, title: t.practice.friendsTitle, blurb: t.practice.friendsBlurb },
    { to: 'free', icon: Calculator, title: t.practice.freeTitle, blurb: t.practice.freeBlurb },
  ];
  return (
    <Page>
      <PageTitle>{t.practice.title}</PageTitle>
      <p className="text-muted mb-6 max-w-2xl">{t.practice.intro}</p>
      <div className="grid sm:grid-cols-2 gap-3">
        {items.map(({ to, icon: Icon, title, blurb }) => (
          <a key={to} href={routeHref('practice', to)} className="flex items-start gap-4 p-4 rounded-2xl border border-line bg-surface shadow-card hover:border-shu/50 transition-colors">
            <span className="w-11 h-11 shrink-0 rounded-xl bg-shu/10 text-shu flex items-center justify-center"><Icon size={22} aria-hidden="true" /></span>
            <span>
              <span className="block font-display font-extrabold text-lg">{title}</span>
              <span className="block text-sm text-muted">{blurb}</span>
            </span>
          </a>
        ))}
      </div>
    </Page>
  );
};

const Practice: React.FC<{ sub?: string }> = ({ sub }) => {
  switch (sub) {
    case 'drill': return <Drill mental={false} />;
    case 'mental': return <Drill mental />;
    case 'mul': return <MulDivPractice kind="mul" />;
    case 'div': return <MulDivPractice kind="div" />;
    case 'tables': return <QuickFire kind="tables" />;
    case 'friends': return <QuickFire kind="friends" />;
    case 'free': return <FreeAbacus />;
    default: return <PracticeHome />;
  }
};

export default Practice;
