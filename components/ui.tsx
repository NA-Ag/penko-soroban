import React from 'react';

// Small shared building blocks, so every screen has the same spacing and type

export const Page: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`max-w-4xl mx-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-10 ${className}`}>{children}</div>
);

export const PageTitle: React.FC<{ children: React.ReactNode; kicker?: React.ReactNode }> = ({ children, kicker }) => (
  <header className="mb-6">
    {kicker && <p className="text-sm font-semibold text-shu mb-1">{kicker}</p>}
    <h1 className="font-display text-3xl sm:text-4xl font-extrabold">{children}</h1>
  </header>
);

export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', ...props }) => (
  <div className={`rounded-2xl border border-line bg-surface shadow-card ${className}`} {...props} />
);

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'quiet' };
export const buttonClass = (variant: 'primary' | 'quiet' = 'primary') =>
  `inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-colors disabled:opacity-50 ${
    variant === 'primary' ? 'bg-shu text-shu-ink hover:bg-shu/90' : 'border border-line bg-surface hover:bg-sunken'
  }`;
export const Button: React.FC<ButtonProps> = ({ variant = 'primary', className = '', ...props }) => (
  <button className={`${buttonClass(variant)} ${className}`} {...props} />
);

// A row of mutually exclusive choices (rods: 5 / 7 / 9 / 13, theme, ...)
export function Choice<T extends string | number>({ label, value, options, onChange }: {
  label: string; value: T; options: readonly { value: T; label: string }[]; onChange: (value: T) => void;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex flex-wrap gap-1 p-1 rounded-xl bg-sunken">
      {options.map(o => (
        <button key={String(o.value)} role="radio" aria-checked={o.value === value} onClick={() => onChange(o.value)}
          className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${o.value === value ? 'bg-surface text-ink shadow-sm' : 'text-muted hover:text-ink'}`}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

export const Toggle: React.FC<{ label: string; checked: boolean; onChange: (on: boolean) => void }> = ({ label, checked, onChange }) => (
  <label className="flex items-center justify-between gap-4 py-3 cursor-pointer">
    <span>{label}</span>
    <input type="checkbox" role="switch" checked={checked} onChange={e => onChange(e.target.checked)} className="sr-only peer" />
    <span aria-hidden="true" className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-shu ${checked ? 'bg-shu' : 'bg-line'}`}>
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
    </span>
  </label>
);

// Small buttons in a row just above an abacus (hint, undo, start again, clear): kept above it so
// they stay in view however big the abacus grows
export const Toolbar: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex flex-wrap justify-end gap-2 -mb-2">{children}</div>
);
export const ToolButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ className = '', ...props }) => (
  <button className={`px-3 py-1.5 rounded-lg border border-line bg-surface text-sm font-semibold hover:bg-sunken disabled:opacity-40 transition-colors ${className}`} {...props} />
);
