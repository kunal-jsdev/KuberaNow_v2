'use client';

import {
  type FC,
  type MouseEvent as ReactMouseEvent,
  useEffect,
  useRef,
  useState,
} from 'react';

import { ControlDivider, ControlIcon } from '../controlTile';
import {
  CONTROL_ACCENT,
  CONTROL_ICONS,
  CONTROL_TEXT_COLOR,
  getControlTextStyle,
  getTileStyle,
  getTriggerPadding,
} from '../controlTileStyles';
import { PlaybackSpeedMenuProps } from '../types';
import { useVideoPlayer } from '../useVideoPlayer';

const formatSpeedLabel = (spd: number) => {
  if (spd === 1) return '1.0X';
  if (spd === 1.5) return '1.50X';
  if (spd === 2) return '2.0X';
  return `${spd}X`;
};

/**
 * Figma "Speed": the speed icon in a tile; open, the tile turns 70% navy and
 * shows a divider and the speeds — the current one in #00FFEE, underlined.
 */
export const PlaybackSpeedMenu: FC<PlaybackSpeedMenuProps> = ({
  className = '',
  style = {},
  speeds = [1, 1.25, 1.5, 2],
}) => {
  const {
    playbackSpeed,
    setPlaybackSpeed,
    isVertical,
    activeMenu,
    openMenu,
    closeMenu,
    isPhoneControls,
  } = useVideoPlayer();

  const isOpen = activeMenu === 'speed';
  const [isMainHovered, setIsMainHovered] = useState(false);
  const [hoveredSpeed, setHoveredSpeed] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

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

  // Always show the options so the viewer picks a speed, in every mode
  // (clicking again closes them; openMenu toggles).
  const toggleOpen = (e: ReactMouseEvent) => {
    e.stopPropagation();
    openMenu('speed');
  };

  const handleSelect = (spd: number, e: ReactMouseEvent) => {
    e.stopPropagation();
    setPlaybackSpeed(spd);
    closeMenu();
  };

  const textStyle = getControlTextStyle(isPhoneControls);

  return (
    <div
      ref={containerRef}
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
        onClick={toggleOpen}
        onMouseEnter={() => setIsMainHovered(true)}
        onMouseLeave={() => setIsMainHovered(false)}
        aria-label={isOpen ? 'Close speed options' : 'Playback speed'}
        aria-expanded={isOpen}
        title={`Speed (${formatSpeedLabel(playbackSpeed)})`}
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
        <ControlIcon
          icon={isOpen ? CONTROL_ICONS.speedOpen : CONTROL_ICONS.speed}
          isPhone={isPhoneControls}
        />
      </button>

      {isOpen && (
        <>
          <ControlDivider
            isPhone={isPhoneControls}
            isVertical={isVertical}
          />
          <div
            role='menu'
            aria-label='Playback speed'
            style={{
              display: 'inline-flex',
              flexDirection: isVertical ? 'column' : 'row',
              alignItems: 'center',
              gap: '4px',
              paddingRight: isVertical ? 0 : '6px',
            }}
          >
            {speeds.map((spd) => {
              const isSelected = playbackSpeed === spd;
              const isHoveredItem = hoveredSpeed === spd;

              return (
                <button
                  key={spd}
                  type='button'
                  role='menuitemradio'
                  aria-checked={isSelected}
                  onClick={(e) => handleSelect(spd, e)}
                  onMouseEnter={() => setHoveredSpeed(spd)}
                  onMouseLeave={() => setHoveredSpeed(null)}
                  aria-label={`Set speed to ${formatSpeedLabel(spd)}`}
                  title={`Set speed to ${formatSpeedLabel(spd)}`}
                  className='cursor-pointer'
                  style={{
                    ...textStyle,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: isPhoneControls ? '0 2px' : '2px',
                    borderRadius: '2px',
                    border: 'none',
                    // Selected: navy chip with a cyan underline (Figma).
                    borderBottom: `1px solid ${
                      isSelected ? CONTROL_ACCENT : 'transparent'
                    }`,
                    background:
                      isSelected || isHoveredItem
                        ? 'rgba(1, 8, 116, 0.7)'
                        : 'transparent',
                    color:
                      isSelected || isHoveredItem
                        ? CONTROL_ACCENT
                        : CONTROL_TEXT_COLOR,
                    outline: 'none',
                    transition: 'color 0.15s ease, background 0.15s ease',
                  }}
                >
                  {formatSpeedLabel(spd)}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default PlaybackSpeedMenu;
