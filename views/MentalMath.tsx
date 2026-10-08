import React, { useMemo, useState } from 'react';
import { ArrowLeft, Brain, Eye, Zap } from 'lucide-react';
import { routeHref, useApp } from '../AppContext';
import { fromNumber } from '../core/abacus';
import { flashNumbers, randomWithDigits } from '../core/problems';
import { fill } from '../i18n';
import { Abacus } from '../components/Abacus';
import { AnswerInput } from '../components/AnswerInput';
import { Bubble } from '../components/Bubble';
import { FlashRunner } from '../components/FlashRunner';
import { SessionResult, useSession } from '../components/Session';
import { Button, Card, Choice, Page, PageTitle, Toggle } from '../components/ui';

const BackLink: React.FC = () => {
  const { t } = useApp();
  return (
    <a href={routeHref('mental')} className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink mb-4">
      <ArrowLeft size={16} aria-hidden="true" /> {t.mental.title}
    </a>
  );
};

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="flex flex-col gap-2"><span className="text-sm font-semibold text-muted">{label}</span>{children}</div>
);

// ── Flash Anzan ─────────────────────────────────────────────────────────────

interface FlashSetup { digits: number; numbers: number; ms: number; rounds: number }
const PRESETS: FlashSetup[] = [
  { digits: 1, numbers: 3, ms: 1500, rounds: 3 },
  { digits: 1, numbers: 5, ms: 1000, rounds: 5 },
  { digits: 2, numbers: 5, ms: 1000, rounds: 5 },
  { digits: 2, numbers: 10, ms: 600, rounds: 5 },
];
const SPEEDS = [2000, 1500, 1000, 800, 600, 400, 300];

const FlashAnzan: React.FC = () => {
  const { t } = useApp();
  const [setup, setSetup] = useState<FlashSetup>(PRESETS[0]);
  const [beep, setBeep] = useState(true);
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState<'flash' | 'answer' | 'feedback'>('flash');
  const [last, setLast] = useState<{ right: boolean; total: number; numbers: number[] } | null>(null);
  const session = useSession();
  const rounds = useMemo(() => running ? Array.from({ length: setup.rounds }, () => flashNumbers(setup.digits, setup.numbers)) : [],
    [running, session.round]); // eslint-disable-line react-hooks/exhaustive-deps

  const start = () => { setRunning(true); setPhase('flash'); setLast(null); session.restart(); };

  if (!running) {
    return (
      <Page className="max-w-2xl">
        <BackLink />
        <PageTitle>{t.mental.flashTitle}</PageTitle>
        <p className="text-muted mb-6">{t.mental.flashBlurb}</p>
        <Card className="p-5 space-y-5">
          <Field label={t.mental.presets}>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p, i) => (
                <button key={i} onClick={() => setSetup(p)}
                  className={`px-3 py-1.5 rounded-lg border text-sm font-semibold ${JSON.stringify(p) === JSON.stringify(setup) ? 'border-shu text-shu bg-shu/10' : 'border-line hover:bg-sunken'}`}>
                  {t.mental.presetNames[i]}
                </button>
              ))}
            </div>
          </Field>
          <Field label={t.mental.digits}>
            <Choice label={t.mental.digits} value={setup.digits} onChange={digits => setSetup({ ...setup, digits })} options={[1, 2, 3, 4].map(n => ({ value: n, label: String(n) }))} />
          </Field>
          <Field label={t.mental.numbers}>
            <Choice label={t.mental.numbers} value={setup.numbers} onChange={numbers => setSetup({ ...setup, numbers })} options={[3, 5, 7, 10, 15].map(n => ({ value: n, label: String(n) }))} />
          </Field>
          <Field label={t.mental.speed}>
            <Choice label={t.mental.speed} value={setup.ms} onChange={ms => setSetup({ ...setup, ms })} options={SPEEDS.map(ms => ({ value: ms, label: String(ms / 1000) }))} />
          </Field>
          <Field label={t.mental.rounds}>
            <Choice label={t.mental.rounds} value={setup.rounds} onChange={rounds => setSetup({ ...setup, rounds })} options={[1, 3, 5, 10].map(n => ({ value: n, label: String(n) }))} />
          </Field>
          <Toggle label={t.mental.beep} checked={beep} onChange={setBeep} />
          <Button onClick={start}>{t.common.start}</Button>
        </Card>
      </Page>
    );
  }

  const numbers = rounds[session.index];
  const total = numbers?.reduce((a, b) => a + b, 0) ?? 0;

  const answer = (n: number) => {
    const right = n === total;
    setLast({ right, total, numbers });
    setPhase('feedback');
  };

  return (
    <Page className="max-w-2xl">
      <BackLink />
      <PageTitle kicker={!session.done && fill(t.activity.flashRound, { n: session.index + 1, total: setup.rounds })}>{t.mental.flashTitle}</PageTitle>
      {session.done ? (
        <div className="space-y-4">
          <SessionResult correct={session.correct} total={setup.rounds} ms={session.ms}
            onAgain={start} onBack={() => setRunning(false)} />
        </div>
      ) : (
        <div className="space-y-5">
          {phase === 'flash' && <FlashRunner key={`${session.round}-${session.index}`} numbers={numbers} ms={setup.ms} beep={beep} onComplete={() => setPhase('answer')} />}
          {phase === 'answer' && <AnswerInput onSubmit={answer} />}
          {phase === 'feedback' && last && (
            <>
              <Bubble tone={last.right ? 'good' : 'bad'} pose={last.right ? 'jump' : 'talk'}>
                {last.right ? t.common.correct : fill(t.common.wrong, { answer: last.total })}{' '}
                {fill(t.activity.flashNumbers, { numbers: last.numbers.join(', ') })}
              </Bubble>
              <Button autoFocus onClick={() => { setPhase('flash'); session.answer(last.right, setup.rounds); }}>{t.common.next}</Button>
            </>
          )}
        </div>
      )}
    </Page>
  );
};

// ── Picture the soroban ─────────────────────────────────────────────────────

const PictureGame: React.FC = () => {
  const { t } = useApp();
  const [digits, setDigits] = useState(2);
  const [ms, setMs] = useState(1000);
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState<'ready' | 'show' | 'answer' | 'feedback'>('ready');
  const [lastRight, setLastRight] = useState(false);
  const session = useSession();
  const count = 10;
  const values = useMemo(() => Array.from({ length: count }, () => randomWithDigits(Math.random, digits)), [session.round, digits]);
  const value = values[session.index];

  const show = () => { setPhase('show'); window.setTimeout(() => setPhase('answer'), ms); };

  if (!running) {
    return (
      <Page className="max-w-2xl">
        <BackLink />
        <PageTitle>{t.mental.pictureTitle}</PageTitle>
        <p className="text-muted mb-6">{t.mental.pictureBlurb}</p>
        <Card className="p-5 space-y-5">
          <Field label={t.mental.digits}>
            <Choice label={t.mental.digits} value={digits} onChange={setDigits} options={[1, 2, 3, 4, 5].map(n => ({ value: n, label: String(n) }))} />
          </Field>
          <Field label={t.mental.speed}>
            <Choice label={t.mental.speed} value={ms} onChange={setMs} options={[2000, 1000, 500, 300].map(v => ({ value: v, label: String(v / 1000) }))} />
          </Field>
          <Button onClick={() => { setRunning(true); setPhase('ready'); session.restart(); }}>{t.common.start}</Button>
        </Card>
      </Page>
    );
  }

  return (
    <Page className="max-w-2xl">
      <BackLink />
      <PageTitle kicker={!session.done && fill(t.activity.problem, { n: session.index + 1, total: count })}>{t.mental.pictureTitle}</PageTitle>
      {session.done ? (
        <SessionResult correct={session.correct} total={count} ms={session.ms}
          onAgain={() => { setPhase('ready'); session.restart(); }} onBack={() => setRunning(false)} />
      ) : (
        <div className="space-y-5">
          <div className={phase === 'show' || (phase === 'feedback' && !lastRight) ? '' : 'invisible'}>
            <Abacus board={fromNumber(value, digits + 1)} readOnly />
          </div>
          {phase === 'ready' && <Button autoFocus onClick={show}>{t.activity.beadFlashShow}</Button>}
          {phase === 'answer' && <AnswerInput onSubmit={n => {
            setLastRight(n === value);
            setPhase('feedback');
          }} />}
          {phase === 'feedback' && (
            <>
              <Bubble tone={lastRight ? 'good' : 'bad'}>{lastRight ? t.common.correct : fill(t.common.wrong, { answer: value })}</Bubble>
              <Button autoFocus onClick={() => { setPhase('ready'); session.answer(lastRight, count); }}>{t.common.next}</Button>
            </>
          )}
        </div>
      )}
    </Page>
  );
};

// ── The Mental math tab ─────────────────────────────────────────────────────

const MentalHome: React.FC = () => {
  const { t } = useApp();
  const items = [
    { href: routeHref('mental', 'flash'), icon: Zap, title: t.mental.flashTitle, blurb: t.mental.flashBlurb },
    { href: routeHref('mental', 'picture'), icon: Eye, title: t.mental.pictureTitle, blurb: t.mental.pictureBlurb },
    { href: routeHref('practice', 'mental'), icon: Brain, title: t.mental.drillsTitle, blurb: t.mental.drillsBlurb },
  ];
  return (
    <Page>
      <PageTitle>{t.mental.title}</PageTitle>
      <p className="text-muted mb-6 max-w-2xl">{t.mental.intro}</p>
      <div className="grid sm:grid-cols-2 gap-3">
        {items.map(({ href, icon: Icon, title, blurb }) => (
          <a key={href} href={href} className="flex items-start gap-4 p-4 rounded-2xl border border-line bg-surface shadow-card hover:border-shu/50 transition-colors">
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

const MentalMath: React.FC<{ sub?: string }> = ({ sub }) => {
  if (sub === 'flash') return <FlashAnzan />;
  if (sub === 'picture') return <PictureGame />;
  return <MentalHome />;
};

export default MentalMath;
