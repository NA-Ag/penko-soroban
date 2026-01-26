import React, { useState, useEffect } from 'react';
import { AppMode } from '../types';
import { TRANSLATIONS } from '../translations';
import SorobanBoard from './SorobanBoard'; // Assuming SorobanBoard is in the same components folder
import { cardStyle, btnBase, btnPrimary } from '../styles';

interface TutorialProps {
  onComplete: () => void;
  t: typeof TRANSLATIONS['en'];
}

const SpeechBubble: React.FC<{ text: string; onContinue: () => void; style?: React.CSSProperties; arrowPosition?: 'top' | 'bottom' | 'left' | 'right'; arrowAlign?: 'center' | 'start' }> = ({ text, onContinue, style, arrowPosition = 'bottom', arrowAlign = 'center' }) => (
    <div className="absolute z-20 bg-white text-slate-900 p-4 rounded-lg shadow-[0_0_15px_rgba(0,0,0,0.5)] w-64 animate-fade-in" style={style}>
        <p className="mb-4 font-bold text-sm">{text}</p>
        <button onClick={onContinue} className="bg-purple-600 text-white px-4 py-1 text-xs font-bold uppercase rounded hover:bg-purple-500 transition-colors w-full">
            Continue
        </button>
        {/* Arrow */}
        <div className={`absolute w-4 h-4 bg-white transform rotate-45 ${
            arrowPosition === 'bottom' ? '-bottom-2 left-1/2 -translate-x-1/2' :
            arrowPosition === 'top' ? '-top-2 left-1/2 -translate-x-1/2' :
            arrowPosition === 'left' ? `-left-2 ${arrowAlign === 'start' ? 'top-6' : 'top-1/2 -translate-y-1/2'}` :
            `-right-2 ${arrowAlign === 'start' ? 'top-6' : 'top-1/2 -translate-y-1/2'}`
        }`}></div>
    </div>
);

const Tutorial: React.FC<TutorialProps> = ({ onComplete, t }) => {
    const [module, setModule] = useState<'MENU' | 'BASICS' | 'ADDITION' | 'COMPLEMENTS'>('MENU');
    const [step, setStep] = useState(0);
    const [stepComplete, setStepComplete] = useState(false);
    const [boardKey, setBoardKey] = useState(0);
    
    // Practice Mode State
    const [practicePhase, setPracticePhase] = useState<'NONE' | 'READ' | 'SET' | 'CALC'>('NONE');
    const [practiceCount, setPracticeCount] = useState(0);
    const [practiceTarget, setPracticeTarget] = useState(0);
    const [practiceStartValue, setPracticeStartValue] = useState(0);
    const [practiceOperation, setPracticeOperation] = useState('');
    const [userGuess, setUserGuess] = useState('');
    const [practiceCompleted, setPracticeCompleted] = useState(false);
    const [feedback, setFeedback] = useState<'CORRECT' | null>(null);
    const [showReminder, setShowReminder] = useState(false);

    const checkStepBasics = (val: number) => {
        // Steps 0-3 are intro/experiment, no auto-check
        // Tasks removed for simpler flow
    };

    const checkStepAddition = (val: number) => {
        // Steps 0-1 are intro
        if (step === 2 && val === 23) setStepComplete(true);
        if (step === 3 && val === 34) setStepComplete(true);
        if (step === 4 && val === 12) setStepComplete(true);
        if (step === 5 && val === 43) setStepComplete(true);
        // Step 6 is intro
        if (step === 7 && val === 21) setStepComplete(true);
        if (step === 8 && val === 33) setStepComplete(true);
        if (step === 9 && val === 84) setStepComplete(true);
        if (step === 10 && val === 60) setStepComplete(true);
        if (step === 11 && val === 85) setStepComplete(true);
        if (step === 12 && val === 97) setStepComplete(true);
        if (step === 13 && val === 46) setStepComplete(true);
        if (step === 14 && val === 98) setStepComplete(true);
        if (step === 15 && val === 198) setStepComplete(true);
        if (step === 16 && val === 151) setStepComplete(true);
        if (step === 17 && val === 156) setStepComplete(true);
        if (step === 18 && val === 356) setStepComplete(true);
        if (step === 19 && val === 21) setStepComplete(true);
    };

    const checkStepComplements = (val: number) => {
        if (step === 3 && val === 13) setStepComplete(true);
        if (step === 4 && val === 10) setStepComplete(true);
        if (step === 5 && val === 18) setStepComplete(true);
        if (step === 6 && val === 52) setStepComplete(true);
    };

    const nextStep = () => {
        setStep(prev => prev + 1);
        setStepComplete(false);
        setShowReminder(false);
    };

    const startModule = (mod: 'BASICS' | 'ADDITION' | 'COMPLEMENTS') => {
        setModule(mod);
        setStep(0);
        setStepComplete(false);
        setBoardKey(prev => prev + 1);
    };
    
    const QUESTIONS_PER_PHASE = 20;

    const startPractice = (targetModule?: 'BASICS' | 'ADDITION' | 'COMPLEMENTS' | React.MouseEvent) => {
        const mod = (typeof targetModule === 'string') ? targetModule : module;
        setPracticeCount(0);
        if (mod === 'BASICS') {
            setPracticePhase('READ');
            generatePracticeQuestion('READ', undefined, mod);
        } else {
            setPracticePhase('CALC');
            generatePracticeQuestion('CALC', 0, mod);
        }
    };

    const generatePracticeQuestion = (phase: 'READ' | 'SET' | 'CALC', countOverride?: number, moduleOverride?: 'BASICS' | 'ADDITION' | 'COMPLEMENTS') => {
        const max = 9999; // 4 digits
        const currentCount = countOverride !== undefined ? countOverride : practiceCount;
        const currentModule = moduleOverride || module;

        if (phase === 'CALC') {
             if (currentModule === 'COMPLEMENTS') {
                 // Rule of 10s Practice: Force carry operations
                 let digits = 1;
                 if (currentCount >= 5) digits = 2;
                 
                 let v1 = 0;
                 let v2 = 0;
                 
                 do {
                     // Start value
                     if (digits === 1) {
                         v1 = Math.floor(Math.random() * 9) + 1; // 1-9
                     } else {
                         v1 = Math.floor(Math.random() * 89) + 10; // 10-99
                     }
                     
                     // Addend (single digit to practice specific column complement)
                     v2 = Math.floor(Math.random() * 9) + 1; // 1-9
                     
                     // Condition: Must trigger a carry in the units column (Rule of 10s)
                 } while ((v1 % 10) + v2 < 10);
                 
                 setPracticeStartValue(v1);
                 setPracticeTarget(v1 + v2);
                 setPracticeOperation(`${t.tut_practice_plus} ${v2}`);
             } else {
                 // ADDITION Module (Simple Soroban - No Carry)
             // Progressive difficulty: 1 digit -> 2 digits -> 3 digits -> 4 digits
             let digits = 1;
             if (currentCount >= 5) digits = 2;
             if (currentCount >= 10) digits = 3;
             if (currentCount >= 15) digits = 4;

             const isAdd = currentCount % 2 === 0;
             let val1 = 0;
             let val2 = 0;
             
             // Generate numbers column by column to ensure NO CARRY/BORROW (Simple Soroban)
             // This ensures each column is its own "mini calculation"
             do {
                 val1 = 0;
                 val2 = 0;
                 for (let i = 0; i < digits; i++) {
                     // Ensure the most significant digit (highest column) is not 0 for multi-digit numbers
                     // This guarantees that a "4 digit" question actually looks like one (e.g. 1000+, not 0023)
                     const minD = (i === digits - 1 && digits > 1) ? 1 : 0;
                     const d = Math.floor(Math.random() * (10 - minD)) + minD;

                     val1 += d * Math.pow(10, i);
                     
                     let validOpDs: number[] = [];
                     if (isAdd) {
                         for (let k = 0; k <= 9; k++) {
                             // Simple Addition Rules:
                             // 1. No carry to next column
                             if (d + k > 9) continue;
                             // 2. No 5-complement (earth bead overflow)
                             // The sum of earth beads must be < 5
                             if ((d % 5) + (k % 5) >= 5) continue;
                             
                             validOpDs.push(k);
                         }
                     } else {
                         for (let k = 0; k <= 9; k++) {
                             // Simple Subtraction Rules:
                             // 1. No borrow from next column
                             if (k > d) continue;
                             // 2. No 5-complement (earth bead underflow)
                             // The earth beads in k must be available in d
                             if ((k % 5) > (d % 5)) continue;
                             
                             validOpDs.push(k);
                         }
                     }
                     const opD = validOpDs.length > 0 ? validOpDs[Math.floor(Math.random() * validOpDs.length)] : 0;
                     val2 += opD * Math.pow(10, i);
                 }
             } while (val2 === 0); // Ensure we are actually doing something

             let nextTarget;
             let opText;

             if (isAdd) {
                 nextTarget = val1 + val2;
                 opText = `${t.tut_practice_plus} ${val2}`;
             } else {
                 if (val2 > val1) val2 = Math.floor(Math.random() * val1);
                 nextTarget = val1 - val2;
                 opText = `${t.tut_practice_minus} ${val2}`;
             }
             
             setPracticeStartValue(val1);
             setPracticeTarget(nextTarget);
             setPracticeOperation(opText);
             }
        } else {
            const nextVal = Math.floor(Math.random() * max);
            setPracticeTarget(nextVal);
            setPracticeStartValue(0);
        }
        setUserGuess('');
        setBoardKey(prev => prev + 1); // Reset board visual
    };

    const handlePracticeSubmit = (val?: number) => {
        if (feedback === 'CORRECT') return;

        if (practicePhase === 'READ') {
            if (parseInt(userGuess) === practiceTarget) {
                setFeedback('CORRECT');
                setTimeout(() => {
                    setFeedback(null);
                    nextPracticeQuestion();
                }, 1000);
            } else {
                // Shake effect or feedback could go here
                const input = document.querySelector('input');
                if(input) {
                    input.classList.add('animate-pulse', 'bg-red-900');
                    setTimeout(() => input.classList.remove('animate-pulse', 'bg-red-900'), 500);
                }
            }
        } else if (practicePhase === 'SET' || practicePhase === 'CALC') {
            if (val === practiceTarget) {
                setFeedback('CORRECT');
                setTimeout(() => {
                    setFeedback(null);
                    nextPracticeQuestion();
                }, 1000);
            }
        }
    };

    const nextPracticeQuestion = () => {
        if (practiceCount + 1 >= QUESTIONS_PER_PHASE) {
            if (practicePhase === 'READ') {
                setPracticePhase('SET');
                setPracticeCount(0);
                generatePracticeQuestion('SET');
            } else {
                setPracticePhase('NONE');
                setPracticeCompleted(true);
                setModule('MENU');
            }
        } else {
            setPracticeCount(prev => prev + 1);
            generatePracticeQuestion(practicePhase, practiceCount + 1);
        }
    };

    const getStartValue = () => {
        if (module === 'COMPLEMENTS') {
            switch(step) {
                case 2: return 4;
                case 3: return 4;
                case 4: return 8;
                case 5: return 9;
                case 6: return 44;
                default: return null;
            }
        }
        if (module !== 'ADDITION') return null;
        switch(step) {
            case 3: return 23;
            case 4: return 34;
            case 5: return 12;
            case 8: return 21;
            case 9: return 33;
            case 10: return 84;
            case 11: return 60;
            case 12: return 85;
            case 13: return 97;
            case 14: return 46;
            case 15: return 98;
            case 16: return 198;
            case 17: return 151;
            case 18: return 156;
            case 19: return 356;
            default: return null;
        }
    };

    if (module === 'MENU') {
        return (
            <div className="flex flex-col items-center w-full max-w-4xl gap-6">
                <h2 className="text-3xl font-bold text-white font-mono uppercase tracking-widest mb-4">{t.navTutorial}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                    <div className="flex flex-col gap-2">
                        <button onClick={() => startModule('BASICS')} className={`${cardStyle} hover:bg-slate-800 transition-all text-left group h-full`}>
                            <h3 className="text-xl font-bold text-purple-400 mb-2 group-hover:translate-x-2 transition-transform">01. {t.tut_basics_title}</h3>
                            <p className="text-slate-400 text-sm">{t.tut_basics_desc}</p>
                        </button>
                        <button onClick={() => { setModule('BASICS'); startPractice('BASICS'); }} className={`${btnPrimary} w-full py-3 text-sm`}>
                            {t.practice_skill}
                        </button>
                    </div>
                    <div className="flex flex-col gap-2">
                        <button onClick={() => startModule('ADDITION')} className={`${cardStyle} hover:bg-slate-800 transition-all text-left group h-full`}>
                            <h3 className="text-xl font-bold text-purple-400 mb-2 group-hover:translate-x-2 transition-transform">02. {t.tut_add_title}</h3>
                            <p className="text-slate-400 text-sm">{t.tut_add_desc}</p>
                        </button>
                        <button onClick={() => { setModule('ADDITION'); startPractice('ADDITION'); }} className={`${btnPrimary} w-full py-3 text-sm`}>
                            {t.practice_skill}
                        </button>
                    </div>
                    <div className="flex flex-col gap-2">
                        <button onClick={() => startModule('COMPLEMENTS')} className={`${cardStyle} hover:bg-slate-800 transition-all text-left group h-full`}>
                            <h3 className="text-xl font-bold text-purple-400 mb-2 group-hover:translate-x-2 transition-transform">03. {t.tut_compliments_title}</h3>
                            <p className="text-slate-400 text-sm">{t.tut_compliments_desc}</p>
                        </button>
                        <button onClick={() => { setModule('COMPLEMENTS'); startPractice('COMPLEMENTS'); }} className={`${btnPrimary} w-full py-3 text-sm`}>
                            {t.practice_skill}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (practicePhase !== 'NONE') {
        return (
            <div className="flex flex-col items-center w-full max-w-4xl gap-6">
                <div className="w-full flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-white font-mono uppercase tracking-widest">
                        {practicePhase === 'READ' ? t.challenge_read : (practicePhase === 'CALC' ? t.calculation : t.challenge_set)}
                    </h2>
                    <div className="text-slate-400 font-mono">
                        {t.progress}: {practiceCount + 1} / {QUESTIONS_PER_PHASE}
                    </div>
                </div>

                <div className={`w-full ${cardStyle} flex flex-col items-center gap-8 relative`}>
                    {feedback === 'CORRECT' && (
                        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-sm rounded-sm animate-fade-in">
                            <div className="text-5xl font-bold text-green-500 font-mono uppercase tracking-widest animate-bounce">
                                {t.correct}
                            </div>
                        </div>
                    )}

                    <p className="text-lg text-slate-300 font-mono text-center">
                        {practicePhase === 'READ' ? t.tut_practice_read : (practicePhase === 'CALC' ? t.tut_basics_intro : `${t.tut_practice_set} ${practiceTarget}`)}
                    </p>

                    {practicePhase === 'READ' && (
                        <div className="flex gap-4">
                            <input 
                                type="number" 
                                value={userGuess}
                                onChange={(e) => setUserGuess(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handlePracticeSubmit()}
                                className="bg-slate-800 border-2 border-white text-white font-mono text-3xl p-2 w-48 text-center outline-none focus:border-purple-500 transition-colors"
                                autoFocus
                            />
                            <button onClick={() => handlePracticeSubmit()} className={btnPrimary}>{t.check}</button>
                        </div>
                    )}

                    {(practicePhase === 'SET' || practicePhase === 'CALC') && (
                        <div className="text-6xl font-mono text-purple-400 font-bold mb-4">
                            {practicePhase === 'CALC' ? practiceOperation : practiceTarget}
                        </div>
                    )}

                    <SorobanBoard 
                        key={`prac-${boardKey}`}
                        digits={4}
                        initialValue={practicePhase === 'READ' ? practiceTarget : (practicePhase === 'CALC' ? practiceStartValue : 0)}
                        readOnly={practicePhase === 'READ'}
                        showValue={false} // Hide value in READ mode so they have to read it
                        onChange={(val) => {
                            if (practicePhase === 'SET' || practicePhase === 'CALC') handlePracticeSubmit(val);
                        }}
                        resetLabel={t.reset}
                    />

                    <button 
                        onClick={() => nextPracticeQuestion()} 
                        className="text-slate-500 hover:text-white underline font-mono text-sm mt-4"
                    >
                        {t.skip}
                    </button>
                </div>
            </div>
        );
    }

    const isLastStep = module === 'BASICS' ? step === 4 : (module === 'ADDITION' ? step === 19 : step === 6);
    const startVal = getStartValue();

    return (
        <div className="flex flex-col items-center w-full">
             <button onClick={() => setModule('MENU')} className="self-start mb-6 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-mono uppercase font-bold flex items-center gap-2 rounded-lg border-2 border-slate-600 shadow-md transition-all">
                 ← {t.menu}
             </button>
             <div className={`max-w-2xl w-full mb-8 text-center relative overflow-hidden ${cardStyle}`}>
                 <div className="absolute top-0 left-0 right-0 h-1 bg-purple-500"></div>
                 
                 {module === 'BASICS' && (
                     <>
                        <h2 className="text-2xl font-bold text-white mb-4 font-mono">
                            {step < 4 ? t.tut_basics_heading : t.complete}
                        </h2>
                        <p className="text-lg text-slate-300 font-mono">
                                {step < 4 && t.tut_basics_intro}
                                {step === 4 && t.tut_experiment}
                        </p>
                     </>
                 )}

                 {module === 'ADDITION' && (
                     <div className="flex flex-col items-center">
                        <h2 className="text-2xl font-bold text-white mb-4 font-mono">
                            {step < 2 || step === 6 ? t.tut_basics_heading : (isLastStep && stepComplete ? t.complete : `Task ${step < 6 ? step - 1 : step - 2}`)}
                        </h2>
                        <div className="text-lg text-slate-300 font-mono">
                            {step < 2 && t.tut_basics_intro}
                            {step === 2 && t.tut_add_task_1}
                            {step === 3 && t.tut_add_task_2}
                            {step === 4 && t.tut_add_task_3}
                            {step === 5 && t.tut_add_task_4}
                            {step === 6 && t.tut_basics_intro}
                            {step === 7 && t.tut_add_task_5}
                            {step === 8 && t.tut_add_task_6}
                            {step === 9 && t.tut_add_task_7}
                            {step === 10 && t.tut_add_task_8}
                            {step === 11 && t.tut_add_task_9}
                            {step === 12 && t.tut_add_task_10}
                            {step === 13 && t.tut_add_task_11}
                            {step === 14 && t.tut_add_task_12}
                            {step === 15 && t.tut_add_task_13}
                            {step === 16 && t.tut_add_task_14}
                            {step === 17 && t.tut_add_task_15}
                            {step === 18 && t.tut_add_task_16}
                            {step === 19 && t.tut_add_task_17}
                            {step === 19 && stepComplete && t.complete}

                            {startVal !== null && (
                                <div className="mt-4 border-t border-slate-700 pt-2">
                                    <button 
                                        onClick={() => setShowReminder(!showReminder)}
                                        className="text-xs text-slate-500 hover:text-purple-400 underline flex items-center gap-1"
                                    >
                                        <span className="bg-slate-800 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold">?</span> {t.show_start}
                                    </button>
                                    {showReminder && <div className="text-sm text-purple-400 font-mono mt-1 animate-fade-in">{t.start_val}: {startVal}</div>}
                                </div>
                            )}
                        </div>
                     </div>
                 )}

                 {module === 'COMPLEMENTS' && (
                     <div className="flex flex-col items-center">
                        <h2 className="text-2xl font-bold text-white mb-4 font-mono">
                            {step < 2 ? t.tut_basics_heading : (isLastStep && stepComplete ? t.complete : `Task ${step - 1}`)}
                        </h2>
                        <div className="text-lg text-slate-300 font-mono">
                            {step === 0 && t.tut_compliments_intro}
                            {step === 1 && t.tut_compliments_pairs}
                            {(step === 2 || step === 3) && t.tut_compliments_task_1}
                            {step === 4 && t.tut_compliments_task_2}
                            {step === 5 && t.tut_compliments_task_3}
                            {step === 6 && t.tut_compliments_task_4}
                            {step === 6 && stepComplete && t.complete}
                            {startVal !== null && (
                                <div className="mt-4 border-t border-slate-700 pt-2">
                                    <button 
                                        onClick={() => setShowReminder(!showReminder)}
                                        className="text-xs text-slate-500 hover:text-purple-400 underline flex items-center gap-1"
                                    >
                                        <span className="bg-slate-800 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold">?</span> {t.show_start}
                                    </button>
                                    {showReminder && <div className="text-sm text-purple-400 font-mono mt-1 animate-fade-in">{t.start_val}: {startVal}</div>}
                                </div>
                            )}
                        </div>
                     </div>
                 )}
                 
                 {(stepComplete || (module === 'BASICS' && step === 4) || (module === 'COMPLEMENTS' && step < 3)) && !isLastStep && (
                     <button onClick={nextStep} className={`mt-6 ${btnPrimary} animate-bounce`}>
                         {t.tutorial_continue} →
                     </button>
                 )}

                 {isLastStep && (stepComplete || (module === 'BASICS' && step === 4) || (module === 'COMPLEMENTS' && step === 6)) && (
                     <div className="flex gap-4 justify-center mt-6">
                         <button onClick={() => setModule('MENU')} className={btnBase}>
                             {t.menu}
                         </button>
                         {!practiceCompleted && (
                             <button onClick={startPractice} className={btnPrimary}>
                                 {t.practice_skill}
                             </button>
                         )}
                         {module === 'BASICS' && (
                             <button onClick={() => startModule('ADDITION')} className={btnPrimary}>
                                 {t.next_lesson}
                             </button>
                         )}
                         {module === 'ADDITION' && (
                             <button onClick={() => startModule('COMPLEMENTS')} className={btnPrimary}>
                                 {t.next_lesson}
                             </button>
                         )}
                         {module === 'COMPLEMENTS' && (
                             <button onClick={() => setModule('MENU')} className={btnPrimary}>
                                 {t.next_lesson}
                             </button>
                         )}
                     </div>
                 )}
             </div>

             <div className="relative">
                {module === 'BASICS' && step === 0 && (
                    <SpeechBubble text={t.tut_intro_line} onContinue={nextStep} style={{ top: '130px', left: '50%', marginLeft: '200px' }} arrowPosition="left" />
                )}
                {module === 'BASICS' && step === 1 && (
                    <SpeechBubble text={t.tut_intro_dots} onContinue={nextStep} style={{ top: '155px', left: '50%', marginLeft: '200px' }} arrowPosition="left" arrowAlign="start" />
                )}
                {module === 'BASICS' && step === 2 && (
                    <SpeechBubble text={t.tut_intro_heaven} onContinue={nextStep} style={{ top: '60px', left: '50%', marginLeft: '-460px' }} arrowPosition="right" />
                )}
                {module === 'BASICS' && step === 3 && (
                    <SpeechBubble text={t.tut_intro_earth} onContinue={nextStep} style={{ top: '210px', left: '50%', marginLeft: '200px' }} arrowPosition="left" />
                )}

                {module === 'ADDITION' && step === 0 && (
                    <SpeechBubble text={t.tut_add_intro_1} onContinue={nextStep} style={{ top: '180px', left: '50%', marginLeft: '200px' }} arrowPosition="left" />
                )}
                {module === 'ADDITION' && step === 1 && (
                    <SpeechBubble text={t.tut_add_intro_2} onContinue={nextStep} style={{ top: '130px', left: '50%', marginLeft: '-620px' }} arrowPosition="right" />
                )}
                {module === 'ADDITION' && step === 6 && (
                    <SpeechBubble text={t.tut_add_heaven_intro} onContinue={nextStep} style={{ top: '60px', left: '50%', marginLeft: '-460px' }} arrowPosition="right" />
                )}
                {module === 'COMPLEMENTS' && step === 2 && (
                    <SpeechBubble text={t.tut_compliments_bubble_task1} onContinue={nextStep} style={{ top: '210px', left: '50%', marginLeft: '200px' }} arrowPosition="left" />
                )}

                 <SorobanBoard 
                    key={`tut-${boardKey}`}
                    digits={4}
                    initialValue={startVal || 0}
                    showValue={true}
                    onChange={(val) => {
                        if (module === 'ADDITION') checkStepAddition(val);
                        if (module === 'COMPLEMENTS') checkStepComplements(val);
                    }}
                    resetLabel={t.reset}
                 />
             </div>
        </div>
    );
};

export default Tutorial;