import React from 'react';
import { useApp, type Theme } from '../AppContext';
import { isLanguage, LANGUAGES, languageNames } from '../i18n';
import { Card, Choice, Page, PageTitle, Toggle } from '../components/ui';

const SettingsView: React.FC = () => {
  const { t, settings, updateSettings } = useApp();
  const themes: { value: Theme; label: string }[] = [
    { value: 'system', label: t.settings.themeSystem },
    { value: 'light', label: t.settings.themeLight },
    { value: 'dark', label: t.settings.themeDark },
  ];

  return (
    <Page className="max-w-2xl">
      <PageTitle>{t.settings.title}</PageTitle>
      <Card className="p-5 space-y-6">
        <div>
          <p className="font-medium mb-2">{t.settings.theme}</p>
          <Choice label={t.settings.theme} value={settings.theme} options={themes} onChange={theme => updateSettings({ theme })} />
        </div>
        <div>
          <label htmlFor="language" className="block font-medium mb-2">{t.settings.language}</label>
          <select id="language" value={settings.language ?? 'auto'}
            onChange={e => updateSettings({ language: isLanguage(e.target.value) ? e.target.value : null })}
            className="w-full sm:w-72 px-3 py-2.5 rounded-xl border border-line bg-surface">
            <option value="auto">{t.settings.languageAuto}</option>
            {LANGUAGES.map(code => <option key={code} value={code} lang={code}>{languageNames[code]}</option>)}
          </select>
        </div>
        <div className="divide-y divide-line">
          <Toggle label={t.settings.sound} checked={settings.sound} onChange={sound => updateSettings({ sound })} />
          <Toggle label={t.settings.rodValues} checked={settings.showRodValues} onChange={showRodValues => updateSettings({ showRodValues })} />
        </div>
      </Card>
      <Card className="p-5 mt-4">
        <h2 className="font-display text-lg font-extrabold mb-1">{t.settings.about}</h2>
        <p className="text-muted mb-3">{t.settings.aboutBody}</p>
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold">
          <a className="text-shu underline underline-offset-2" href="https://github.com/NA-Ag/penko-soroban" target="_blank" rel="noreferrer">{t.settings.source}</a>
          <a className="text-shu underline underline-offset-2" href="https://penkosoftware.org/" target="_blank" rel="noreferrer">{t.settings.plaza}</a>
        </div>
      </Card>
    </Page>
  );
};

export default SettingsView;
