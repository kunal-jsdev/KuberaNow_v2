'use client';

import { type CSSProperties, type FC, type MouseEvent, useState } from 'react';

import { getGlassTileStyle } from '../glassStyles';
import { useVideoPlayer } from '../useVideoPlayer';

export const SeekBackward5Button: FC<{
  className?: string;
  style?: CSSProperties;
}> = ({ className = '', style = {} }) => {
  const { seekRelative, isFullscreen } = useVideoPlayer();
  const [isHovered, setIsHovered] = useState(false);
  const iconSize = isFullscreen ? 16 : 14;

  const handleClick = (e: MouseEvent) => {
    e.stopPropagation();
    seekRelative(-5);
  };

  return (
    <button
      type='button'
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label='Rewind 5 seconds (Left Arrow)'
      title='Rewind 5s (Left Arrow)'
      className={`group relative flex cursor-pointer items-center justify-center outline-none select-none ${className}`}
      style={{
        ...getGlassTileStyle(isFullscreen),
        padding: '0 8px',
        fontSize: isFullscreen ? '12px' : '11px',
        fontWeight: 600,
        gap: '3px',
        color: '#fff',
        ...(isHovered
          ? {
              background: 'rgba(0, 0, 0, 0.72)',
              boxShadow: '0 6px 18px rgba(0, 0, 0, 0.5)',
            }
          : {}),
        ...style,
      }}
    >
      <svg
        width={iconSize}
        height={iconSize}
        viewBox='0 0 24 24'
        fill='currentColor'
        style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.45))' }}
      >
        <path
          d='M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 4.14 0 7.5 3.36 7.5 7.5s-3.36 7.5-7.5 7.5c-2.09 0-3.98-.85-5.35-2.22l-1.42 1.42C7.57 26.54 9.89 27.5 12.5 27.5c5.52 0 10-4.48 10-10s-4.48-10-10-10z'
          transform='scale(0.85) translate(2,2)'
        />
      </svg>
      <span>-5s</span>
    </button>
  );
};

export const SeekForward5Button: FC<{
  className?: string;
  style?: CSSProperties;
}> = ({ className = '', style = {} }) => {
  const { seekRelative, isFullscreen } = useVideoPlayer();
  const [isHovered, setIsHovered] = useState(false);
  const iconSize = isFullscreen ? 16 : 14;

  const handleClick = (e: MouseEvent) => {
    e.stopPropagation();
    seekRelative(5);
  };

  return (
    <button
      type='button'
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label='Forward 5 seconds (Right Arrow)'
      title='Forward 5s (Right Arrow)'
      className={`group relative flex cursor-pointer items-center justify-center outline-none select-none ${className}`}
      style={{
        ...getGlassTileStyle(isFullscreen),
        padding: '0 8px',
        fontSize: isFullscreen ? '12px' : '11px',
        fontWeight: 600,
        gap: '3px',
        color: '#fff',
        ...(isHovered
          ? {
              background: 'rgba(0, 0, 0, 0.72)',
              boxShadow: '0 6px 18px rgba(0, 0, 0, 0.5)',
            }
          : {}),
        ...style,
      }}
    >
      <span>+5s</span>
      <svg
        width={iconSize}
        height={iconSize}
        viewBox='0 0 24 24'
        fill='currentColor'
        style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.45))' }}
      >
        <path
          d='M11.5 8c2.65 0 5.05.99 6.9 2.6L22 7v9h-9l3.62-3.62c-1.39-1.16-3.16-1.88-5.12-1.88-4.14 0-7.5 3.36-7.5 7.5s3.36 7.5 7.5 7.5c2.09 0 3.98-.85 5.35-2.22l1.42 1.42C16.43 26.54 14.11 27.5 11.5 27.5c-5.52 0-10-4.48-10-10s4.48-10 10-10z'
          transform='scale(0.85) translate(2,2)'
        />
      </svg>
    </button>
  );
};
