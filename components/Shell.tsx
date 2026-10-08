import React from 'react';
import { Settings as SettingsIcon } from 'lucide-react';
import { routeHref, useApp } from '../AppContext';
import { Penko } from './Penko';
import { Seal } from './Seal';

export const SECTIONS = [
  { id: 'learn', kanji: '学' },
  { id: 'practice', kanji: '練' },
  { id: 'mental', kanji: '暗' },
  { id: 'exams', kanji: '検' },
  { id: 'progress', kanji: '記' },
] as const;

export type SectionId = (typeof SECTIONS)[number]['id'] | 'settings';

// Desktop: sidebar. Phone: header with the logo and settings, tab bar at the bottom.
// `focus` (lessons) hides the phone header and tab bar so the abacus gets the whole screen.
export const Shell: React.FC<{ section: SectionId; focus?: boolean; children: React.ReactNode }> = ({ section, focus = false, children }) => {
  const { t } = useApp();

  const brand = (
    <a href={routeHref('learn')} className="flex items-center gap-2.5 rounded-lg">
      <Penko size={36} />
      <span className="font-display text-lg font-extrabold">{t.appName}</span>
    </a>
  );

  return (
    <div className="min-h-[100dvh] lg:flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-60 shrink-0 h-[100dvh] sticky top-0 border-r border-line bg-surface/60 px-4 py-5">
        <div className="px-2 mb-8">{brand}</div>
        <nav aria-label={t.nav.main} className="flex flex-col gap-1">
          {SECTIONS.map(s => {
            const active = s.id === section;
            return (
              <a key={s.id} href={routeHref(s.id)} aria-current={active ? 'page' : undefined}
                className={`flex items-center gap-3 px-2 py-2 rounded-lg font-medium transition-colors ${active ? 'text-shu bg-shu/10' : 'text-muted hover:text-ink hover:bg-sunken'}`}>
                <Seal kanji={s.kanji} filled={active} />
                {t.nav[s.id]}
              </a>
            );
          })}
        </nav>
        <a href={routeHref('settings')} aria-current={section === 'settings' ? 'page' : undefined}
          className={`mt-auto flex items-center gap-3 px-2 py-2 rounded-lg font-medium transition-colors ${section === 'settings' ? 'text-shu bg-shu/10' : 'text-muted hover:text-ink hover:bg-sunken'}`}>
          <SettingsIcon size={20} className="mx-1" aria-hidden="true" />
          {t.nav.settings}
        </a>
      </aside>

      {/* Phone header */}
      <header className={`${focus ? 'hidden' : 'lg:hidden'} sticky top-0 z-30 flex items-center justify-between px-4 h-14 border-b border-line bg-paper/90 backdrop-blur`}>
        {brand}
        <a href={routeHref('settings')} aria-label={t.nav.settings} aria-current={section === 'settings' ? 'page' : undefined}
          className={`p-2 -mr-2 rounded-lg ${section === 'settings' ? 'text-shu' : 'text-muted'}`}>
          <SettingsIcon size={22} aria-hidden="true" />
        </a>
      </header>

      <main id="main" className={`flex-1 min-w-0 lg:pb-0 ${focus ? 'pb-6' : 'pb-24'}`}>{children}</main>

      {/* Phone tab bar */}
      <nav aria-label={t.nav.main} className={`${focus ? 'hidden' : 'lg:hidden'} fixed bottom-0 inset-x-0 z-30 border-t border-line bg-surface/95 backdrop-blur pb-[env(safe-area-inset-bottom)]`}>
        <div className="grid grid-cols-5">
          {SECTIONS.map(s => {
            const active = s.id === section;
            return (
              <a key={s.id} href={routeHref(s.id)} aria-current={active ? 'page' : undefined}
                className={`flex flex-col items-center gap-1 pt-2 pb-1.5 text-[11px] font-medium leading-tight ${active ? 'text-shu' : 'text-muted'}`}>
                <Seal kanji={s.kanji} filled={active} size={26} />
                <span className="text-center px-0.5">{t.nav[s.id]}</span>
              </a>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
