'use client';

import { type FC } from 'react';

import { useVideoPlayer } from './useVideoPlayer';

export const SubtitlesOverlay: FC = () => {
  const {
    isSubtitlesEnabled,
    activeSubtitleCue,
    isControlsVisible,
    isFullscreen,
  } = useVideoPlayer();

  if (!isSubtitlesEnabled || !activeSubtitleCue) {
    return null;
  }

  let bottomOffset = '20px';
  if (isFullscreen) {
    bottomOffset = isControlsVisible ? '94px' : '36px';
  } else if (isControlsVisible) {
    bottomOffset = '66px';
  }

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        width: '100%',
        bottom: bottomOffset,
        display: 'flex',
        justifyContent: 'center',
        padding: isFullscreen ? '0 5%' : '0 8px',
        boxSizing: 'border-box',
        zIndex: 18,
        pointerEvents: 'none',
        userSelect: 'none',
        transition: 'bottom 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
      aria-live='assertive'
    >
      <div
        style={{
          display: 'inline-block',
          width: 'fit-content',
          maxWidth: isFullscreen ? '90%' : '100%',
          backgroundColor: 'rgba(8, 8, 8, 0.85)',
          color: '#ffffff',
          padding: isFullscreen ? '9px 20px' : '6px 14px',
          borderRadius: isFullscreen ? '6px' : '4px',
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "YouTube Noto", "Segoe UI", Roboto, "Noto Sans Gujarati", "Gujarati Sangam MN", Arial, sans-serif',
          fontSize: isFullscreen ? '1.95rem' : '1.0rem',
          fontWeight: 600,
          lineHeight: 1.45,
          letterSpacing: '0.012em',
          textAlign: 'center',
          textShadow: '0 1px 3px rgba(0, 0, 0, 0.95)',
          boxShadow: '0 3px 14px rgba(0, 0, 0, 0.6)',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxSizing: 'border-box',
          transition: 'font-size 0.2s ease, padding 0.2s ease, width 0.2s ease',
        }}
      >
        {activeSubtitleCue}
      </div>
    </div>
  );
};

export default SubtitlesOverlay;
