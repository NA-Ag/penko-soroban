import React from 'react';
import { AppMode } from '../types';
import { TRANSLATIONS } from '../translations';

interface HomeProps {
  setMode: (mode: AppMode) => void;
  t: typeof TRANSLATIONS['en']; // Type for translation object
}

const Home: React.FC<HomeProps> = ({ setMode, t }) => (
  <div className="flex-1 flex flex-col items-center justify-center w-full max-w-4xl mx-auto animate-fade-in p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
          <button 
            onClick={() => setMode(AppMode.PRACTICE)}
            className="flex flex-col items-center justify-center p-12 bg-slate-900 rounded-none border-2 border-white shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] hover:translate-y-[-2px] hover:shadow-[10px_10px_0px_0px_rgba(255,255,255,1)] active:translate-y-[2px] active:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] transition-all group"
          >
            <div className="w-20 h-20 mb-6 text-slate-400 group-hover:text-purple-400 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-full h-full">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.499 5.24 50.534 50.534 0 00-2.658.813m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2 font-mono uppercase tracking-wider">{t.navPractice}</h2>
            <p className="text-slate-400 text-center font-mono">{t.trainingDesc}</p>
          </button>

          <button 
            onClick={() => setMode(AppMode.EXAM_SELECT)}
            className="flex flex-col items-center justify-center p-12 bg-slate-900 rounded-none border-2 border-white shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] hover:translate-y-[-2px] hover:shadow-[10px_10px_0px_0px_rgba(255,255,255,1)] active:translate-y-[2px] active:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] transition-all group"
          >
            <div className="w-20 h-20 mb-6 text-slate-400 group-hover:text-purple-400 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-full h-full">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2 font-mono uppercase tracking-wider">{t.navExam}</h2>
            <p className="text-slate-400 text-center font-mono">{t.testDesc}</p>
          </button>
      </div>
  </div>
);

export default Home;