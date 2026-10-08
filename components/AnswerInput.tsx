import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../AppContext';
import { Button } from './ui';

// A big number box with a Check button. Opens the number keyboard on phones.
export const AnswerInput: React.FC<{ onSubmit: (value: number) => void; disabled?: boolean; label?: string; autoFocus?: boolean }> = ({
  onSubmit, disabled = false, label, autoFocus = true,
}) => {
  const { t } = useApp();
  const [text, setText] = useState('');
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => { if (autoFocus && !disabled) input.current?.focus({ preventScroll: true }); }, [autoFocus, disabled]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || disabled) return;
    onSubmit(Number(text));
    setText('');
  };

  return (
    <form onSubmit={submit} className="flex gap-2">
      <input
        ref={input}
        value={text}
        onChange={e => setText(e.target.value.replace(/\D/g, '').slice(0, 12))}
        inputMode="numeric"
        autoComplete="off"
        aria-label={label ?? t.common.answer}
        placeholder={t.common.answer}
        disabled={disabled}
        className="min-w-0 flex-1 rounded-xl border-2 border-line bg-surface px-4 py-3 text-2xl font-extrabold tabular focus:border-shu focus:outline-none disabled:opacity-50"
      />
      <Button type="submit" disabled={disabled || !text}>{t.common.check}</Button>
    </form>
  );
};
