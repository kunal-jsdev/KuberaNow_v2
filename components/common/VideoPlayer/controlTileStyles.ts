import type { CSSProperties } from 'react';

/**
 * Figma "Full Video Assets" (Web / Mobile). Every control is a navy tile:
 * #010874 at 50% (70% on hover or while open), 1px #010874 5% inside stroke,
 * 2px background blur, 4px radius, 4px × 6px padding.
 * - Web: 30px tall, 20px icon slot → a single icon is 32 × 30.
 * - Mobile (phones): 24px tall, 12px icon slot → 24 × 24.
 */

export const ICON_DIR = '/assets/videos/controls';

export const CONTROL_TEXT_COLOR = '#E6E1F6';
export const CONTROL_ACCENT = '#00FFEE';

type IconSpec = { src: string; width: number; height: number; slot: number };
export type ControlIconPair = { web: IconSpec; mobile: IconSpec };

/** `{name}-web.svg` / `{name}-mobile.svg`, or explicit file names. */
const pair = (
  name: string | { web: string; mobile: string },
  web: [number, number],
  mobile: [number, number],
  slots: [number, number] = [20, 12]
): ControlIconPair => {
  const files =
    typeof name === 'string'
      ? { web: `${name}-web`, mobile: `${name}-mobile` }
      : name;
  return {
    web: {
      src: `${ICON_DIR}/${files.web}.svg`,
      width: web[0],
      height: web[1],
      slot: slots[0],
    },
    mobile: {
      src: `${ICON_DIR}/${files.mobile}.svg`,
      width: mobile[0],
      height: mobile[1],
      slot: slots[1],
    },
  };
};

// Sizes are each asset's own artwork size, centred in the Figma icon slot.
export const CONTROL_ICONS = {
  audio: pair('audio', [17.8083, 16], [12.0156, 12]),
  speed: pair('speed', [16, 16], [12, 12]),
  speedOpen: pair(
    { web: 'speed-web', mobile: 'speed-mobile-open' },
    [16, 16],
    [12, 12]
  ),
  share: pair('share', [20, 20], [12, 12]),
  shareOpen: pair(
    { web: 'share-web-open', mobile: 'share-mobile-open' },
    [20, 20],
    [12, 12]
  ),
  pause: pair('pause', [20, 20], [12, 12]),
  play: pair('play', [20, 20], [12, 12]),
  fullscreen: pair('fullscreen', [15.2014, 15.2], [9.40084, 9.4]),
  exitFullscreen: pair('exit-fullscreen', [15.2014, 15.2], [9.40084, 9.4]),
  copy: pair('copy', [16, 16], [10, 10], [16, 10]),
  nativeShare: pair('native-share', [16, 16], [10, 10], [16, 10]),
  whatsapp: pair('whatsapp', [12, 11.9603], [9, 8.97024], [16, 12]),
  minus: pair('minus', [10, 10], [8, 8], [10, 8]),
  plus: pair('plus', [10, 10], [8, 8], [10, 8]),
} satisfies Record<string, ControlIconPair>;

/** Icon slot size for hand-drawn icons that have no Figma asset (mute, replay). */
export const getIconSlot = (isPhone: boolean) => (isPhone ? 12 : 20);

type TileOptions = {
  isPhone: boolean;
  /** Hovered, pressed or open: Figma "On Hover/Click" fill. */
  isActive?: boolean;
  /** Shorts stack their menus downwards instead of sideways. */
  isVertical?: boolean;
};

export const getTileStyle = ({
  isPhone,
  isActive = false,
  isVertical = false,
}: TileOptions): CSSProperties => {
  const height = isPhone ? 24 : 30;
  return {
    position: 'relative',
    display: 'inline-flex',
    flexDirection: isVertical ? 'column' : 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    boxSizing: 'border-box',
    ...(isVertical
      ? {
          width: `${height + (isPhone ? 0 : 2)}px`,
          minHeight: `${height}px`,
          padding: isActive ? '6px 0' : '0',
        }
      : { height: `${height}px`, padding: '4px 6px' }),
    borderRadius: '4px',
    background: isActive ? 'rgba(1, 8, 116, 0.7)' : 'rgba(1, 8, 116, 0.5)',
    // Inside stroke, as in Figma, so it doesn't add to the tile's size.
    boxShadow: 'inset 0 0 0 1px rgba(1, 8, 116, 0.05)',
    backdropFilter: 'blur(2px)',
    WebkitBackdropFilter: 'blur(2px)',
    border: 'none',
    color: CONTROL_TEXT_COLOR,
    whiteSpace: 'nowrap',
    userSelect: 'none',
    outline: 'none',
    flexShrink: 0,
    transition: 'background 0.18s ease',
  };
};

/**
 * Padding for the icon button that opens a control's options. It carries the
 * tile's padding, minus the side facing the options once open (the tile's
 * 8px gap then spaces icon, divider and options as in Figma).
 */
export const getTriggerPadding = (isOpen: boolean, isVertical: boolean) => {
  if (isVertical) return isOpen ? '6px 0 0' : '0';
  return isOpen ? '4px 0 4px 6px' : '4px 6px';
};

/** Web: Noto Sans H9 (12/16 semibold). Mobile: Noto Sans H10 (10/14 bold). */
export const getControlTextStyle = (isPhone: boolean): CSSProperties => ({
  fontFamily: 'var(--font-noto-sans), sans-serif',
  fontSize: isPhone ? '10px' : '12px',
  lineHeight: isPhone ? '14px' : '16px',
  fontWeight: isPhone ? 700 : 600,
  fontVariantNumeric: 'tabular-nums',
});
