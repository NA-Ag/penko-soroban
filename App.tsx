import React, { useState, useEffect } from 'react';
import { AppMode, FlashSettings, ExamLevel, Language, LeaderboardEntry } from './types';
import { EXAM_LEVELS, LANGUAGES, LEADERBOARD_KEY } from './constants';
import { TRANSLATIONS } from './translations';
import FlashAnzan from './components/FlashAnzan';

import Navigation from './components/Navigation';
import Home from './components/Home';
import Practice from './components/Practice';
import ExamSelect from './components/ExamSelect';
import CustomSetup from './components/CustomSetup';
import ResultModal from './components/ResultModal';
import LeaderboardModal from './components/LeaderboardModal';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.HOME);
  const [lang, setLang] = useState<Language>('en');
  const [flashSettings, setFlashSettings] = useState<FlashSettings>({ digits: 1, count: 5, interval: 1000, mode: 'visual' });
  const [flashResult, setFlashResult] = useState<{ numbers: number[], sum: number, userGuess: string, isExam: boolean, levelId?: string } | null>(null);
  
  const [passedLevels, setPassedLevels] = useState<string[]>([]);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  
  const t = TRANSLATIONS[lang];

  useEffect(() => {
    const saved = localStorage.getItem('soroban_passed_levels');
    if (saved) setPassedLevels(JSON.parse(saved));
    const savedLang = localStorage.getItem('soroban_lang');
    if (savedLang && LANGUAGES.some(l => l.code === savedLang)) {
        setLang(savedLang as Language);
    }
    const savedLb = localStorage.getItem(LEADERBOARD_KEY);
    if (savedLb) setLeaderboard(JSON.parse(savedLb));
  }, []);

  const changeLang = (code: Language) => {
    setLang(code);
    localStorage.setItem('soroban_lang', code);
    setIsLangMenuOpen(false);
  };

  const startExam = (level: ExamLevel) => {
    setFlashSettings({
      digits: level.digits,
      count: level.count,
      interval: level.speedMs,
      mode: 'visual'
    });
    setMode(AppMode.FLASH_ANZAN);
    setFlashResult(null);
  };

  const startCustomTraining = () => {
     setMode(AppMode.FLASH_ANZAN);
     setFlashResult(null);
  };

  const handleFlashComplete = (numbers: number[], sum: number) => {
    const matchingLevel = EXAM_LEVELS.find(l => 
        l.digits === flashSettings.digits && 
        l.count === flashSettings.count && 
        l.speedMs === flashSettings.interval
    );

    setFlashResult({ 
        numbers, 
        sum, 
        userGuess: '', 
        isExam: !!matchingLevel,
        levelId: matchingLevel?.id
    });
  };

  const saveScore = (name: string, result: any) => {
      // Calculate score: (digits * count * 10000) / interval
      // Base score for effort + speed bonus
      const score = Math.floor((flashSettings.digits * flashSettings.count * 10000) / flashSettings.interval);
      const newEntry: LeaderboardEntry = {
          name,
          score,
          date: Date.now(),
          details: `${flashSettings.digits}d ${flashSettings.count}n @ ${flashSettings.interval}ms`
      };
      const updated = [...leaderboard, newEntry];
      setLeaderboard(updated);
      localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-mono selection:bg-purple-900 selection:text-white flex flex-col">
      {mode !== AppMode.FLASH_ANZAN && (
        <Navigation 
            setMode={setMode} 
            isLangMenuOpen={isLangMenuOpen} 
            setIsLangMenuOpen={setIsLangMenuOpen} 
            lang={lang} 
            changeLang={changeLang} 
        />
      )}

      {/* Leaderboard Toggle (Absolute on Home) */}
      {mode === AppMode.HOME && (
          <button onClick={() => setShowLeaderboard(true)} className="fixed top-20 right-4 z-40 bg-slate-800 p-3 border-2 border-white shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:bg-slate-700 transition-all active:translate-y-1 active:shadow-none">
              🏆
          </button>
      )}
      
      <main className={`flex-1 flex flex-col transition-all duration-300 ${mode !== AppMode.FLASH_ANZAN ? '' : ''}`}>
        {mode === AppMode.HOME && <Home setMode={setMode} t={t} />}
        {mode === AppMode.PRACTICE && <Practice t={t} setMode={setMode} />}
        {mode === AppMode.EXAM_SELECT && <ExamSelect setMode={setMode} t={t} passedLevels={passedLevels} startExam={startExam} />}
        {mode === AppMode.CUSTOM_SETUP && <CustomSetup setMode={setMode} t={t} flashSettings={flashSettings} setFlashSettings={setFlashSettings} startCustomTraining={startCustomTraining} />}
      </main>

      {mode === AppMode.FLASH_ANZAN && (
        <FlashAnzan 
            settings={flashSettings} 
            onComplete={handleFlashComplete}
            onCancel={() => setMode(AppMode.HOME)}
        />
      )}
      
      {flashResult && (
        <ResultModal 
            flashResult={flashResult} 
            setFlashResult={setFlashResult} 
            passedLevels={passedLevels} 
            setPassedLevels={setPassedLevels} 
            setMode={setMode} 
            t={t} 
            onSaveScore={saveScore} // Pass the saveScore function
        />
      )}

      {showLeaderboard && (
        <LeaderboardModal 
            entries={leaderboard} 
            onClose={() => setShowLeaderboard(false)} 
            t={t} 
        />
      )}
    </div>
  );
};

export default App;