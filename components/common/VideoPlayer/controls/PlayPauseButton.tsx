'use client';

import { type FC, type MouseEvent, useState } from 'react';

import { ControlIcon } from '../controlTile';
import {
  CONTROL_ICONS,
  CONTROL_TEXT_COLOR,
  getIconSlot,
  getTileStyle,
} from '../controlTileStyles';
import { PlayPauseButtonProps } from '../types';
import { useVideoPlayer } from '../useVideoPlayer';

export const PlayPauseButton: FC<PlayPauseButtonProps> = ({
  className = '',
  style = {},
  size,
}) => {
  const {
    isPlaying,
    isEnded: contextIsEnded,
    togglePlay,
    replay,
    currentTime,
    duration,
    isPhoneControls,
  } = useVideoPlayer();
  const [isHovered, setIsHovered] = useState(false);
  const threshold = duration > 0 ? Math.max(0.5, duration - 0.5) : 0;
  const isEnded = Boolean(
    contextIsEnded || (duration > 0 && currentTime >= threshold)
  );

  let ariaLabel = 'Play video (Space)';
  let buttonTitle = 'Play (Space)';
  if (isPlaying) {
    ariaLabel = 'Pause video (Space)';
    buttonTitle = 'Pause (Space)';
  } else if (isEnded) {
    ariaLabel = 'Replay video (Space)';
    buttonTitle = 'Replay (Space)';
  }

  const handleClick = (e: MouseEvent) => {
    e.stopPropagation();
    if (isEnded) {
      replay();
    } else {
      togglePlay();
    }
  };

  const renderIcon = () => {
    if (isPlaying) {
      return (
        <ControlIcon
          icon={CONTROL_ICONS.pause}
          isPhone={isPhoneControls}
        />
      );
    }
    if (isEnded) {
      // No replay asset in Figma: the old glyph, in the controls' colour.
      const slot = getIconSlot(isPhoneControls);
      return (
        <svg
          width={slot}
          height={slot}
          viewBox='0 0 24 24'
          fill={CONTROL_TEXT_COLOR}
          aria-hidden
        >
          <path d='M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z' />
        </svg>
      );
    }
    return (
      <ControlIcon
        icon={CONTROL_ICONS.play}
        isPhone={isPhoneControls}
      />
    );
  };

  return (
    <button
      type='button'
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label={ariaLabel}
      title={buttonTitle}
      className={`group cursor-pointer ${className}`}
      style={{
        ...getTileStyle({ isPhone: isPhoneControls, isActive: isHovered }),
        ...(size ? { width: `${size}px`, height: `${size}px` } : {}),
        ...style,
      }}
    >
      {renderIcon()}
    </button>
  );
};

export default PlayPauseButton;
