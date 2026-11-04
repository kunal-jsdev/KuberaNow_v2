'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { IoMdEye, IoMdEyeOff } from 'react-icons/io';
import { createPortal } from 'react-dom';

const HIDE_FORGOT_CSS = `
  .login__form a[href$="/forgot"],
  .login__form a[href*="/forgot?"] {
    display: none !important;
  }
`;

const BUTTON_STYLE: React.CSSProperties = {
  position: 'absolute',
  top: '50%',
  right: '0.625rem',
  transform: 'translateY(-50%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '0.25rem',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: 'var(--theme-elevation-500, #888)',
  lineHeight: 0,
  zIndex: 1,
};

export default function PasswordToggle() {
  const [wrapper, setWrapper] = useState<HTMLElement | null>(null);
  const [revealed, setRevealed] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const caretRef = useRef<{ start: number; end: number } | null>(null);

  useEffect(() => {
    const find = (): boolean => {
      const field = document.querySelector<HTMLInputElement>(
        'input#field-password, input[name="password"][type="password"]'
      );
      if (!field?.parentElement) return false;

      field.setAttribute('autocomplete', 'off');
      field.setAttribute('autocorrect', 'off');
      field.setAttribute('autocapitalize', 'off');
      field.setAttribute('spellcheck', 'false');
      field.setAttribute('data-lpignore', 'true');
      field.setAttribute('data-1p-ignore', 'true');

      field.style.paddingRight = '2.5rem';
      if (getComputedStyle(field.parentElement).position === 'static') {
        field.parentElement.style.position = 'relative';
      }

      inputRef.current = field;
      setWrapper(field.parentElement);
      return true;
    };

    if (find()) return;

    const observer = new MutationObserver(() => {
      if (find()) observer.disconnect();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;

    const expected = revealed ? 'text' : 'password';

    const restore = () => {
      if (document.activeElement !== input) return;
      const { start, end } = caretRef.current ?? {
        start: input.value.length,
        end: input.value.length,
      };
      input.setSelectionRange(start, end);
    };

    const applyType = () => {
      if (input.type === expected) return;
      input.type = expected;
      restore();
    };

    if (caretRef.current) input.focus();
    applyType();
    restore();

    const guard = new MutationObserver(applyType);
    guard.observe(input, { attributes: true, attributeFilter: ['type'] });

    return () => {
      guard.disconnect();
      input.type = 'password';
    };
  }, [revealed]);

  useEffect(() => {
    if (!revealed) return;

    const hide = () => setRevealed(false);
    const form = inputRef.current?.closest('form');

    form?.addEventListener('submit', hide);
    document.addEventListener('visibilitychange', hide);
    window.addEventListener('blur', hide);

    return () => {
      form?.removeEventListener('submit', hide);
      document.removeEventListener('visibilitychange', hide);
      window.removeEventListener('blur', hide);
    };
  }, [revealed]);

  const toggle = useCallback(() => {
    setRevealed((prev) => !prev);
  }, []);

  const label = revealed ? 'Hide password' : 'Show password';

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: HIDE_FORGOT_CSS }} />
      {wrapper &&
        createPortal(
          <button
            type='button'
            onClick={toggle}
            aria-label={label}
            aria-pressed={revealed}
            title={label}
            style={BUTTON_STYLE}
          >
            {revealed ? <IoMdEyeOff size={18} /> : <IoMdEye size={18} />}
          </button>,
          wrapper
        )}
    </>
  );
}
