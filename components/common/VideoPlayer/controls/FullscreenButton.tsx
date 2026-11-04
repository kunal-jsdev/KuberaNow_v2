'use client';

import { type FC, useState } from 'react';

import { ControlIcon } from '../controlTile';
import { CONTROL_ICONS, getTileStyle } from '../controlTileStyles';
import { FullscreenButtonProps } from '../types';
import { useVideoPlayer } from '../useVideoPlayer';

export const FullscreenButton: FC<FullscreenButtonProps> = ({
  className = '',
  style = {},
}) => {
  const { isFullscreen, isPhoneControls, toggleFullscreen } = useVideoPlayer();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      type='button'
      onClick={toggleFullscreen}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label={isFullscreen ? 'Exit fullscreen (f)' : 'Enter fullscreen (f)'}
      title={isFullscreen ? 'Exit Fullscreen (f)' : 'Fullscreen (f)'}
      className={`group cursor-pointer ${className}`}
      style={{
        ...getTileStyle({ isPhone: isPhoneControls, isActive: isHovered }),
        ...style,
      }}
    >
      {/* Figma "Full Screen" / "Small Screen" */}
      <ControlIcon
        icon={
          isFullscreen ? CONTROL_ICONS.exitFullscreen : CONTROL_ICONS.fullscreen
        }
        isPhone={isPhoneControls}
        flip
      />
    </button>
  );
};

export default FullscreenButton;
