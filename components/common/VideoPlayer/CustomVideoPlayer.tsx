'use client';

import { type FC } from 'react';

import { BufferingIndicator } from './BufferingIndicator';
import { CenterPlayOverlay } from './CenterPlayOverlay';
import { FullscreenButton } from './controls/FullscreenButton';
import { PlaybackSpeedMenu } from './controls/PlaybackSpeedMenu';
import { PlayPauseButton } from './controls/PlayPauseButton';
import { ShareButton } from './controls/ShareButton';
import { TimeDisplay } from './controls/TimeDisplay';
import { TopControlsBar } from './controls/TopControlsBar';
import { VideoControlsBar } from './controls/VideoControlsBar';
import { VideoScrubber } from './controls/VideoScrubber';
import { VolumeControl } from './controls/VolumeControl';
import { SeekFeedbackOverlay } from './SeekFeedbackOverlay';
import { CustomVideoPlayerProps } from './types';
import { useVideoPlayer } from './useVideoPlayer';
import { VideoRoot } from './VideoRoot';
import { VideoSurface } from './VideoSurface';

const BottomCapsules: FC<{ title?: string; url?: string }> = ({
  title,
  url,
}) => {
  const { isFullscreen, isPhoneControls } = useVideoPlayer();
  // 8px between buttons on phones and in fullscreen, 6px otherwise.
  const gap = isFullscreen || isPhoneControls ? '8px' : '6px';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap,
        }}
      >
        <PlayPauseButton />
        <TimeDisplay />
        <VolumeControl />
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap,
        }}
      >
        <PlaybackSpeedMenu />
        <ShareButton
          shareTitle={title}
          url={url}
        />
      </div>
    </div>
  );
};

const PlayerControls: FC<{ title?: string; url?: string }> = ({
  title,
  url,
}) => {
  const { isVertical, isFullscreen, isControlsVisible, activeMenu } =
    useVideoPlayer();
  const isVisible = isControlsVisible || activeMenu !== null;

  return (
    <>
      <TopControlsBar>
        <FullscreenButton />
      </TopControlsBar>

      <CenterPlayOverlay />
      <SeekFeedbackOverlay />

      {!isVertical && (
        <VideoControlsBar>
          <VideoScrubber />
          <BottomCapsules
            title={title}
            url={url}
          />
        </VideoControlsBar>
      )}

      {isVertical && (
        <>
          <div
            style={{
              position: 'absolute',
              right: isFullscreen ? '14px' : '12px',
              bottom: isFullscreen ? '48px' : '44px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: isFullscreen ? '10px' : '8px',
              zIndex: 25,
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(6px)',
              pointerEvents: isVisible ? 'auto' : 'none',
              transition:
                'opacity 0.24s cubic-bezier(0.4, 0, 0.2, 1), transform 0.24s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            <VolumeControl />
            <PlaybackSpeedMenu />
            <ShareButton
              shareTitle={title}
              url={url}
            />
          </div>

          <VideoScrubber />
        </>
      )}
    </>
  );
};

export const CustomVideoPlayer: FC<CustomVideoPlayerProps> = ({
  src,
  streamUid,
  streamDomain,
  cfStatus,
  poster,
  title,
  subtitles,
  url,
  slug,
  description,
  ratio = '16:9',
  autoPlay = false,
  loop = false,
  muted = false,
  className = '',
  style = {},
  onEnded,
  onPlay,
  onPause,
}) => {
  return (
    <VideoRoot
      ratio={ratio}
      title={title}
      subtitles={subtitles}
      url={url}
      slug={slug}
      description={description}
      className={className}
      style={style}
      onPlay={onPlay}
      onPause={onPause}
      onEnded={onEnded}
    >
      <VideoSurface
        src={src}
        streamUid={streamUid}
        streamDomain={streamDomain}
        cfStatus={cfStatus}
        poster={poster}
        autoPlay={autoPlay}
        loop={loop}
        muted={muted}
      />
      {/* <SubtitlesOverlay /> */}
      <BufferingIndicator />
      <PlayerControls
        title={title}
        url={url}
      />
    </VideoRoot>
  );
};

export default CustomVideoPlayer;
