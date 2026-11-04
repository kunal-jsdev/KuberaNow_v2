'use client';

import {
  createContext,
  type FC,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { getActiveCueText, parseSubtitles } from './subtitles';
import { ActiveMenuType, VideoPlayerContextType } from './types';

export const VideoPlayerContext = createContext<VideoPlayerContextType | null>(
  null
);

interface VideoPlayerProviderProps {
  children: ReactNode;
  title?: string;
  subtitles?: string | null;
  ratio?: string;
  url?: string;
  slug?: string;
  description?: string | null;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
}

export const VideoPlayerProvider: FC<VideoPlayerProviderProps> = ({
  children,
  title,
  subtitles,
  ratio,
  url,
  slug,
  description,
  onPlay,
  onPause,
  onEnded,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hideControlsTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isEnded, setIsEnded] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [bufferedPercent, setBufferedPercent] = useState(0);
  const [volume, setVolumeState] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeedState] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isControlsVisible, setIsControlsVisible] = useState(false);

  // Phones and tablets (and any device without hover) have no way to bring
  // auto-hidden controls back, so there they stay visible.
  const [isAlwaysShowControls, setIsAlwaysShowControls] = useState(false);
  useEffect(() => {
    const query = window.matchMedia('(max-width: 1023.98px), (hover: none)');
    const update = () => setIsAlwaysShowControls(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  // Phones (below Tailwind's `md`) get smaller controls.
  const [isPhone, setIsPhone] = useState(false);
  useEffect(() => {
    const query = window.matchMedia('(max-width: 767.98px)');
    const update = () => setIsPhone(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverPercent, setHoverPercent] = useState<number | null>(null);
  const [seekAnimation, setSeekAnimation] = useState<{
    direction: 'forward' | 'backward';
    amount: number;
    key: number;
  } | null>(null);
  const [speedChangeAnimation, setSpeedChangeAnimation] = useState<{
    speed: number;
    key: number;
  } | null>(null);
  const [activeMenu, setActiveMenuState] = useState<ActiveMenuType>(null);
  const [isNaturalVertical, setIsNaturalVertical] = useState(false);
  const [videoAspectRatio, setVideoAspectRatio] = useState<number | null>(null);
  const activeMenuRef = useRef<ActiveMenuType>(null);
  const switchTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastPlayActionTimeRef = useRef<number>(0);
  const isReplayingRef = useRef<boolean>(false);
  // A pending re-check of a pause event; kept across listener re-subscribes
  // (they happen on every scrub) so a pause is never silently lost.
  const pauseSettleTimerRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(
    () => () => {
      if (pauseSettleTimerRef.current)
        clearTimeout(pauseSettleTimerRef.current);
    },
    []
  );
  const replayingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [isSubtitlesEnabled, setIsSubtitlesEnabled] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('kubera_video_subtitles_enabled');
        return stored === 'true';
      } catch {
        return false;
      }
    }
    return false;
  });

  const toggleSubtitles = useCallback(() => {
    setIsSubtitlesEnabled((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('kubera_video_subtitles_enabled', String(next));
        } catch {}
      }
      return next;
    });
  }, []);

  const cues = useMemo(() => {
    return parseSubtitles(subtitles, duration);
  }, [subtitles, duration]);

  const hasSubtitles = Boolean(
    subtitles && subtitles.trim().length > 0 && cues.length > 0
  );

  const activeSubtitleCue = useMemo(() => {
    if (!isSubtitlesEnabled || !hasSubtitles) return null;
    return getActiveCueText(cues, currentTime);
  }, [isSubtitlesEnabled, hasSubtitles, cues, currentTime]);

  const isVertical = ratio ? ratio === '9:16' : isNaturalVertical;

  useEffect(() => {
    activeMenuRef.current = activeMenu;
  }, [activeMenu]);

  const closeMenu = useCallback(() => {
    if (switchTimerRef.current) {
      clearTimeout(switchTimerRef.current);
      switchTimerRef.current = null;
    }
    setActiveMenuState(null);
  }, []);

  const isFullscreenRef = useRef(isFullscreen);
  const isVerticalRef = useRef(isVertical);

  useEffect(() => {
    isFullscreenRef.current = isFullscreen;
  }, [isFullscreen]);

  useEffect(() => {
    isVerticalRef.current = isVertical;
  }, [isVertical]);

  // Volume, speed and share all open their menus in every mode (normal,
  // fullscreen and vertical); openMenu toggles and switches between them.
  const openMenu = useCallback((target: ActiveMenuType) => {
    if (switchTimerRef.current) {
      clearTimeout(switchTimerRef.current);
      switchTimerRef.current = null;
    }

    const current = activeMenuRef.current;

    if (current === target) {
      setActiveMenuState(null);
      return;
    }

    if (current !== null && target !== null) {
      setActiveMenuState(null);
      switchTimerRef.current = setTimeout(() => {
        setActiveMenuState(target);
        switchTimerRef.current = null;
      }, 200);
      return;
    }

    setActiveMenuState(target);
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const doc = document as Document & {
        webkitFullscreenElement?: Element | null;
      };
      const isNowFullscreen = Boolean(
        doc.fullscreenElement || doc.webkitFullscreenElement
      );
      setIsFullscreen(isNowFullscreen);
      if (!isNowFullscreen) {
        // Leaving with the system back gesture / Esc: free the rotation too.
        screen.orientation?.unlock?.();
        closeMenu();
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener(
        'webkitfullscreenchange',
        handleFullscreenChange
      );
    };
  }, [closeMenu]);

  const resetControlsTimer = useCallback(() => {
    setIsControlsVisible(true);
    if (hideControlsTimerRef.current) {
      clearTimeout(hideControlsTimerRef.current);
    }
    if (!isScrubbing) {
      hideControlsTimerRef.current = setTimeout(() => {
        setIsControlsVisible(false);
      }, 2500);
    }
  }, [isScrubbing]);

  const hideControlsOnLeave = useCallback(() => {
    if (hideControlsTimerRef.current) {
      clearTimeout(hideControlsTimerRef.current);
    }
    if (!isScrubbing) {
      hideControlsTimerRef.current = setTimeout(() => {
        setIsControlsVisible(false);
      }, 120);
    }
  }, [isScrubbing]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (
      video.readyState >= 1 &&
      video.videoWidth > 0 &&
      video.videoHeight > 0
    ) {
      setDuration(video.duration || 0);
      setIsNaturalVertical(video.videoHeight > video.videoWidth);
      setVideoAspectRatio(video.videoWidth / video.videoHeight);
    }

    const waitingTimerRef = { current: null as NodeJS.Timeout | null };

    const clearBuffering = () => {
      if (waitingTimerRef.current) {
        clearTimeout(waitingTimerRef.current);
        waitingTimerRef.current = null;
      }
      setIsBuffering(false);
    };

    const handleTimeUpdate = () => {
      if (isReplayingRef.current) {
        if (video.currentTime < 2.0) {
          isReplayingRef.current = false;
          if (replayingTimerRef.current) {
            clearTimeout(replayingTimerRef.current);
            replayingTimerRef.current = null;
          }
        } else {
          if (!isScrubbing) {
            setCurrentTime(0);
          }
          clearBuffering();
          return;
        }
      }

      if (!isScrubbing) {
        setCurrentTime(video.currentTime);
      }
      if (video.buffered.length > 0 && video.duration > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        setBufferedPercent(Math.min(100, (bufferedEnd / video.duration) * 100));
      }

      if (video.duration > 0) {
        const threshold = Math.max(0.5, video.duration - 0.5);
        if (video.currentTime >= threshold) {
          if (!video.paused) {
            try {
              video.pause();
            } catch {}
          }
          setIsPlaying(false);
          setIsEnded(true);
          clearBuffering();
          onEnded?.();
        } else if (video.currentTime < video.duration - 1.2) {
          setIsEnded(false);
        }
      }
      clearBuffering();
    };

    const handleDurationChange = () => {
      setDuration(video.duration || 0);
    };

    const handlePlayEvent = () => {
      setIsPlaying(true);
      if (video.duration > 0 && video.currentTime < video.duration - 1.0) {
        setIsEnded(false);
      }
      clearBuffering();
      onPlay?.();
    };

    // Settles the paused state from the element itself, so the play/pause
    // button can never disagree with what the video is actually doing.
    const settlePaused = () => {
      pauseSettleTimerRef.current = null;
      if (!video.paused) return; // playback resumed in the meantime
      setIsPlaying(false);
      clearBuffering();
      if (video.duration > 0) {
        const threshold = Math.max(0.5, video.duration - 0.5);
        if (video.currentTime >= threshold) {
          setIsEnded(true);
        }
      }
      resetControlsTimer();
      onPause?.();
    };

    const handlePauseEvent = () => {
      if (pauseSettleTimerRef.current) {
        clearTimeout(pauseSettleTimerRef.current);
      }
      // Pauses right after a play action or during a replay are often
      // transient. These used to be dropped outright — leaving the button on
      // "playing" when the pause was real — so re-check once the window ends.
      const sincePlayAction = Date.now() - lastPlayActionTimeRef.current;
      if (isReplayingRef.current || sincePlayAction < 800) {
        pauseSettleTimerRef.current = setTimeout(
          settlePaused,
          Math.max(0, 800 - sincePlayAction) + 50
        );
        return;
      }
      settlePaused();
    };

    const handleEndedEvent = () => {
      if (
        isReplayingRef.current ||
        Date.now() - lastPlayActionTimeRef.current < 800 ||
        video.currentTime < 1
      ) {
        return;
      }
      setIsPlaying(false);
      setIsEnded(true);
      clearBuffering();
      resetControlsTimer();
      onEnded?.();
    };

    const handleWaiting = () => {
      if (waitingTimerRef.current) {
        clearTimeout(waitingTimerRef.current);
      }
      if (!video.paused && !isReplayingRef.current) {
        waitingTimerRef.current = setTimeout(() => {
          if (!video.paused && video.readyState < 3) {
            setIsBuffering(true);
          }
        }, 250);
      }
    };

    const handlePlaying = () => {
      clearBuffering();
      setIsPlaying(true);
    };

    const handleCanPlay = () => {
      clearBuffering();
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration || 0);
      clearBuffering();
      if (video.videoWidth > 0 && video.videoHeight > 0) {
        setIsNaturalVertical(video.videoHeight > video.videoWidth);
        setVideoAspectRatio(video.videoWidth / video.videoHeight);
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('loadeddata', handleCanPlay);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('canplaythrough', handleCanPlay);
    video.addEventListener('seeked', handleCanPlay);
    video.addEventListener('play', handlePlayEvent);
    video.addEventListener('pause', handlePauseEvent);
    video.addEventListener('ended', handleEndedEvent);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('playing', handlePlaying);

    return () => {
      if (waitingTimerRef.current) {
        clearTimeout(waitingTimerRef.current);
      }
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('loadeddata', handleCanPlay);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('canplaythrough', handleCanPlay);
      video.removeEventListener('seeked', handleCanPlay);
      video.removeEventListener('play', handlePlayEvent);
      video.removeEventListener('pause', handlePauseEvent);
      video.removeEventListener('ended', handleEndedEvent);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('playing', handlePlaying);
    };
  }, [isScrubbing, onPlay, onPause, onEnded, resetControlsTimer]);

  const replay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    isReplayingRef.current = true;
    lastPlayActionTimeRef.current = Date.now();
    setIsEnded(false);
    setIsBuffering(false);
    setIsPlaying(true);
    setCurrentTime(0);

    const hls = (video as any).__hlsInstance;
    if (hls && typeof hls.startLoad === 'function') {
      try {
        hls.startLoad(0);
      } catch {}
    }

    video.currentTime = 0;

    const playVideo = () => {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            setIsEnded(false);
            setIsBuffering(false);
          })
          .catch((err: any) => {
            if (
              err &&
              (err.name === 'NotAllowedError' || err.name === 'AbortError')
            ) {
              video.muted = true;
              setIsMuted(true);
              video
                .play()
                .then(() => {
                  setIsPlaying(true);
                  setIsEnded(false);
                  setIsBuffering(false);
                })
                .catch(() => {});
            }
          });
      }
    };

    playVideo();

    if (replayingTimerRef.current) {
      clearTimeout(replayingTimerRef.current);
    }
    replayingTimerRef.current = setTimeout(() => {
      isReplayingRef.current = false;
    }, 3000);

    resetControlsTimer();
  }, [resetControlsTimer]);

  const play = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    const dur = video.duration || 0;
    const threshold = Math.max(0.5, dur - 0.5);
    const isAtEnd =
      isEnded || video.ended || (dur > 0 && video.currentTime >= threshold);
    if (isAtEnd) {
      replay();
      return;
    }
    lastPlayActionTimeRef.current = Date.now();
    const p = video.play();
    if (p !== undefined) {
      p.catch(() => {});
    }
    resetControlsTimer();
  }, [isEnded, replay, resetControlsTimer]);

  const pause = useCallback(() => {
    if (Date.now() - lastPlayActionTimeRef.current < 350) return;
    videoRef.current?.pause();
    resetControlsTimer();
  }, [resetControlsTimer]);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    const dur = video.duration || 0;
    const threshold = Math.max(0.5, dur - 0.5);
    const isAtEnd =
      isEnded || video.ended || (dur > 0 && video.currentTime >= threshold);
    if (isAtEnd) {
      replay();
    } else if (video.paused) {
      lastPlayActionTimeRef.current = Date.now();
      const p = video.play();
      if (p !== undefined) {
        p.catch(() => {});
      }
    } else {
      if (Date.now() - lastPlayActionTimeRef.current < 350) return;
      video.pause();
    }
    resetControlsTimer();
  }, [isEnded, replay, resetControlsTimer]);

  const seek = useCallback((timeInSeconds: number) => {
    const video = videoRef.current;
    if (video) {
      const dur = video.duration || 0;
      const clamped = Math.max(0, Math.min(dur, timeInSeconds));
      video.currentTime = clamped;
      setCurrentTime(clamped);
      if (dur > 0) {
        const threshold = Math.max(0.5, dur - 0.5);
        if (clamped >= threshold) {
          setIsEnded(true);
        } else {
          setIsEnded(false);
        }
      }
    }
  }, []);

  const seekRelative = useCallback(
    (seconds: number) => {
      const video = videoRef.current;
      if (!video) return;
      const dur = video.duration || 0;
      const current = video.currentTime || 0;
      const newTime = Math.max(0, Math.min(dur, current + seconds));

      video.currentTime = newTime;
      setCurrentTime(newTime);
      if (dur > 0) {
        const threshold = Math.max(0.5, dur - 0.5);
        setIsEnded(newTime >= threshold);
      }

      setSeekAnimation({
        direction: seconds > 0 ? 'forward' : 'backward',
        amount: Math.abs(seconds),
        key: Date.now(),
      });

      resetControlsTimer();
    },
    [resetControlsTimer]
  );

  const lastNonZeroVolumeRef = useRef<number>(volume > 0 ? volume : 0.5);

  const setVolume = useCallback((level: number) => {
    const video = videoRef.current;
    const clamped = Math.max(0, Math.min(1, level));
    if (clamped > 0) {
      lastNonZeroVolumeRef.current = clamped;
    }
    if (video) {
      video.volume = clamped;
    }
    setVolumeState(clamped);
    if (clamped === 0) {
      if (video) video.muted = true;
      setIsMuted(true);
    } else {
      if (video && video.muted) video.muted = false;
      setIsMuted(false);
    }
  }, []);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    const nextMuted = !video.muted;
    video.muted = nextMuted;
    setIsMuted(nextMuted);
    if (!nextMuted) {
      const restoreVol =
        lastNonZeroVolumeRef.current > 0 ? lastNonZeroVolumeRef.current : 0.5;
      if (video) {
        video.volume = restoreVol;
      }
      setVolumeState(restoreVol);
    }
  }, []);

  const setPlaybackSpeed = useCallback((speed: number) => {
    const video = videoRef.current;
    if (video) {
      video.playbackRate = speed;
      setPlaybackSpeedState(speed);
      setSpeedChangeAnimation({ speed, key: Date.now() });
    }
  }, []);

  const toggleFullscreen = useCallback(() => {
    const container = containerRef.current as
      (HTMLDivElement & { webkitRequestFullscreen?: () => void }) | null;
    if (!container) return;

    const doc = document as Document & {
      webkitFullscreenElement?: Element | null;
      webkitExitFullscreen?: () => void;
    };
    const orientation = screen.orientation as ScreenOrientation & {
      lock?: (orientation: 'landscape') => Promise<void>;
    };

    if (doc.fullscreenElement || doc.webkitFullscreenElement) {
      orientation?.unlock?.();
      if (doc.exitFullscreen) doc.exitFullscreen().catch(() => {});
      else doc.webkitExitFullscreen?.();
      return;
    }

    // A horizontal video turns the phone to landscape so it fills the
    // screen (Android; desktops and iPads simply refuse the lock).
    const lockLandscape = () => {
      if (isVerticalRef.current) return;
      orientation?.lock?.('landscape').catch(() => {});
    };

    if (container.requestFullscreen) {
      container.requestFullscreen().then(lockLandscape, () => {});
      return;
    }
    if (container.webkitRequestFullscreen) {
      container.webkitRequestFullscreen();
      lockLandscape();
      return;
    }

    // iPhone Safari can't put a page element fullscreen; only the video
    // itself, in the system player (fills the screen, rotates with the
    // phone, uses Apple's own controls until the viewer exits).
    const video = videoRef.current as
      (HTMLVideoElement & { webkitEnterFullscreen?: () => void }) | null;
    video?.webkitEnterFullscreen?.();
  }, []);

  const setHoverInfo = useCallback(
    (time: number | null, percent: number | null) => {
      setHoverTime(time);
      setHoverPercent(percent);
    },
    []
  );

  const value: VideoPlayerContextType = {
    isPlaying,
    isEnded,
    currentTime,
    duration,
    bufferedPercent,
    volume,
    isMuted,
    playbackSpeed,
    isFullscreen,
    isBuffering,
    isControlsVisible: isControlsVisible || isAlwaysShowControls,
    isCompactControls: isAlwaysShowControls,
    // Phone sizes are for the inline horizontal player only: fullscreen and
    // shorts keep their own sizes.
    isPhoneControls: isPhone && !isFullscreen && !isVertical,
    isScrubbing,
    hoverTime,
    hoverPercent,
    title,
    activeMenu,
    ratio,
    isVertical,
    videoAspectRatio,
    videoRef,
    containerRef,
    seekAnimation,
    speedChangeAnimation,
    subtitles,
    isSubtitlesEnabled,
    hasSubtitles,
    activeSubtitleCue,
    url,
    slug,
    description,
    togglePlay,
    play,
    pause,
    replay,
    seek,
    seekRelative,
    setVolume,
    toggleMute,
    setPlaybackSpeed,
    toggleFullscreen,
    toggleSubtitles,
    resetControlsTimer,
    hideControlsOnLeave,
    setIsScrubbing,
    setCurrentTime,
    setHoverInfo,
    openMenu,
    closeMenu,
  };

  return (
    <VideoPlayerContext.Provider value={value}>
      {children}
    </VideoPlayerContext.Provider>
  );
};
