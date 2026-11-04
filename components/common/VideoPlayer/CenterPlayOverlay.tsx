'use client';

import { type FC, type MouseEvent, useEffect, useState } from 'react';

import { CenterPlayOverlayProps } from './types';
import { useVideoPlayer } from './useVideoPlayer';

export const CenterPlayOverlay: FC<CenterPlayOverlayProps> = ({
  className = '',
  style = {},
}) => {
  const {
    isPlaying,
    isEnded: contextIsEnded,
    togglePlay,
    replay,
    currentTime,
    duration,
  } = useVideoPlayer();
  const [isHovered, setIsHovered] = useState(false);
  const [prevPlaying, setPrevPlaying] = useState(isPlaying);
  const [showPauseFlash, setShowPauseFlash] = useState(false);

  if (prevPlaying !== isPlaying) {
    setPrevPlaying(isPlaying);
    setShowPauseFlash(!prevPlaying && isPlaying);
  }

  useEffect(() => {
    if (!showPauseFlash) return;
    const timer = setTimeout(() => {
      setShowPauseFlash(false);
    }, 750);
    return () => {
      clearTimeout(timer);
    };
  }, [showPauseFlash]);

  const threshold = duration > 0 ? Math.max(0.5, duration - 0.5) : 0;
  const isAtEnd = Boolean(
    contextIsEnded || (duration > 0 && currentTime >= threshold)
  );

  const isVisible = !isPlaying || showPauseFlash || isAtEnd;
  const showPauseIcon = (showPauseFlash || isPlaying) && !isAtEnd;

  // Figma "play / pause": 24×24 on phones, 40×40 on tablet and desktop (set
  // with classes on the button). Icons scale with the circle.
  const iconClassName = 'block size-[60%]';

  let ariaLabel = 'Play Video';
  if (showPauseIcon) {
    ariaLabel = 'Pause Video';
  } else if (isAtEnd) {
    ariaLabel = 'Replay Video';
  }

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.currentTarget.blur();
    if (isAtEnd) {
      replay();
    } else {
      togglePlay();
    }
  };

  const renderIcon = () => {
    if (showPauseIcon) {
      return (
        <svg
          viewBox='0 0 20 20'
          fill='none'
          style={{
            width: '20px',
            height: '20px',
            display: 'block',
          }}
          className='block size-5'
          aria-hidden
        >
          <path
            d='M3.5 3C3.5 2.44772 3.94772 2 4.5 2H7.3C7.85229 2 8.3 2.44772 8.3 3V17C8.3 17.5523 7.85228 18 7.3 18H4.5C3.94771 18 3.5 17.5523 3.5 17V3ZM11.5 3C11.5 2.44772 11.9477 2 12.5 2H15.3C15.8523 2 16.3 2.44772 16.3 3V17C16.3 17.5523 15.8523 18 15.3 18H12.5C11.9477 18 11.5 17.5523 11.5 17V3Z'
            fill='#E6E1F6'
          />
        </svg>
      );
    }
    if (isAtEnd) {
      return (
        <svg
          viewBox='0 0 24 24'
          fill='#E6E1F6'
          style={{ width: '60%', height: '60%', display: 'block' }}
          className={iconClassName}
        >
          <path d='M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z' />
        </svg>
      );
    }
    // Figma's play triangle, drawn on the same 24×24 grid as the circle so it
    // keeps the design's size and offset at 24px and 40px alike.
    return (
      <svg
        viewBox='0 0 24 24'
        fill='#E6E1F6'
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          top: 0,
          left: 0,
          pointerEvents: 'none',
        }}
        className='pointer-events-none absolute -inset-px block size-[calc(100%+2px)]'
      >
        <path d='M17.5 11.134C18.1667 11.5189 18.1667 12.4811 17.5 12.866L10 17.1962C9.33333 17.5811 8.5 17.0999 8.5 16.3301V7.66987C8.5 6.90007 9.33333 6.41895 10 6.80385L17.5 11.134Z' />
      </svg>
    );
  };

  return (
    <div
      aria-hidden={!isVisible}
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: `translate(-50%, -50%) scale(${isVisible ? 1 : 1.18})`,
        transformOrigin: 'center center',
        backgroundColor: 'transparent',
        zIndex: 10,
        opacity: isVisible ? 1 : 0,
        pointerEvents: (!isPlaying || isAtEnd) && isVisible ? 'auto' : 'none',
        transition:
          'opacity 0.28s cubic-bezier(0.4, 0, 0.2, 1), transform 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style,
      }}
    >
      <button
        type='button'
        tabIndex={isVisible ? 0 : -1}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label={ariaLabel}
        className='group relative size-6 cursor-pointer outline-none select-none md:size-10'
        style={{
          width: '40px',
          height: '40px',
          minWidth: '40px',
          minHeight: '40px',
          borderRadius: '50%',
          // Figma "play / pause" (Web): #010874 at 50% (solid on hover), a
          // 1px #010874 5% → #020FDA 20% gradient border, 4px background blur.
          border: '1px solid transparent',
          background: `linear-gradient(${
            isHovered ? '#010874' : 'rgba(1, 8, 116, 0.5)'
          }, ${
            isHovered ? '#010874' : 'rgba(1, 8, 116, 0.5)'
          }) padding-box, linear-gradient(180deg, rgba(1, 8, 116, 0.05), rgba(2, 15, 218, 0.2)) border-box`,
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: '#E6E1F6',
          transform: isHovered ? 'scale(1.08)' : 'scale(1)',
          transition:
            'transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.18s ease',
        }}
      >
        {renderIcon()}
      </button>
    </div>
  );
};

export default CenterPlayOverlay;
