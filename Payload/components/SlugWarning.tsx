'use client';

import { type FC, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import { toast, useField, useFormFields } from '@payloadcms/ui';

export const SlugWarning: FC = () => {
  const [loading, setLoading] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [wrapper, setWrapper] = useState<HTMLElement | null>(null);

  const { titleValue, slugValue } = useFormFields(([fields]) => ({
    titleValue: fields.title?.value as string | undefined,
    slugValue: fields.slug?.value as string | undefined,
  }));

  const { setValue: setSlug } = useField<string>({ path: 'slug' });
  const { setValue: setSlugLock } = useField<boolean>({ path: 'slugLock' });

  const val = typeof slugValue === 'string' ? slugValue.trim() : '';
  const charCount = val.length;
  const wordsCount = val ? val.split('-').filter(Boolean).length : 0;

  const isOverWordLimit = wordsCount > 7;
  const isOverCharLimit = charCount > 60;
  const hasWarning = isOverWordLimit || isOverCharLimit;

  useEffect(() => {
    const find = (): boolean => {
      const el = document.querySelector<HTMLElement>(
        '.slug-field-component .label-wrapper'
      );
      if (el) {
        setWrapper((prev) => (prev === el ? prev : el));
        return true;
      }
      return false;
    };

    find();

    const observer = new MutationObserver(() => {
      find();
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  const handleGenerateAiSlug = async () => {
    const rawTitle = typeof titleValue === 'string' ? titleValue.trim() : '';

    if (!rawTitle) {
      toast.error(
        'Please enter an article title first to generate an AI slug.'
      );
      return;
    }

    try {
      setLoading(true);

      const res = await fetch('/api/news/generate-ai-slug', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: rawTitle }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to generate AI slug');
      }

      if (data.slug) {
        if (typeof setSlugLock === 'function') setSlugLock(false);
        if (typeof setSlug === 'function') setSlug(data.slug);

        const lockBtn = document.querySelector<HTMLButtonElement>(
          '.slug-field-component #field-slug-lock'
        );
        if (lockBtn && lockBtn.textContent?.toLowerCase().includes('unlock')) {
          lockBtn.click();
        }

        toast.success(`Generated SEO Slug: ${data.slug}`);
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Error generating AI slug';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  let textColor = 'var(--theme-elevation-800, #cbd5e1)';
  if (loading) {
    textColor = 'var(--theme-elevation-500, #6b7280)';
  } else if (hovered) {
    textColor = 'var(--theme-text, #ffffff)';
  }

  const btnBg = 'var(--theme-elevation-50, rgba(255, 255, 255, 0.04))';
  const btnBorder =
    '1px solid var(--theme-elevation-200, rgba(255, 255, 255, 0.1))';
  const boxShadow = 'none';

  let buttonText = 'Optimize with AI';
  if (loading) {
    buttonText = 'Optimizing…';
  }

  const icon = (
    <svg
      width='12'
      height='12'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      style={{ flexShrink: 0 }}
      aria-hidden='true'
    >
      <path d='M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z' />
      <path d='M20 3v4' />
      <path d='M22 5h-4' />
    </svg>
  );

  const buttonElement = (
    <button
      type='button'
      onClick={handleGenerateAiSlug}
      disabled={loading}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        background: btnBg,
        border: btnBorder,
        borderBottom: 'none',
        borderTopLeftRadius: '5px',
        borderTopRightRadius: '5px',
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        alignSelf: 'flex-end',
        marginBottom: '-1px',
        position: 'relative',
        zIndex: 1,
        boxShadow,
        padding: '3px 8px',
        fontSize: '11.5px',
        fontWeight: 500,
        color: textColor,
        cursor: loading ? 'not-allowed' : 'pointer',
        opacity: loading ? 0.65 : 1,
        transition: 'all 0.15s ease',
        textDecoration: 'none',
        lineHeight: 1.2,
      }}
    >
      {icon}
      <span>{buttonText}</span>
    </button>
  );

  return (
    <>
      <div>
        {hasWarning && (
          <div
            style={{
              padding: '9px 12px',
              backgroundColor: 'rgba(245,158,11,0.08)',
              borderLeft: '3px solid var(--theme-warning-500, #f59e0b)',
              borderRadius: '0 4px 4px 0',
              fontSize: '12px',
              lineHeight: '1.5',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                fontWeight: 600,
                color: 'var(--theme-warning-500, #f59e0b)',
              }}
            >
              <svg
                width='13'
                height='13'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2.5'
                strokeLinecap='round'
                strokeLinejoin='round'
                style={{ flexShrink: 0 }}
              >
                <path d='M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z' />
                <line
                  x1='12'
                  y1='9'
                  x2='12'
                  y2='13'
                />
                <line
                  x1='12'
                  y1='17'
                  x2='12.01'
                  y2='17'
                />
              </svg>
              SEO Advisory
            </div>

            <div
              style={{
                color: 'var(--theme-elevation-800, #9ca3af)',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
              }}
            >
              {isOverWordLimit && (
                <div>
                  Exceeds recommended 7 words&nbsp;
                  <span style={{ opacity: 0.6 }}>
                    (currently {wordsCount} words)
                  </span>
                </div>
              )}
              {isOverCharLimit && (
                <div>
                  Exceeds 60 characters&nbsp;
                  <span style={{ opacity: 0.6 }}>
                    (currently {charCount} chars)
                  </span>
                </div>
              )}
            </div>

            <div style={{ color: 'var(--theme-elevation-600, #6b7280)' }}>
              AI prioritises meaningful, keyword-rich slugs. These limits will
              not block publishing.
            </div>
          </div>
        )}
      </div>
      {wrapper ? createPortal(buttonElement, wrapper) : null}
    </>
  );
};

export default SlugWarning;
