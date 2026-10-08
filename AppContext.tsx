import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { browserLanguage, isLanguage, loadStrings, type Language, type Strings } from './i18n';
import { en } from './i18n/locales/en';
import { readJson, writeJson } from './core/storage';
import { setSoundEnabled } from './core/sound';

export type Theme = 'system' | 'light' | 'dark';

export interface Settings {
  theme: Theme;
  language: Language | null; // null: follow the browser
  showRodValues: boolean;
  sound: boolean;
}

const SETTINGS_KEY = 'penko-soroban/settings';
const DEFAULT_SETTINGS: Settings = { theme: 'system', language: null, showRodValues: true, sound: true };

// Screens are addressed by the URL hash (#/learn, #/practice/free, ...) so the back button
// and links work, and each screen can be bookmarked
export type Route = string[];
const parseHash = (): Route => window.location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
export const routeHref = (...parts: string[]) => `#/${parts.join('/')}`;

interface AppContextValue {
  settings: Settings;
  updateSettings: (patch: Partial<Settings>) => void;
  language: Language;
  t: Strings;
  route: Route;
  navigate: (...parts: string[]) => void;
  dark: boolean;
}

const AppContext = createContext<AppContextValue | null>(null);

export const useApp = () => {
  const value = useContext(AppContext);
  if (!value) throw new Error('useApp must be used inside <AppProvider>');
  return value;
};

const prefersDark = () => window.matchMedia('(prefers-color-scheme: dark)');

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(() => {
    const saved = readJson(SETTINGS_KEY, DEFAULT_SETTINGS);
    return { ...saved, language: isLanguage(saved.language) ? saved.language : null };
  });
  const language = settings.language ?? browserLanguage();
  const [t, setStrings] = useState<Strings>(en);
  const [route, setRoute] = useState<Route>(parseHash);
  const [systemDark, setSystemDark] = useState(() => prefersDark().matches);

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setSettings(prev => {
      const next = { ...prev, ...patch };
      writeJson(SETTINGS_KEY, next);
      return next;
    });
  }, []);

  // Swap text only once the language has loaded, so the screen never shows missing strings
  useEffect(() => {
    let current = true;
    loadStrings(language).then(strings => { if (current) setStrings(strings); }, () => undefined);
    document.documentElement.lang = language;
    return () => { current = false; };
  }, [language]);

  useEffect(() => {
    const media = prefersDark();
    const onChange = () => setSystemDark(media.matches);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  useEffect(() => { setSoundEnabled(settings.sound); }, [settings.sound]);

  const dark = settings.theme === 'dark' || (settings.theme === 'system' && systemDark);
  useEffect(() => { document.documentElement.classList.toggle('dark', dark); }, [dark]);

  useEffect(() => {
    const onHash = () => setRoute(parseHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const navigate = useCallback((...parts: string[]) => { window.location.hash = routeHref(...parts); }, []);

  const value = useMemo(
    () => ({ settings, updateSettings, language, t, route, navigate, dark }),
    [settings, updateSettings, language, t, route, navigate, dark],
  );
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
