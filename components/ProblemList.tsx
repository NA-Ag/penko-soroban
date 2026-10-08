import React from 'react';
import type { Term } from '../core/problems';

// A soroban-style problem: numbers stacked in a column, the current one highlighted
export const ProblemList: React.FC<{ terms: readonly Term[]; current?: number; hideAfterCurrent?: boolean }> = ({ terms, current = -1 }) => (
  // A row on phones (saves height for the abacus), the traditional column on bigger screens
  <ol className="flex flex-wrap items-baseline gap-x-1 sm:inline-flex sm:flex-col sm:items-end font-extrabold text-2xl sm:text-3xl tabular leading-snug">
    {terms.map((term, i) => (
      <li key={i}
        className={`px-1.5 sm:px-3 rounded-lg transition-colors ${i === current ? 'bg-shu/10 text-shu' : i < current ? 'text-muted' : ''}`}>
        <span className="inline-block sm:w-6 pr-1 sm:pr-0 text-left text-muted" aria-hidden="true">{i === 0 ? '' : term.op === '+' ? '+' : '−'}</span>
        <span className="sr-only">{i === 0 ? '' : term.op === '+' ? 'plus' : 'minus'}</span>
        {term.value}
      </li>
    ))}
  </ol>
);
