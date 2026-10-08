import React, { useEffect } from 'react';
import { AppProvider, useApp } from './AppContext';
import { ProgressProvider } from './core/progress';
import { UNITS, type UnitId } from './core/course';
import { Shell, type SectionId } from './components/Shell';
import Learn from './views/Learn';
import UnitView from './views/UnitView';
import LessonPlayer from './views/LessonPlayer';
import Practice from './views/Practice';
import MentalMath from './views/MentalMath';
import Exams from './views/Exams';
import ProgressView from './views/ProgressView';
import SettingsView from './views/SettingsView';

// #/learn, #/learn/<unit>, #/lesson/<id>, #/practice/<drill>, #/mental/<game>, #/exams/<id>, ...
const Screens: React.FC = () => {
  const { route } = useApp();
  const [first, second] = route;

  // Each new screen starts at the top
  useEffect(() => { window.scrollTo({ top: 0 }); }, [first, second]);

  let section: SectionId = 'learn';
  const focus = first === 'lesson';
  let screen: React.ReactNode;
  switch (first) {
    case 'lesson': screen = <LessonPlayer key={second} id={second ?? ''} />; break;
    case 'practice': section = 'practice'; screen = <Practice key={second} sub={second} />; break;
    case 'mental': section = 'mental'; screen = <MentalMath key={second} sub={second} />; break;
    case 'exams': section = 'exams'; screen = <Exams key={second} id={second} />; break;
    case 'progress': section = 'progress'; screen = <ProgressView />; break;
    case 'settings': section = 'settings'; screen = <SettingsView />; break;
    default:
      screen = second && UNITS.some(u => u.id === second) ? <UnitView key={second} id={second as UnitId} /> : <Learn />;
  }

  return <Shell section={section} focus={focus}>{screen}</Shell>;
};

const App: React.FC = () => (
  <AppProvider>
    <ProgressProvider>
      <Screens />
    </ProgressProvider>
  </AppProvider>
);

export default App;
