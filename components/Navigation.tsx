import React from 'react';
import { AppMode, Language, LanguageOption } from '../types';
import { LANGUAGES } from '../constants';

interface NavigationProps {
  setMode: (mode: AppMode) => void;
  isLangMenuOpen: boolean;
  setIsLangMenuOpen: (isOpen: boolean) => void;
  lang: Language;
  changeLang: (code: Language) => void;
}

const Navigation: React.FC<NavigationProps> = ({ setMode, isLangMenuOpen, setIsLangMenuOpen, lang, changeLang }) => (
  <nav className="fixed top-0 left-0 right-0 h-16 bg-slate-900 border-b-2 border-white flex items-center justify-between px-4 md:px-8 z-50">
      <div className="flex items-center gap-8">
          <button 
              onClick={() => setMode(AppMode.HOME)}
              className="flex items-center gap-3 cursor-pointer group"
          >
              <img src="./penguin-soroban-logo.svg" alt="Penko" className="w-12 h-12" />
              <div className="text-2xl font-bold text-white group-hover:text-purple-400 transition-colors font-mono tracking-tighter uppercase">Penko Soroban</div>
          </button>
      </div>

      {/* Settings / Lang */}
      <div className="relative">
          <button 
              onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
              className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-800 font-mono"
          >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" /></svg>
              <span className="hidden md:inline text-xs font-mono uppercase">{lang}</span>
          </button>
          
          {isLangMenuOpen && (
              <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsLangMenuOpen(false)}></div>
                  <div className="absolute right-0 top-full mt-2 w-48 bg-slate-900 border-2 border-white rounded-none shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] overflow-hidden z-50">
                      {LANGUAGES.map((l: LanguageOption) => (
                          <button key={l.code} onClick={() => changeLang(l.code)} className={`w-full text-left px-4 py-3 text-sm flex items-center gap-3 hover:bg-slate-800 transition-colors font-mono uppercase ${lang === l.code ? 'text-purple-400 bg-slate-800 font-bold' : 'text-slate-400'}`}>
                              <span>{l.label}</span>
                          </button>
                      ))}
                  </div>
              </>
          )}
      </div>
  </nav>
);

export default Navigation;