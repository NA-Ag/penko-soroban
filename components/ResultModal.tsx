import React, { useState } from 'react';
import { AppMode, LeaderboardEntry } from '../types';
import { TRANSLATIONS } from '../translations';
import { cardStyle, btnBase, btnPrimary } from '../styles';

interface FlashResult {
  numbers: number[];
  sum: number;
  userGuess: string;
  isExam: boolean;
  levelId?: string;
}

interface ResultModalProps {
  flashResult: FlashResult | null;
  setFlashResult: (result: FlashResult | null) => void;
  passedLevels: string[];
  setPassedLevels: (levels: string[]) => void;
  setMode: (mode: AppMode) => void;
  t: typeof TRANSLATIONS['en'];
  onSaveScore: (name: string, result: FlashResult) => void;
}

const ResultModal: React.FC<ResultModalProps> = ({ flashResult, setFlashResult, passedLevels, setPassedLevels, setMode, t, onSaveScore }) => {
  const [playerName, setPlayerName] = useState('');
  const [scoreSaved, setScoreSaved] = useState(false);

  if (!flashResult) return null;
  const isCorrect = parseInt(flashResult.userGuess) === flashResult.sum;

  if (isCorrect && flashResult.isExam && flashResult.levelId && !passedLevels.includes(flashResult.levelId)) {
      const newPassed = [...passedLevels, flashResult.levelId];
      setPassedLevels(newPassed);
      localStorage.setItem('soroban_passed_levels', JSON.stringify(newPassed));
  }

  const handleSave = () => {
      if(!playerName) return;
      onSaveScore(playerName, flashResult);
      setScoreSaved(true);
  };

  return (
      <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
          <div className={`max-w-md w-full text-center ${cardStyle}`}>
               {flashResult.userGuess === '' ? (
                   <div className="space-y-6">
                       <div className="text-sm font-bold text-purple-500 uppercase tracking-widest font-mono">{t.result}</div>
                       <input 
                           type="number" 
                           className="w-full bg-slate-800 border-2 border-white focus:border-purple-500 text-white text-5xl font-mono text-center py-4 outline-none shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
                           autoFocus
                           placeholder="0"
                           onKeyDown={(e) => {
                               if (e.key === 'Enter') {
                                   setFlashResult({...flashResult, userGuess: e.currentTarget.value});
                               }
                           }}
                       />
                       <button 
                           className={`w-full ${btnPrimary}`}
                           onClick={() => {
                               const input = document.querySelector('input[type="number"]') as HTMLInputElement;
                               if(input) setFlashResult({...flashResult, userGuess: input.value});
                           }}
                       >
                           {t.check}
                       </button>
                   </div>
               ) : (
                   <div className="space-y-8">
                       <div>
                           <div className={`text-4xl font-bold mb-2 ${isCorrect ? 'text-green-500' : 'text-red-500'}`}>
                               {isCorrect ? t.correct : t.incorrect}
                           </div>
                           <div className="font-mono text-6xl text-white mt-4">{flashResult.sum.toLocaleString()}</div>
                           {!isCorrect && (
                               <div className="text-slate-500 mt-2 line-through text-xl">{flashResult.userGuess}</div>
                           )}
                       </div>

                       {isCorrect && !scoreSaved && (
                           <div className="flex gap-2 justify-center items-center">
                               <input 
                                  maxLength={3}
                                  placeholder="AAA"
                                  value={playerName}
                                  onChange={e => setPlayerName(e.target.value.toUpperCase())}
                                  className="bg-slate-900 border-2 border-slate-600 text-white font-mono text-center w-24 py-2 uppercase tracking-widest focus:border-purple-500 outline-none"
                               />
                               <button onClick={handleSave} disabled={!playerName} className={`${btnBase} py-2 px-4 text-xs`}>
                                   {t.save_score}
                               </button>
                           </div>
                       )}

                       <div className="flex gap-3 justify-center">
                           <button onClick={() => setFlashResult(null)} className={btnBase}>{t.retry}</button>
                           <button onClick={() => { setFlashResult(null); setMode(flashResult.isExam ? AppMode.EXAM_SELECT : AppMode.CUSTOM_SETUP); }} className={btnPrimary}>{t.menu}</button>
                       </div>
                   </div>
               )}
          </div>
      </div>
  );
};

export default ResultModal;