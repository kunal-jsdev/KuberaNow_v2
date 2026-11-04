import { CSSProperties } from 'react';

export const getGlassCapsuleStyle = (isFullscreen = false): CSSProperties => ({
  height: isFullscreen ? '42px' : '32px',
  borderRadius: '9999px',
  background: 'rgba(0, 0, 0, 0.52)',
  backdropFilter: 'blur(16px) saturate(180%)',
  WebkitBackdropFilter: 'blur(16px) saturate(180%)',
  border: 'none',
  boxShadow: isFullscreen
    ? '0 6px 18px rgba(0, 0, 0, 0.45)'
    : '0 4px 14px rgba(0, 0, 0, 0.35)',
  display: 'inline-flex',
  alignItems: 'center',
  padding: isFullscreen ? '0 10px' : '0 6px',
  gap: isFullscreen ? '4px' : '2px',
  userSelect: 'none',
  transition: 'height 0.2s ease, padding 0.2s ease, gap 0.2s ease',
});

export const glassCapsuleStyle: CSSProperties = getGlassCapsuleStyle(false);

export const getGlassButtonStyle = (isFullscreen = false): CSSProperties => ({
  width: isFullscreen ? '36px' : '28px',
  height: isFullscreen ? '36px' : '28px',
  minWidth: isFullscreen ? '36px' : '28px',
  borderRadius: '50%',
  background: 'transparent',
  border: 'none',
  boxShadow: 'none',
  color: '#ffffff',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  padding: 0,
  userSelect: 'none',
  outline: 'none',
  transition:
    'background 0.15s ease, transform 0.12s ease, width 0.2s ease, height 0.2s ease',
});

export const glassButtonStyle: CSSProperties = getGlassButtonStyle(false);

export const glassHoverProperties = {
  background: 'rgba(255, 255, 255, 0.18)',
  transform: 'scale(1.06)',
};

export const getGlassTimePillStyle = (isFullscreen = false): CSSProperties => ({
  background: 'transparent',
  border: 'none',
  boxShadow: 'none',
  height: isFullscreen ? '36px' : '28px',
  padding: isFullscreen ? '0 8px' : '0 6px',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  fontSize: isFullscreen ? '14px' : '12px',
  fontWeight: 600,
  letterSpacing: '0.02em',
  cursor: 'default',
  color: '#ffffff',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  userSelect: 'none',
  textShadow: '0 1px 2px rgba(0, 0, 0, 0.4)',
  transition: 'font-size 0.2s ease, height 0.2s ease, padding 0.2s ease',
});

export const glassTimePillStyle: CSSProperties = getGlassTimePillStyle(false);

/**
 * Square control size: 40px fullscreen, 32px inline, 24px on phones.
 * `isPhone` is the player's `isPhoneControls` (already false in fullscreen
 * and for shorts, which keep their sizes).
 */
export const getControlSize = (isFullscreen = false, isPhone = false) => {
  if (isPhone) return 24;
  return isFullscreen ? 40 : 32;
};

/** Corner radius that goes with getControlSize. */
export const getControlRadius = (isFullscreen = false, isPhone = false) => {
  if (isPhone) return '4px';
  return isFullscreen ? '10px' : '8px';
};

export const getGlassTileStyle = (
  isFullscreen = false,
  isPhone = false
): CSSProperties => ({
  width: `${getControlSize(isFullscreen, isPhone)}px`,
  height: `${getControlSize(isFullscreen, isPhone)}px`,
  minWidth: `${getControlSize(isFullscreen, isPhone)}px`,
  borderRadius: getControlRadius(isFullscreen, isPhone),
  background: 'rgba(0, 0, 0, 0.52)',
  backdropFilter: 'blur(16px) saturate(180%)',
  WebkitBackdropFilter: 'blur(16px) saturate(180%)',
  border: 'none',
  boxShadow: isFullscreen
    ? '0 6px 18px rgba(0, 0, 0, 0.45)'
    : '0 4px 14px rgba(0, 0, 0, 0.35)',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  padding: 0,
  userSelect: 'none',
  outline: 'none',
  color: '#ffffff',
  transition:
    'background 0.18s ease, box-shadow 0.18s ease, width 0.2s ease, height 0.2s ease',
});

const getTimeTileText = (isFullscreen: boolean, isPhone: boolean) => {
  // Phone: a 64×24 pill, 4px × 6px padding, 10px/16px text.
  if (isPhone) {
    return {
      minWidth: '64px',
      padding: '4px 6px',
      fontSize: '10px',
      lineHeight: '16px',
    };
  }
  return {
    padding: isFullscreen ? '0 12px' : '0 10px',
    fontSize: isFullscreen ? '14px' : '12px',
  };
};

export const getGlassTimeTileStyle = (
  isFullscreen = false,
  isPhone = false
): CSSProperties => ({
  ...getTimeTileText(isFullscreen, isPhone),
  height: `${getControlSize(isFullscreen, isPhone)}px`,
  borderRadius: getControlRadius(isFullscreen, isPhone),
  background: 'rgba(0, 0, 0, 0.52)',
  backdropFilter: 'blur(16px) saturate(180%)',
  WebkitBackdropFilter: 'blur(16px) saturate(180%)',
  border: 'none',
  boxShadow: isFullscreen
    ? '0 6px 18px rgba(0, 0, 0, 0.45)'
    : '0 4px 14px rgba(0, 0, 0, 0.35)',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxSizing: 'border-box',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  fontWeight: 600,
  letterSpacing: '0.02em',
  cursor: 'default',
  color: '#ffffff',
  userSelect: 'none',
  textShadow: '0 1px 2px rgba(0, 0, 0, 0.4)',
  transition: 'height 0.2s ease, padding 0.2s ease, font-size 0.2s ease',
});

export const glassPopoverStyle: CSSProperties = {
  borderRadius: '8px',
  background: 'rgba(15, 23, 42, 0.94)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: 'none',
  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
};
