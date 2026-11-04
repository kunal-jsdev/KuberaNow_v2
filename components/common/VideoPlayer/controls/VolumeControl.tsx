'use client';

import {
  type ChangeEvent,
  type CSSProperties,
  type FC,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import { ControlDivider, ControlIcon } from '../controlTile';
import {
  CONTROL_ACCENT,
  CONTROL_ICONS,
  CONTROL_TEXT_COLOR,
  getIconSlot,
  getTileStyle,
  getTriggerPadding,
} from '../controlTileStyles';
import { VolumeControlProps } from '../types';
import { useVideoPlayer } from '../useVideoPlayer';

const TRACK_BACKGROUND = 'rgba(255, 255, 255, 0.2)';

/** Muted speaker (no Figma asset): the speaker with a cross, in the controls' colour. */
function MutedIcon({ isPhone }: { isPhone: boolean }) {
  const slot = getIconSlot(isPhone);
  return (
    <svg
      width={slot}
      height={slot}
      viewBox='0 0 24 24'
      fill='none'
      stroke={CONTROL_TEXT_COLOR}
      strokeWidth='2.2'
      strokeLinecap='round'
      strokeLinejoin='round'
      aria-hidden
    >
      <polygon
        points='11 5 6 9 2 9 2 15 6 15 11 19 11 5'
        fill={CONTROL_TEXT_COLOR}
        stroke='none'
      />
      <line
        x1='22'
        y1='9'
        x2='16'
        y2='15'
      />
      <line
        x1='16'
        y1='9'
        x2='22'
        y2='15'
      />
    </svg>
  );
}

/**
 * Figma "Audio": the speaker in a tile. Hover (or a first tap) opens the
 * slider — divider, minus, a cyan level bar, plus; a click mutes/unmutes.
 */
export const VolumeControl: FC<VolumeControlProps> = ({
  className = '',
  style = {},
}) => {
  const {
    volume,
    isMuted,
    setVolume,
    toggleMute,
    isVertical,
    activeMenu,
    openMenu,
    closeMenu,
    isPhoneControls,
    isCompactControls,
  } = useVideoPlayer();

  const isOpen = activeMenu === 'volume';
  const [isMainHovered, setIsMainHovered] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        closeMenu();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeMenu();
      }
    };

    document.addEventListener('click', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, closeMenu]);

  // Hover opens the slider; leaving closes it after a short grace period so
  // moving between the icon and the slider doesn't flicker it shut.
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isHoveringRef = useRef(false);
  const lastPointerTypeRef = useRef<string>('mouse');

  const cancelClose = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  useEffect(() => cancelClose, []);

  const handlePointerEnter = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse') return;
    isHoveringRef.current = true;
    cancelClose();
    // openMenu toggles, so only ask when it isn't open already.
    if (!isOpen) openMenu('volume');
  };

  const handlePointerLeave = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse') return;
    isHoveringRef.current = false;

    // Mid-drag the pointer can wander off the slider; keep it open until
    // release, then close only if the pointer ended up outside.
    if (e.buttons !== 0) {
      window.addEventListener(
        'pointerup',
        () => {
          if (!isHoveringRef.current) closeMenu();
        },
        { once: true }
      );
      return;
    }

    cancelClose();
    closeTimerRef.current = setTimeout(() => {
      if (!isHoveringRef.current) closeMenu();
    }, 250);
  };

  // Clicking the speaker always mutes/unmutes. Touch screens have no hover,
  // so there the first tap opens the slider instead.
  const toggleOpen = (e: ReactMouseEvent) => {
    e.stopPropagation();
    if (lastPointerTypeRef.current !== 'mouse' && !isOpen) {
      openMenu('volume');
      return;
    }
    toggleMute();
  };

  const currentLevel = isMuted ? 0 : volume;

  const handleDecrease = (e: ReactMouseEvent) => {
    e.stopPropagation();
    const next = Math.max(0, Math.round((currentLevel - 0.1) * 10) / 10);
    setVolume(next);
  };

  const handleIncrease = (e: ReactMouseEvent) => {
    e.stopPropagation();
    const next = Math.min(1, Math.round((currentLevel + 0.1) * 10) / 10);
    setVolume(next);
  };

  const handleSliderChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
  };

  const updateFromClientY = useCallback(
    (clientY: number) => {
      const track = trackRef.current;
      if (!track) return;
      const rect = track.getBoundingClientRect();
      const rawPct = (rect.bottom - clientY) / rect.height;
      let pct = Math.max(0, Math.min(1, rawPct));
      if (pct <= 0.05) {
        pct = 0;
      } else if (pct >= 0.95) {
        pct = 1;
      }
      const val = Math.round(pct * 100) / 100;
      setVolume(val);
    },
    [setVolume]
  );

  const handleVerticalPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.preventDefault();
    setIsDragging(true);
    updateFromClientY(e.clientY);

    const onPointerMove = (moveEv: PointerEvent) => {
      moveEv.preventDefault();
      updateFromClientY(moveEv.clientY);
    };

    const onPointerUp = (upEv: PointerEvent) => {
      upEv.preventDefault();
      setIsDragging(false);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
  };

  // A click mutes/unmutes (the slider opens on hover), so label that.
  const isSilent = isMuted || volume === 0;
  const ariaLabel = isSilent ? 'Unmute video' : 'Mute video';
  const buttonTitle = isSilent ? 'Unmute (m)' : 'Mute (m)';

  const renderVolumeIcon = () =>
    isSilent ? (
      <MutedIcon isPhone={isPhoneControls} />
    ) : (
      <ControlIcon
        icon={CONTROL_ICONS.audio}
        isPhone={isPhoneControls}
      />
    );

  const stepButtonStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    outline: 'none',
    flexShrink: 0,
  };

  // Phones and tablets: volume is the device's own buttons, so no slider.
  // The one exception is a muted video (e.g. autoplay was only allowed
  // without sound) — device buttons can't unmute a page, so offer a tap.
  if (isCompactControls) {
    if (!isSilent) return null;

    return (
      <button
        type='button'
        onClick={(e) => {
          e.stopPropagation();
          if (isMuted) toggleMute();
          else setVolume(0.5);
        }}
        aria-label='Unmute video'
        title='Unmute'
        className={`cursor-pointer ${className}`}
        style={{
          ...getTileStyle({ isPhone: isPhoneControls, isVertical }),
          ...style,
        }}
      >
        {renderVolumeIcon()}
      </button>
    );
  }

  // Figma (Web): a 70 × 6 bar between 10px minus/plus icons.
  const sliderLength = isPhoneControls ? 60 : 70;
  const sliderThickness = isPhoneControls ? 4 : 6;

  return (
    <div
      ref={containerRef}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      className={className}
      style={{
        ...getTileStyle({
          isPhone: isPhoneControls,
          isActive: isOpen || isMainHovered,
          isVertical,
        }),
        // The trigger button carries the icon's padding.
        padding: isVertical && isOpen ? '0 0 6px' : 0,
        ...style,
      }}
    >
      <button
        type='button'
        onPointerDown={(e) => {
          lastPointerTypeRef.current = e.pointerType;
        }}
        onClick={toggleOpen}
        onMouseEnter={() => setIsMainHovered(true)}
        onMouseLeave={() => setIsMainHovered(false)}
        aria-label={ariaLabel}
        title={buttonTitle}
        className='cursor-pointer'
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          alignSelf: 'stretch',
          padding: getTriggerPadding(isOpen, isVertical),
          background: 'transparent',
          border: 'none',
          outline: 'none',
        }}
      >
        {renderVolumeIcon()}
      </button>

      {isOpen && (
        <>
          <ControlDivider
            isPhone={isPhoneControls}
            isVertical={isVertical}
          />

          {isVertical ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <button
                type='button'
                onClick={handleIncrease}
                aria-label='Increase volume'
                title='Increase volume'
                style={stepButtonStyle}
              >
                <ControlIcon
                  icon={CONTROL_ICONS.plus}
                  isPhone={isPhoneControls}
                />
              </button>

              <div
                ref={trackRef}
                onPointerDown={handleVerticalPointerDown}
                role='slider'
                aria-label='Volume level'
                aria-valuemin={0}
                aria-valuemax={1}
                aria-valuenow={currentLevel}
                style={{
                  position: 'relative',
                  width: '20px',
                  height: `${sliderLength}px`,
                  display: 'flex',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  touchAction: 'none',
                  userSelect: 'none',
                }}
              >
                <div
                  style={{
                    position: 'relative',
                    width: `${sliderThickness}px`,
                    height: '100%',
                    background: TRACK_BACKGROUND,
                    borderRadius: '9999px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: `${Math.round(currentLevel * 100)}%`,
                      background: CONTROL_ACCENT,
                      borderRadius: '9999px',
                      transition: isDragging ? 'none' : 'height 0.08s ease-out',
                    }}
                  />
                </div>
              </div>

              <button
                type='button'
                onClick={handleDecrease}
                aria-label='Decrease volume'
                title='Decrease volume'
                style={stepButtonStyle}
              >
                <ControlIcon
                  icon={CONTROL_ICONS.minus}
                  isPhone={isPhoneControls}
                />
              </button>
            </div>
          ) : (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                paddingRight: '6px',
              }}
            >
              <button
                type='button'
                onClick={handleDecrease}
                aria-label='Decrease volume'
                title='Decrease volume'
                style={stepButtonStyle}
              >
                <ControlIcon
                  icon={CONTROL_ICONS.minus}
                  isPhone={isPhoneControls}
                />
              </button>

              <div
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  width: `${sliderLength}px`,
                  height: `${sliderThickness}px`,
                  background: TRACK_BACKGROUND,
                  borderRadius: '9999px',
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    width: `${Math.round(currentLevel * 100)}%`,
                    height: '100%',
                    background: CONTROL_ACCENT,
                    borderRadius: '9999px',
                    transition: 'width 0.08s ease-out',
                  }}
                />
                <input
                  type='range'
                  min='0'
                  max='1'
                  step='0.02'
                  value={currentLevel}
                  onChange={handleSliderChange}
                  aria-label='Volume level'
                  style={{
                    position: 'absolute',
                    inset: '-8px 0',
                    width: '100%',
                    height: 'calc(100% + 16px)',
                    opacity: 0,
                    cursor: 'pointer',
                    margin: 0,
                    zIndex: 2,
                  }}
                />
              </div>

              <button
                type='button'
                onClick={handleIncrease}
                aria-label='Increase volume'
                title='Increase volume'
                style={stepButtonStyle}
              >
                <ControlIcon
                  icon={CONTROL_ICONS.plus}
                  isPhone={isPhoneControls}
                />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default VolumeControl;
