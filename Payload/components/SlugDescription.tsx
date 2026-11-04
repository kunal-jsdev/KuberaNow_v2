'use client';

import { useField } from '@payloadcms/ui';

export const SlugDescription: React.FC = () => {
  const { value } = useField<string>({ path: 'slug' });

  const val = typeof value === 'string' ? value.trim() : '';
  const wordsCount = val ? val.split('-').filter(Boolean).length : 0;
  const charCount = val.length;

  const wordWarning =
    wordsCount > 0 && (wordsCount < 4 || wordsCount > 7) ? (
      <div>
        Slug must be 4-7 words long. Currently it has {wordsCount} words.
      </div>
    ) : null;

  const charWarning =
    charCount > 60 ? (
      <div>
        Slug must not exceed 60 characters. Currently it has {charCount}{' '}
        characters.
      </div>
    ) : null;

  const hasWarning = wordWarning || charWarning;

  if (!hasWarning) {
    if (charCount > 0) {
      return (
        <div
          style={{
            marginTop: '0.5rem',
            fontSize: '13px',
            color: 'var(--theme-success-400, green)',
          }}
        >
          Slug length is valid ({wordsCount} words, {charCount} chars).
        </div>
      );
    }
    return null;
  }

  return (
    <div
      style={{
        marginTop: '0.75rem',
        padding: '0.75rem 1rem',
        backgroundColor: 'rgba(245, 158, 11, 0.1)', // Light orange background
        borderLeft: '4px solid #f59e0b', // Orange left border
        color: '#b45309', // Darker orange text
        borderRadius: '4px',
        fontSize: '14px',
        lineHeight: '1.5',
        display: 'flex',
        gap: '0.5rem',
        alignItems: 'flex-start',
      }}
    >
      <div style={{ flexShrink: 0 }}>
        <svg
          width='20'
          height='20'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
        >
          <path d='M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z'></path>
          <line
            x1='12'
            y1='9'
            x2='12'
            y2='13'
          ></line>
          <line
            x1='12'
            y1='17'
            x2='12.01'
            y2='17'
          ></line>
        </svg>
      </div>
      <div>
        <strong>Warning</strong>
        {wordWarning}
        {charWarning}
      </div>
    </div>
  );
};
