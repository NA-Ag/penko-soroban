import React from 'react';
import { AppMode, ExamLevel } from '../types';
import { EXAM_LEVELS } from '../constants';
import { TRANSLATIONS } from '../translations';
import { btnBase } from '../styles';

interface ExamSelectProps {
  setMode: (mode: AppMode) => void;
  t: typeof TRANSLATIONS['en'];
  passedLevels: string[];
  startExam: (level: ExamLevel) => void;
}

const ExamSelect: React.FC<ExamSelectProps> = ({ setMode, t, passedLevels, startExam }) => (
    <div className="pt-24 px-4 pb-12 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-white font-mono uppercase tracking-widest">{t.select_rank}</h2>
            <button 
              onClick={() => setMode(AppMode.CUSTOM_SETUP)}
              className={`${btnBase} text-xs py-2`}
            >
              {t.navCustom}
            </button>
        </div>
        <div className="grid gap-4">
            {EXAM_LEVELS.map((level, idx) => {
                 const passed = passedLevels.includes(level.id);
                 const isNext = !passed && (idx === 0 || passedLevels.includes(EXAM_LEVELS[idx-1].id));
                 const locked = !passed && !isNext;

                 return (
                     <button 
                      key={level.id}
                      onClick={() => !locked && startExam(level)}
                      disabled={locked}
                      className={`w-full group flex items-center justify-between p-6 border-2 transition-all duration-200 text-left relative overflow-hidden
                          ${locked 
                              ? 'bg-slate-900 border-slate-800 opacity-50 cursor-not-allowed' 
                              : 'bg-slate-900 border-white hover:border-purple-400 hover:bg-slate-800 shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] active:translate-y-[0px] active:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]'
                          }
                      `}
                     >
                         <div className="flex items-center gap-6">
                             <div className={`font-mono text-xl font-bold w-12 text-center
                                  ${passed ? 'text-purple-400' : locked ? 'text-slate-600' : 'text-white'}
                             `}>
                                 {passed ? '✓' : idx + 1}
                             </div>
                             <div>
                                 <div className={`text-lg font-bold font-mono uppercase ${locked ? 'text-slate-600' : 'text-white group-hover:text-purple-400'}`}>
                                     {level.name}
                                 </div>
                                 <div className="text-sm text-slate-400 font-mono">{level.description}</div>
                             </div>
                         </div>
                         
                         {!locked && (
                             <div className="flex gap-6 text-sm font-mono text-slate-500">
                                 <span>{level.digits}<span className="text-slate-600 ml-1">{t.digits}</span></span>
                                 <span>{level.count}<span className="text-slate-600 ml-1">{t.numbers}</span></span>
                                 <span>{(level.speedMs/1000).toFixed(1)}<span className="text-slate-600 ml-1">{t.sec}</span></span>
                             </div>
                         )}
                     </button>
                 );
            })}
        </div>
    </div>
);

export default ExamSelect;