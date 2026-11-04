'use client';

import { type FC } from 'react';

import { VideoControlsBarProps } from '../types';
import { useVideoPlayer } from '../useVideoPlayer';

export const VideoControlsBar: FC<VideoControlsBarProps> = ({
  children,
  className = '',
  style = {},
}) => {
  const { isControlsVisible, isFullscreen, isPhoneControls, activeMenu } =
    useVideoPlayer();

  // Phone: 7px top, 8px sides, 6px bottom; 6px between seek bar and buttons.
  let padding = isFullscreen ? '12px 22px 20px 22px' : '8px 12px 16px 12px';
  let gap = isFullscreen ? '7px' : '5px';
  if (isPhoneControls) {
    padding = '7px 8px 6px 8px';
    gap = '6px';
  }

  // Stay up while a speed or share menu is open so it can't vanish mid-choice.
  const isVisible = isControlsVisible || activeMenu !== null;

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className={`absolute right-0 bottom-0 left-0 z-20 flex flex-col transition-all duration-300 ease-in-out ${
        isVisible
          ? 'pointer-events-auto translate-y-0 opacity-100'
          : 'pointer-events-none translate-y-1.5 opacity-0'
      } ${className}`}
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        background:
          'linear-gradient(to top, rgba(0, 0, 0, 0.48) 0%, rgba(0, 0, 0, 0.15) 60%, transparent 100%)',
        padding,
        display: 'flex',
        flexDirection: 'column',
        gap,
        zIndex: 20,
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(4px)',
        pointerEvents: isVisible ? 'auto' : 'none',
        transition:
          'opacity 0.24s cubic-bezier(0.4, 0, 0.2, 1), transform 0.24s cubic-bezier(0.4, 0, 0.2, 1)',
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export default VideoControlsBar;
