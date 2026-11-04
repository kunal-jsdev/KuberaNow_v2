'use client';

import { type FC, type KeyboardEvent as ReactKeyboardEvent } from 'react';

import { VideoRootProps } from './types';
import { useVideoPlayer } from './useVideoPlayer';
import { VideoPlayerProvider } from './VideoPlayerContext';

const VideoRootContainer: FC<
  Omit<VideoRootProps, 'title' | 'onPlay' | 'onPause' | 'onEnded'>
> = ({ children, className = '', style = {}, ratio = '16:9' }) => {
  const {
    containerRef,
    togglePlay,
    toggleFullscreen,
    resetControlsTimer,
    hideControlsOnLeave,
    seekRelative,
    toggleMute,
    volume,
    setVolume,
    isFullscreen,
    isVertical,
    videoAspectRatio,
    toggleSubtitles,
  } = useVideoPlayer();

  const handleKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    const targetTag = (e.target as HTMLElement)?.tagName?.toLowerCase();
    if (
      targetTag === 'input' ||
      targetTag === 'textarea' ||
      targetTag === 'select'
    ) {
      return;
    }

    if (e.key === ' ' || e.key === 'k' || e.key === 'K') {
      e.preventDefault();
      togglePlay();
      resetControlsTimer();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      seekRelative(5);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      seekRelative(-5);
    } else if (e.key === 'l' || e.key === 'L') {
      e.preventDefault();
      seekRelative(10);
    } else if (e.key === 'j' || e.key === 'J') {
      e.preventDefault();
      seekRelative(-10);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setVolume(Math.min(1, volume + 0.1));
      resetControlsTimer();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setVolume(Math.max(0, volume - 0.1));
      resetControlsTimer();
    } else if (e.key === 'm' || e.key === 'M') {
      e.preventDefault();
      toggleMute();
      resetControlsTimer();
    } else if (e.key === 'f' || e.key === 'F') {
      e.preventDefault();
      toggleFullscreen();
    } else if (e.key === 'c' || e.key === 'C') {
      e.preventDefault();
      toggleSubtitles();
    }
  };

  const isVerticalMode = isVertical;
  let effectiveRatio = isVerticalMode ? 9 / 16 : 16 / 9;
  if (videoAspectRatio) {
    if (isVerticalMode && videoAspectRatio < 1) {
      effectiveRatio = videoAspectRatio;
    } else if (!isVerticalMode && videoAspectRatio >= 1) {
      effectiveRatio = videoAspectRatio;
    }
  }

  let containerAspectRatio: string | undefined;
  if (!isFullscreen) {
    containerAspectRatio = isVerticalMode ? '9/16' : '16/9';
  }

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      role='region'
      aria-label='Video Player'
      onKeyDown={handleKeyDown}
      onMouseEnter={resetControlsTimer}
      onMouseMove={resetControlsTimer}
      onMouseLeave={hideControlsOnLeave}
      onDoubleClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onClick={(e) => {
        containerRef.current?.focus({ preventScroll: true });
        if (e.target === e.currentTarget) {
          togglePlay();
        }
      }}
      className={`group relative overflow-hidden bg-black outline-none select-none focus-visible:ring-2 focus-visible:ring-cyan-400/50 ${className}`}
      style={{
        width: '100%',
        height: '100%',
        aspectRatio: containerAspectRatio,
        maxWidth: isFullscreen ? 'none' : '100%',
        maxHeight: isFullscreen ? 'none' : '100%',
        borderRadius: isFullscreen ? '0px' : '12px',
        boxShadow: isFullscreen
          ? 'none'
          : '0 10px 30px -10px rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style,
      }}
    >
      <div
        style={{
          position: 'relative',
          width: isFullscreen
            ? `min(100vw, calc(100vh * ${effectiveRatio}))`
            : '100%',
          height: isFullscreen
            ? `min(100vh, calc(100vw / ${effectiveRatio}))`
            : '100%',
          aspectRatio: isFullscreen ? `${effectiveRatio}` : undefined,
          maxWidth: '100%',
          maxHeight: '100%',
          display: 'block',
          overflow: 'hidden',
          backgroundColor: '#000',
        }}
      >
        {children}
      </div>
    </div>
  );
};

export const VideoRoot: FC<VideoRootProps> = ({
  children,
  title,
  subtitles,
  url,
  slug,
  description,
  onPlay,
  onPause,
  onEnded,
  ...containerProps
}) => {
  return (
    <VideoPlayerProvider
      title={title}
      subtitles={subtitles}
      ratio={containerProps.ratio}
      url={url}
      slug={slug}
      description={description}
      onPlay={onPlay}
      onPause={onPause}
      onEnded={onEnded}
    >
      <VideoRootContainer {...containerProps}>{children}</VideoRootContainer>
    </VideoPlayerProvider>
  );
};

export default VideoRoot;
