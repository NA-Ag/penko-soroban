import React, { useState, useEffect } from 'react';
import { AppMode } from '../types';
import { TRANSLATIONS } from '../translations';
import SorobanBoard from './SorobanBoard'; // Assuming SorobanBoard is in the same components folder
import Tutorial from './Tutorial'; // Assuming Tutorial is in the same components folder
import { btnBase, btnPrimary } from '../styles';

type PracticeMode = 'TUTORIAL' | 'FREE' | 'SET' | 'READ' | 'CALC';
type CalcOperation = 'ADD' | 'SUB' | 'MUL' | 'DIV' | 'SQRT' | 'CBRT';

interface PracticeProps {
  t: typeof TRANSLATIONS['en'];
  setMode: (mode: AppMode) => void;
}

const Practice: React.FC<PracticeProps> = ({ t, setMode }) => {
    const [practiceMode, setPracticeMode] = useState<PracticeMode>('FREE');
    const [target, setTarget] = useState(0);
    const [boardValue, setBoardValue] = useState(0);
    const [feedback, setFeedback] = useState<string | null>(null);
    const [freePlayDigits, setFreePlayDigits] = useState(7);
    const [calcOp, setCalcOp] = useState<CalcOperation>('MUL');
    const [calcProblem, setCalcProblem] = useState<{ display: string, answer: number } | null>(null);

    const generateChallenge = () => {
        const max = 999999;
        const newTarget = Math.floor(Math.random() * max);
        setTarget(newTarget);
        setFeedback(null);
        setBoardValue(0);
    };

    const generateCalc = (operation: CalcOperation) => {
        let a, b, ans, disp;
        switch (operation) {
            case 'ADD':
                a = Math.floor(Math.random() * 900) + 100;
                b = Math.floor(Math.random() * 900) + 100;
                ans = a + b; disp = `${a} + ${b}`;
                break;
            case 'SUB':
                a = Math.floor(Math.random() * 900) + 100;
                b = Math.floor(Math.random() * 900) + 100;
                if (b > a) [a, b] = [b, a];
                ans = a - b; disp = `${a} - ${b}`;
                break;
            case 'MUL':
                a = Math.floor(Math.random() * 90) + 10;
                b = Math.floor(Math.random() * 90) + 10;
                ans = a * b; disp = `${a} × ${b}`;
                break;
            case 'DIV':
                b = Math.floor(Math.random() * 89) + 2;
                ans = Math.floor(Math.random() * 90) + 10;
                a = b * ans;
                disp = `${a} ÷ ${b}`;
                break;
            case 'SQRT':
                ans = Math.floor(Math.random() * 90) + 10;
                a = ans * ans;
                disp = `√${a}`;
                break;
            case 'CBRT':
                ans = Math.floor(Math.random() * 20) + 2;
                a = ans * ans * ans;
                disp = `∛${a}`;
                break;
            default: return;
        }
        setCalcProblem({ display: disp, answer: ans });
        setFeedback(null);
    };

    // Effect to generate new calculation problem when calcOp changes
    useEffect(() => {
        if (practiceMode === 'CALC') {
            generateCalc(calcOp);
        }
    }, [calcOp, practiceMode]);

    const checkAnswer = () => {
        if (practiceMode === 'SET') {
            if (boardValue === target) setFeedback('CORRECT');
            else setFeedback('INCORRECT');
        }
    };

    return (
        <div className="pt-24 px-4 pb-12 max-w-6xl mx-auto flex flex-col items-center w-full">
            <button
                onClick={() => setMode(AppMode.HOME)}
                className="self-start mb-6 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-mono uppercase font-bold flex items-center gap-2 rounded-lg border-2 border-slate-600 shadow-md transition-all"
            >
                ← {t.back}
            </button>
            {/* Mode Tabs */}
            <div className="flex bg-slate-900 border-2 border-white shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] mb-12">
                {[
                    { id: 'TUTORIAL', label: t.navTutorial },
                    { id: 'FREE', label: t.free_play },
                    { id: 'CALC', label: t.calculation },
                    { id: 'SET', label: t.challenge_set },
                    { id: 'READ', label: t.challenge_read }
                ].map(m => (
                    <button
                        key={m.id}
                        onClick={() => {
                            setPracticeMode(m.id as PracticeMode);
                            setFeedback(null);
                            setBoardValue(0);
                            if (m.id === 'SET' || m.id === 'READ') generateChallenge();
                            // generateCalc is now handled by useEffect when calcOp changes,
                            // and calcOp is set when the button is clicked.
                            // If switching to CALC mode, ensure a problem is generated.
                            if (m.id === 'CALC' && !calcProblem) generateCalc(calcOp);
                        }}
                        className={`px-6 py-2 text-sm font-bold uppercase tracking-wide transition-all rounded-none
                      ${practiceMode === m.id
                                ? 'bg-purple-600 text-white'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800'
                            }
                  `}
                    >
                        {m.label}
                    </button>
                ))}
            </div>

            {practiceMode === 'TUTORIAL' ? (
                <Tutorial onComplete={() => setPracticeMode('FREE')} t={t} />
            ) : (
                <div className="w-full flex flex-col items-center gap-12">
                    {practiceMode === 'SET' && (
                        <div className="flex flex-col items-center gap-2 animate-slide-up">
                            <span className="text-slate-500 uppercase text-xs font-bold tracking-widest">{t.input}</span>
                            <span className="text-6xl md:text-8xl font-mono text-purple-400 font-bold">{target.toLocaleString()}</span>
                        </div>
                    )}

                    {practiceMode === 'CALC' && (
                        <div className="flex flex-col items-center gap-6 w-full max-w-2xl">
                            <div className="flex flex-wrap justify-center gap-2">
                                {['ADD', 'SUB', 'MUL', 'DIV', 'SQRT', 'CBRT'].map(op => (
                                    <button
                                        key={op}
                                        onClick={() => setCalcOp(op as CalcOperation)}
                                        className={`px-4 py-2 font-bold font-mono border-2 ${calcOp === op ? 'bg-purple-600 border-white text-white' : 'bg-slate-900 border-slate-600 text-slate-400'}`}
                                    >
                                        {op}
                                    </button>
                                ))}
                            </div>
                            <div className="text-center p-8 border-2 border-white bg-slate-800 w-full shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
                                <div className="text-5xl md:text-7xl font-mono text-white mb-4">{calcProblem?.display}</div>
                                <div className="text-slate-400 text-sm uppercase tracking-widest">{t.calc_input_help}</div>
                            </div>
                        </div>
                    )}

                    {(practiceMode === 'FREE' || practiceMode === 'SET') && (
                        <div className="flex flex-col items-center gap-2 w-full max-w-md">
                            <div className="flex justify-between w-full text-sm font-bold uppercase text-slate-500">
                                <span>{t.digits}: {freePlayDigits}</span>
                            </div>
                            <input
                                type="range" min="3" max="13" step="1"
                                value={freePlayDigits}
                                onChange={(e) => setFreePlayDigits(parseInt(e.target.value))}
                                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                            />
                        </div>
                    )}

                    {practiceMode !== 'CALC' && (
                        <div className="relative">
                            <SorobanBoard
                                key={practiceMode === 'SET' ? target : `free-${freePlayDigits}`}
                                digits={practiceMode === 'FREE' ? freePlayDigits : 7}
                                initialValue={practiceMode === 'READ' ? target : 0}
                                readOnly={practiceMode === 'READ'}
                                showValue={practiceMode === 'FREE'}
                                onChange={(val) => {
                                    setBoardValue(val);
                                    setFeedback(null);
                                }}
                                resetLabel={t.reset}
                            />
                            {practiceMode === 'READ' && <div className="absolute inset-0 z-10" />}
                        </div>
                    )}

                    {/* Controls Area */}
                    <div className="h-16 flex items-center justify-center gap-4">
                        {feedback ? (
                            <div className={`text-2xl font-bold font-mono animate-bounce ${feedback === 'CORRECT' ? 'text-green-500' : 'text-red-500'}`}>
                                {feedback === 'CORRECT' ? t.correct : t.incorrect}
                            </div>
                        ) : (
                            <>
                                {practiceMode === 'FREE' && (
                                    <button onClick={() => { setPracticeMode('FREE'); setBoardValue(0); }} className={btnBase}>{t.reset}</button>
                                )}

                                {practiceMode === 'SET' && (
                                    <div className="flex gap-4">
                                        <button onClick={generateChallenge} className={btnBase}>{t.new}</button>
                                        <button onClick={checkAnswer} className={btnPrimary}>{t.check}</button>
                                    </div>
                                )}

                                {(practiceMode === 'READ' || practiceMode === 'CALC') && (
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="number"
                                            placeholder="?"
                                            className="bg-slate-800 border-2 border-white focus:border-purple-500 outline-none text-center text-2xl w-32 py-2 text-white font-mono shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    const val = parseInt(e.currentTarget.value);
                                                    const correct = practiceMode === 'READ' ? target : calcProblem?.answer;
                                                    setFeedback(val === correct ? 'CORRECT' : 'INCORRECT');
                                                }
                                            }}
                                        />
                                        <button onClick={practiceMode === 'READ' ? generateChallenge : () => generateCalc(calcOp)} className={btnBase}>{t.new}</button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Practice;