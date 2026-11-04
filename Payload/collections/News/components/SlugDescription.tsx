'use client';

import { useField } from '@payloadcms/ui';

export const SlugDescription: React.FC = () => {
  const { value } = useField<string>({ path: 'slug' });

  if (!value || typeof value !== 'string') return null;

  const trimmedValue = value.trim();
  const wordsCount = trimmedValue.split('-').filter(Boolean).length;
  const isOverWordLimit = wordsCount > 7;
  const isOverCharLimit = trimmedValue.length > 60;

  if (!isOverWordLimit && !isOverCharLimit) {
    return (
      <div
        className='field-description'
        style={{
          color: 'var(--theme-elevation-400)',
          marginTop: '4px',
          fontSize: '13px',
        }}
      >
        The slug for this post.
      </div>
    );
  }

  return (
    <div
      className='field-description'
      style={{
        color: 'var(--theme-error-400)',
        marginTop: '4px',
        fontSize: '13px',
      }}
    >
      <strong>Warning:</strong>{' '}
      {isOverWordLimit && `Slug exceeds 7 words (${wordsCount} words). `}
      {isOverCharLimit &&
        `Slug exceeds 60 characters (${trimmedValue.length} characters).`}
    </div>
  );
};
