import React from 'react';
import { Penko, type PenkoPose } from './Penko';

// Penko saying something: the voice of every lesson step
export const Bubble: React.FC<{ children: React.ReactNode; pose?: PenkoPose; tone?: 'plain' | 'good' | 'bad' }> = ({ children, pose = 'talk', tone = 'plain' }) => (
  <div className="flex items-end gap-3">
    <Penko size={64} pose={pose} className="shrink-0 -mb-1" />
    <div
      aria-live="polite"
      className={`relative flex-1 rounded-2xl rounded-bl-md border px-4 py-3 leading-relaxed shadow-card ${
        tone === 'good' ? 'border-ok/40 bg-ok/10' : tone === 'bad' ? 'border-shu/40 bg-shu/10' : 'border-line bg-surface'
      }`}
    >
      {children}
    </div>
  </div>
);
