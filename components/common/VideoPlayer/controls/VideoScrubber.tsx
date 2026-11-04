'use client';

import {
  type FC,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useRef,
  useState,
} from 'react';

import { glassPopoverStyle } from '../glassStyles';
import { VideoScrubberProps } from '../types';
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

// The unplayed track is a solid grey gradient (light grey on top, darker
// below), so it stays visible on any frame — dark, white or cyan alike.
const TRACK_BACKGROUND =
  'linear-gradient(180deg, rgba(209, 213, 219, 0.95) 0%, rgba(107, 114, 128, 0.95) 100%)';
const TRACK_SHADOW = '0 1px 2px rgba(0, 0, 0, 0.35)';
// Band of grey around the bar (transparent → grey at the bar → transparent).
const TRACK_HALO =
  'linear-gradient(180deg, rgba(75, 85, 99, 0) 0%, rgba(75, 85, 99, 0.55) 50%, rgba(75, 85, 99, 0) 100%)';

const EASE_OUT = 'cubic-bezier(0.25, 1, 0.5, 1)';
const EASE_SPRING = 'cubic-bezier(0.34, 1.56, 0.64, 1)';

const BUBBLE_BORDER = '1px solid rgba(0, 255, 238, 0.55)';

export const VideoScrubber: FC<VideoScrubberProps> = ({
  className = '',
  style = {},
  accentColor = '#00FFEE',
}) => {
  const {
    currentTime,
    duration,
    bufferedPercent,
    isScrubbing,
    setIsScrubbing,
    setCurrentTime,
    seek,
    hoverTime,
    hoverPercent,
    setHoverInfo,
    isFullscreen,
    isVertical,
    isPhoneControls,
  } = useVideoPlayer();

  const scrubberRef = useRef<HTMLDivElement | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  const calculateScrubTime = useCallback(
    (clientX: number) => {
      const scrubber = scrubberRef.current;
      if (!scrubber || !duration) return 0;
      const rect = scrubber.getBoundingClientRect();
      const pos = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      return pos * duration;
    },
    [duration]
  );

  const handlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsScrubbing(true);

    const newTime = calculateScrubTime(e.clientX);
    setCurrentTime(newTime);

    const onPointerMove = (moveEvent: PointerEvent) => {
      const scrubTime = calculateScrubTime(moveEvent.clientX);
      setCurrentTime(scrubTime);
    };

    const onPointerUp = (upEvent: PointerEvent) => {
      const finalTime = calculateScrubTime(upEvent.clientX);
      seek(finalTime);
      setIsScrubbing(false);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  const handleMouseMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    const scrubber = scrubberRef.current;
    if (!scrubber || !duration) return;
    const rect = scrubber.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setHoverInfo(pos * duration, pos * 100);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setHoverInfo(null, null);
  };

  const currentPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const isInteracting = isHovered || isScrubbing;
  const radius = isVertical ? '0px' : '9999px';

  // The bar thickens under the pointer (and while dragging) so it feels
  // grabbable, then settles back to a slim line.
  let trackHeight = isInteracting ? '6px' : '4px';
  if (isVertical) {
    trackHeight = isInteracting ? '6px' : '3px';
  }

  // The grey band around it grows with the bar.
  let haloHeight = isInteracting ? '20px' : '16px';
  if (isVertical) {
    haloHeight = isInteracting ? '16px' : '12px';
  }

  let containerHeight = isFullscreen ? '22px' : '20px';
  if (isVertical) {
    containerHeight = isInteracting ? '20px' : '12px';
  }

  // Phone: a 6×6 handle (thin 1px ring) shown at its full size at rest.
  let thumbSize = isFullscreen ? 14 : 12;
  if (isPhoneControls) thumbSize = 6;

  // Horizontal: a small knob at rest that grows on hover and more on drag.
  // Shorts: hidden until the viewer touches the bar.
  let thumbScale = isPhoneControls ? 1 : 0.8;
  if (isScrubbing) {
    thumbScale = 1.25;
  } else if (isHovered) {
    thumbScale = 1.05;
  } else if (isVertical) {
    thumbScale = 0;
  }

  // The bubble follows the pointer; while dragging (mouse or touch) it shows
  // the time being dragged to instead.
  let bubbleTime: number | null = null;
  let bubblePercent: number | null = null;
  if (isScrubbing) {
    bubbleTime = currentTime;
    bubblePercent = currentPercent;
  } else if (hoverTime !== null && hoverPercent !== null) {
    bubbleTime = hoverTime;
    bubblePercent = hoverPercent;
  }

  const showHoverFill = isHovered && !isScrubbing && hoverPercent !== null;
  const glow = isInteracting
    ? '0 0 12px rgba(0, 255, 238, 0.6)'
    : '0 0 8px rgba(0, 255, 238, 0.4)';

  return (
    <div
      ref={scrubberRef}
      onPointerDown={handlePointerDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      role='slider'
      aria-label='Video Progress Scrubber'
      aria-valuemin={0}
      aria-valuemax={duration || 100}
      aria-valuenow={currentTime}
      aria-valuetext={`${formatTime(currentTime, (duration || 0) >= 3600 || currentTime >= 3600)} of ${formatTime(duration, (duration || 0) >= 3600 || currentTime >= 3600)}`}
      className={`group/scrubber ${className}`}
      style={{
        position: isVertical ? 'absolute' : 'relative',
        bottom: isVertical ? 0 : undefined,
        left: isVertical ? 0 : undefined,
        right: isVertical ? 0 : undefined,
        width: '100%',
        height: containerHeight,
        display: 'flex',
        alignItems: isVertical ? 'flex-end' : 'center',
        cursor: 'pointer',
        touchAction: 'none',
        userSelect: 'none',
        zIndex: isVertical ? 30 : undefined,
        transition: `height 0.2s ${EASE_OUT}`,
        ...style,
      }}
    >
      {/* Grey gradient band around the bar: strongest at the bar, fading out
          above and below, so the bar stands off any frame behind it. */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          ...(isVertical
            ? {
                bottom: `calc(${trackHeight} / 2)`,
                transform: 'translateY(50%)',
              }
            : { top: '50%', transform: 'translateY(-50%)' }),
          height: haloHeight,
          background: TRACK_HALO,
          pointerEvents: 'none',
          transition: `height 0.2s ${EASE_OUT}, bottom 0.2s ${EASE_OUT}`,
        }}
      />

      <div
        style={{
          position: 'relative',
          width: '100%',
          height: trackHeight,
          borderRadius: radius,
          background: TRACK_BACKGROUND,
          boxShadow: TRACK_SHADOW,
          overflow: 'visible',
          transition: `height 0.2s ${EASE_OUT}`,
        }}
      >
        {/* Buffered */}
        <div
          style={{
            position: 'absolute',
            inset: '0 auto 0 0',
            width: `${bufferedPercent}%`,
            borderRadius: radius,
            background: 'rgba(255, 255, 255, 0.3)',
            transition: 'width 0.3s ease-out',
          }}
        />

        {/* Hover preview: lights up the stretch up to the pointer */}
        <div
          style={{
            position: 'absolute',
            inset: '0 auto 0 0',
            width: `${showHoverFill ? hoverPercent : currentPercent}%`,
            borderRadius: radius,
            background: 'rgba(255, 255, 255, 0.55)',
            opacity: showHoverFill ? 1 : 0,
            transition: 'opacity 0.15s ease',
          }}
        />

        {/* Played: glossy cyan with a soft glow that brightens on hover */}
        <div
          style={{
            position: 'absolute',
            inset: '0 auto 0 0',
            width: `${currentPercent}%`,
            borderRadius: radius,
            background: `linear-gradient(90deg, rgba(0, 255, 238, 0.7) 0%, ${accentColor} 85%)`,
            boxShadow: `inset 0 1px 0 rgba(255, 255, 255, 0.5), ${glow}`,
            transition: isScrubbing
              ? 'box-shadow 0.2s ease'
              : `width 0.2s ${EASE_OUT}, box-shadow 0.2s ease`,
          }}
        />

        {/* Thumb: cyan knob with a white ring (so it still stands out on
            cyan frames); a halo opens up around it while dragging. */}
        <div
          style={{
            position: 'absolute',
            left: `${currentPercent}%`,
            top: '50%',
            width: `${thumbSize}px`,
            height: `${thumbSize}px`,
            transform: `translate(-50%, -50%) scale(${thumbScale})`,
            borderRadius: '50%',
            background: accentColor,
            border: `${isPhoneControls ? 1 : 2}px solid #ffffff`,
            // Phone: 6px including the ring; elsewhere the ring sits outside.
            boxSizing: isPhoneControls ? 'border-box' : 'content-box',
            boxShadow: isScrubbing
              ? '0 1px 4px rgba(0, 0, 0, 0.45), 0 0 0 6px rgba(0, 255, 238, 0.28)'
              : '0 1px 4px rgba(0, 0, 0, 0.45), 0 0 0 0 rgba(0, 255, 238, 0)',
            pointerEvents: 'none',
            transition: isScrubbing
              ? `transform 0.2s ${EASE_SPRING}, box-shadow 0.2s ease`
              : `left 0.2s ${EASE_OUT}, transform 0.2s ${EASE_SPRING}, box-shadow 0.2s ease`,
          }}
        />
      </div>

      {bubbleTime !== null && bubblePercent !== null && (
        <div
          style={{
            ...glassPopoverStyle,
            position: 'absolute',
            // Kept inside the bar so the bubble never clips at either end.
            left: `clamp(24px, ${bubblePercent}%, calc(100% - 24px))`,
            bottom: isFullscreen ? '28px' : '24px',
            transform: 'translateX(-50%)',
            padding: isFullscreen ? '4px 10px' : '3px 8px',
            fontSize: isFullscreen ? '13px' : '12px',
            lineHeight: isFullscreen ? '18px' : '16px',
            fontFamily: 'var(--font-noto-sans), sans-serif',
            fontWeight: 600,
            fontVariantNumeric: 'tabular-nums',
            color: '#ffffff',
            background: 'rgba(1, 8, 116, 0.88)',
            border: BUBBLE_BORDER,
            boxShadow:
              '0 4px 14px rgba(0, 0, 0, 0.35), 0 0 10px rgba(0, 255, 238, 0.25)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            borderRadius: '8px',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            zIndex: 35,
          }}
        >
          {formatTime(
            bubbleTime,
            (duration || 0) >= 3600 || bubbleTime >= 3600
          )}
          <span
            aria-hidden
            style={{
              position: 'absolute',
              left: '50%',
              bottom: '-4px',
              width: '7px',
              height: '7px',
              transform: 'translateX(-50%) rotate(45deg)',
              background: 'rgb(1, 8, 116)',
              borderRight: BUBBLE_BORDER,
              borderBottom: BUBBLE_BORDER,
            }}
          />
        </div>
      )}
    </div>
  );
};

export default VideoScrubber;
