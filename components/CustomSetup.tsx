import React from 'react';
import { AppMode, FlashSettings } from '../types';
import { TRANSLATIONS } from '../translations';
import { cardStyle, btnPrimary } from '../styles';

interface CustomSetupProps {
  setMode: (mode: AppMode) => void;
  t: typeof TRANSLATIONS['en'];
  flashSettings: FlashSettings;
  setFlashSettings: (settings: FlashSettings) => void;
  startCustomTraining: () => void;
}

const CustomSetup: React.FC<CustomSetupProps> = ({ setMode, t, flashSettings, setFlashSettings, startCustomTraining }) => (
  <div className="pt-24 px-4 pb-12 max-w-xl mx-auto flex flex-col justify-center min-h-[60vh]">
      <button 
          onClick={() => setMode(AppMode.EXAM_SELECT)}
          className="self-start mb-6 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-mono uppercase font-bold flex items-center gap-2 rounded-lg border-2 border-slate-600 shadow-md transition-all"
      >
          ← {t.back}
      </button>
      <div className={cardStyle}>
          <h2 className="text-2xl font-bold mb-8 text-white font-mono uppercase tracking-widest text-center border-b-2 border-white pb-4">{t.customMode}</h2>
          
          {/* Mode Toggle (Visual/Spoken) */}
          <div className="flex flex-col gap-2 mb-8">
              <label className="text-white text-sm font-bold uppercase tracking-wide font-mono">{t.mode}</label>
              <div className="flex border-2 border-white">
                  <button onClick={() => setFlashSettings({...flashSettings, mode: 'visual'})} className={`flex-1 py-2 font-bold uppercase ${!flashSettings.mode || flashSettings.mode === 'visual' ? 'bg-purple-600 text-white' : 'bg-slate-900 text-slate-400'}`}>
                      {t.visual}
                  </button>
                  <button onClick={() => setFlashSettings({...flashSettings, mode: 'spoken'})} className={`flex-1 py-2 font-bold uppercase ${flashSettings.mode === 'spoken' ? 'bg-purple-600 text-white' : 'bg-slate-900 text-slate-400'}`}>
                      {t.spoken}
                  </button>
              </div>
          </div>

          <div className="space-y-8">
              {[
                  { label: t.digits, min: 1, max: 10, val: flashSettings.digits, key: 'digits', suffix: '' },
                  { label: t.numbers, min: 3, max: 50, val: flashSettings.count, key: 'count', suffix: '' },
                  { label: t.speed, min: 100, max: 3000, step: 100, val: flashSettings.interval, key: 'interval', suffix: 'ms' }
              ].map(setting => (
                  <div key={setting.key} className="flex flex-col gap-2">
                      <div className="flex justify-between items-end mb-1">
                          <label className="text-white text-sm font-bold uppercase tracking-wide font-mono">{setting.label}</label>
                      </div>
                      <div className="flex items-center gap-4 bg-slate-950 p-2 border-2 border-white">
                           <button 
                              onClick={() => {
                                  const newVal = Math.max(setting.min, setting.val - (setting.step || 1));
                                  setFlashSettings({...flashSettings, [setting.key]: newVal});
                              }}
                              className="w-10 h-10 flex items-center justify-center bg-slate-800 text-white hover:bg-slate-700 border-2 border-white font-bold text-xl transition-colors"
                           >
                              -
                           </button>
                           <div className="flex-1 text-center font-mono text-2xl text-white">
                              {setting.val}<span className="text-sm text-slate-500 ml-1">{setting.suffix}</span>
                           </div>
                           <button 
                              onClick={() => {
                                  const newVal = Math.min(setting.max, setting.val + (setting.step || 1));
                                  setFlashSettings({...flashSettings, [setting.key]: newVal});
                              }}
                              className="w-10 h-10 flex items-center justify-center bg-slate-800 text-white hover:bg-slate-700 border-2 border-white font-bold text-xl transition-colors"
                           >
                              +
                           </button>
                      </div>
                  </div>
              ))}

              <button 
                  onClick={startCustomTraining}
                  className={`w-full ${btnPrimary} mt-8 py-4 text-lg`}
              >
                  {t.go}
              </button>
          </div>
      </div>
  </div>
);

export default CustomSetup;