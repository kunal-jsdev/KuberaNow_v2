'use client';

import { type FC } from 'react';

import { TopControlsBarProps } from '../types';
import { useVideoPlayer } from '../useVideoPlayer';

export const TopControlsBar: FC<TopControlsBarProps> = ({
  children,
  className = '',
  style = {},
}) => {
  const { isControlsVisible, isFullscreen, isPhoneControls } = useVideoPlayer();

  // Phone: inset to match the bottom bar (7px top, 8px side).
  let padding = isFullscreen ? '16px 20px' : '10px 12px';
  if (isPhoneControls) padding = '7px 8px';

  const isVisible = isControlsVisible;

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className={`absolute top-0 right-0 left-0 z-25 flex items-center justify-end ${className}`}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        padding,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        zIndex: 25,
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(-120%)',
        pointerEvents: isVisible ? 'auto' : 'none',
        transition: isVisible
          ? 'transform 0.34s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease-out'
          : 'transform 0.28s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.22s ease-in',
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export default TopControlsBar;
