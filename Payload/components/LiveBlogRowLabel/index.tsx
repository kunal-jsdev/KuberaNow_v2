'use client';

import type { FC } from 'react';

import { useRowLabel } from '@payloadcms/ui';

export const LiveBlogRowLabel: FC = () => {
  const { data } = useRowLabel<{
    headline?: string;
  }>();

  const headline = data?.headline?.trim();

  return (
    <span
      className='live-blog-row-label'
      style={{
        fontWeight: 500,
        fontSize: '14px',
        color: 'var(--theme-elevation-800, #ffffff)',
        letterSpacing: '-0.01em',
      }}
    >
      {headline || 'Live Blog'}
    </span>
  );
};

export default LiveBlogRowLabel;
