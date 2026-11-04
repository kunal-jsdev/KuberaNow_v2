import { CSSProperties, ReactNode, RefObject } from 'react';

export type ActiveMenuType = 'volume' | 'speed' | 'share' | null;

export interface VideoPlayerContextType {
  isPlaying: boolean;
  isEnded: boolean;
  currentTime: number;
  duration: number;
  bufferedPercent: number;
  volume: number;
  isMuted: boolean;
  playbackSpeed: number;
  isFullscreen: boolean;
  isBuffering: boolean;
  isControlsVisible: boolean;
  /** Phone/tablet or no-hover device: controls stay up, volume is the device's. */
  isCompactControls: boolean;
  /**
   * Phone width (< 768px), inline (not fullscreen) horizontal player:
   * controls use their 24px phone sizes. Shorts keep their sizes.
   */
  isPhoneControls: boolean;
  isScrubbing: boolean;
  hoverTime: number | null;
  hoverPercent: number | null;
  title?: string;
  activeMenu: ActiveMenuType;
  ratio?: string;
  isVertical: boolean;
  videoAspectRatio: number | null;
  videoRef: RefObject<HTMLVideoElement | null>;
  containerRef: RefObject<HTMLDivElement | null>;
  seekAnimation: {
    direction: 'forward' | 'backward';
    amount: number;
    key: number;
  } | null;
  speedChangeAnimation: { speed: number; key: number } | null;
  subtitles?: string | null;
  isSubtitlesEnabled: boolean;
  hasSubtitles: boolean;
  activeSubtitleCue: string | null;
  url?: string;
  slug?: string;
  description?: string | null;

  togglePlay: () => void;
  play: () => void;
  pause: () => void;
  replay: () => void;
  seek: (timeInSeconds: number) => void;
  seekRelative: (seconds: number) => void;
  setVolume: (level: number) => void;
  toggleMute: () => void;
  setPlaybackSpeed: (speed: number) => void;
  toggleFullscreen: () => void;
  toggleSubtitles: () => void;
  resetControlsTimer: () => void;
  hideControlsOnLeave: () => void;
  setIsScrubbing: (isScrubbing: boolean) => void;
  setCurrentTime: (time: number) => void;
  setHoverInfo: (time: number | null, percent: number | null) => void;
  openMenu: (menu: ActiveMenuType) => void;
  closeMenu: () => void;
}

export interface VideoRootProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  ratio?: '16:9' | '9:16' | string;
  title?: string;
  subtitles?: string | null;
  url?: string;
  slug?: string;
  description?: string | null;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
}

export interface VideoSurfaceProps {
  src?: string | null;
  streamUid?: string | null;
  streamDomain?: string;
  cfStatus?: string;
  poster?: string | null;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  className?: string;
  style?: CSSProperties;
}

export interface TopControlsBarProps {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export interface VideoControlsBarProps {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export interface VideoScrubberProps {
  className?: string;
  style?: CSSProperties;
  accentColor?: string;
}

export interface PlayPauseButtonProps {
  className?: string;
  style?: CSSProperties;
  size?: number;
}

export interface TimeDisplayProps {
  className?: string;
  style?: CSSProperties;
  format?: 'current' | 'remaining' | 'both';
}

export interface VolumeControlProps {
  className?: string;
  style?: CSSProperties;
}

export interface PlaybackSpeedMenuProps {
  className?: string;
  style?: CSSProperties;
  speeds?: number[];
}

export interface ShareButtonProps {
  className?: string;
  style?: CSSProperties;
  url?: string;
  shareTitle?: string;
  shareDescription?: string;
}

export interface FullscreenButtonProps {
  className?: string;
  style?: CSSProperties;
}

export interface CenterPlayOverlayProps {
  className?: string;
  style?: CSSProperties;
  accentColor?: string;
}

export interface CustomVideoPlayerProps extends VideoSurfaceProps {
  ratio?: '16:9' | '9:16' | string;
  title?: string;
  subtitles?: string | null;
  url?: string;
  slug?: string;
  description?: string | null;
  className?: string;
  style?: CSSProperties;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
}

export interface SubtitlesButtonProps {
  className?: string;
  style?: CSSProperties;
}
