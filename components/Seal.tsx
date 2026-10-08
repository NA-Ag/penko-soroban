import React from 'react';

// A hanko-style seal: a kanji in a vermilion square. Used for navigation, lesson stamps
// and exam certificates. Decorative: the text label next to it carries the meaning.
interface SealProps {
  kanji: string;
  filled?: boolean;
  size?: number;
  className?: string;
}

export const Seal: React.FC<SealProps> = ({ kanji, filled = false, size = 28, className = '' }) => (
  <span
    aria-hidden="true"
    className={`inline-flex items-center justify-center shrink-0 rounded-[6px] border-2 font-seal font-bold leading-none transition-colors ${
      filled ? 'bg-shu border-shu text-shu-ink' : 'border-current'
    } ${className}`}
    style={{ width: size, height: size, fontSize: size * 0.58 }}
  >
    {kanji}
  </span>
);
