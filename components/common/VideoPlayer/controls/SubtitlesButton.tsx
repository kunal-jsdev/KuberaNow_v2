'use client';

import { type FC, useState } from 'react';

import { getGlassTileStyle } from '../glassStyles';
import { SubtitlesButtonProps } from '../types';
import { useVideoPlayer } from '../useVideoPlayer';

export const SubtitlesButton: FC<SubtitlesButtonProps> = ({
  className = '',
  style = {},
}) => {
  const { isSubtitlesEnabled, toggleSubtitles, isFullscreen, hasSubtitles } =
    useVideoPlayer();

  const [isHovered, setIsHovered] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!hasSubtitles) {
      setToastMessage('Subtitles not available for this video');
      setTimeout(() => setToastMessage(null), 2500);
      return;
    }

    toggleSubtitles();
  };

  const iconWidth = isFullscreen ? 20 : 17;
  const iconHeight = isFullscreen ? 15 : 13;

  return (
    <div
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {toastMessage && (
        <div
          style={{
            position: 'absolute',
            bottom: isFullscreen ? '48px' : '40px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(24, 24, 27, 0.95)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: '#ffffff',
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: isFullscreen ? '12px' : '11px',
            fontWeight: 500,
            whiteSpace: 'nowrap',
            boxShadow: '0 8px 20px rgba(0, 0, 0, 0.6)',
            pointerEvents: 'none',
            zIndex: 40,
            animation: 'fadeIn 0.15s ease',
          }}
        >
          {toastMessage}
        </div>
      )}

      <button
        type='button'
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label={
          isSubtitlesEnabled
            ? 'Subtitles/closed captions (c) - On'
            : 'Subtitles/closed captions (c) - Off'
        }
        title={
          hasSubtitles
            ? `Subtitles/closed captions (c) - ${
                isSubtitlesEnabled ? 'On' : 'Off'
              }`
            : 'Subtitles (not available)'
        }
        className={`group relative flex cursor-pointer items-center justify-center outline-none select-none ${className}`}
        style={{
          ...getGlassTileStyle(isFullscreen),
          ...(isHovered
            ? {
                background: 'rgba(0, 0, 0, 0.72)',
                boxShadow: '0 6px 18px rgba(0, 0, 0, 0.5)',
              }
            : {}),
          position: 'relative',
          opacity: hasSubtitles ? 1 : 0.65,
          color: isSubtitlesEnabled ? '#ffffff' : 'rgba(255, 255, 255, 0.75)',
          ...style,
        }}
      >
        <svg
          width={iconWidth}
          height={iconHeight}
          viewBox='0 0 24 18'
          fill='none'
          style={{
            filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.45))',
            transition: 'color 0.15s ease',
          }}
        >
          <rect
            x='1'
            y='1'
            width='22'
            height='16'
            rx='3'
            stroke='currentColor'
            strokeWidth='2'
          />
          <path
            d='M10 6.5C9.5 5.5 8.5 5 7.2 5C5.4 5 4 6.8 4 9C4 11.2 5.4 13 7.2 13C8.5 13 9.5 12.5 10 11.5'
            stroke='currentColor'
            strokeWidth='1.9'
            strokeLinecap='round'
          />
          <path
            d='M19 6.5C18.5 5.5 17.5 5 16.2 5C14.4 5 13 6.8 13 9C13 11.2 14.4 13 16.2 13C17.5 13 18.5 12.5 19 11.5'
            stroke='currentColor'
            strokeWidth='1.9'
            strokeLinecap='round'
          />
        </svg>

        {isSubtitlesEnabled && (
          <div
            style={{
              position: 'absolute',
              bottom: isFullscreen ? '4px' : '3px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: isFullscreen ? '18px' : '14px',
              height: '2.5px',
              borderRadius: '2px',
              backgroundColor: '#ef4444',
              boxShadow: '0 0 6px rgba(239, 68, 68, 0.65)',
            }}
          />
        )}
      </button>
    </div>
  );
};

export default SubtitlesButton;
