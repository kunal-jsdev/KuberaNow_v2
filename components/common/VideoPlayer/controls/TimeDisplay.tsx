'use client';

import { type FC } from 'react';

import { getControlTextStyle, getTileStyle } from '../controlTileStyles';
import { TimeDisplayProps } from '../types';
import { useVideoPlayer } from '../useVideoPlayer';

function formatTime(seconds: number, forceHours: boolean = false): string {
  if (isNaN(seconds) || seconds < 0 || !Number.isFinite(seconds)) {
    return forceHours ? '0:00:00' : '0:00';
  }
  const totalSecs = Math.floor(seconds);
  const hours = Math.floor(totalSecs / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;

  if (hours > 0 || forceHours) {
    const paddedMins = mins < 10 ? `0${mins}` : `${mins}`;
    const paddedSecs = secs < 10 ? `0${secs}` : `${secs}`;
    return `${hours}:${paddedMins}:${paddedSecs}`;
  }
  const paddedSecs = secs < 10 ? `0${secs}` : `${secs}`;
  return `${mins}:${paddedSecs}`;
}

export const TimeDisplay: FC<TimeDisplayProps> = ({
  className = '',
  style = {},
  format = 'both',
}) => {
  const { currentTime, duration, isPhoneControls } = useVideoPlayer();

  const hasHours = duration >= 3600 || currentTime >= 3600;

  let displayText = '';
  if (format === 'current') {
    displayText = formatTime(currentTime, hasHours);
  } else if (format === 'remaining') {
    const remaining = Math.max(0, duration - currentTime);
    displayText = `-${formatTime(remaining, hasHours)}`;
  } else {
    displayText = `${formatTime(currentTime, hasHours)} / ${formatTime(duration, hasHours)}`;
  }

  // Figma "Duration": a tile that hugs the text.
  return (
    <div
      aria-label={`Current playback time: ${displayText}`}
      className={className}
      style={{
        ...getTileStyle({ isPhone: isPhoneControls }),
        ...getControlTextStyle(isPhoneControls),
        cursor: 'default',
        ...style,
      }}
    >
      <span>{displayText}</span>
    </div>
  );
};

export default TimeDisplay;
