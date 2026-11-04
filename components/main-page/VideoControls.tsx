'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  FaCog,
  FaExpand,
  FaPause,
  FaPlay,
  FaShareAlt,
  FaVolumeMute,
  FaVolumeUp,
} from 'react-icons/fa';

const PLAYBACK_RATES = [0.5, 1, 1.5, 2];

type PlayerCommand =
  'playVideo' | 'pauseVideo' | 'mute' | 'unMute' | 'seekTo' | 'setPlaybackRate';

type VideoControlsProps = {
  /** The player iframe to drive over the YouTube iframe API. */
  playerRef: React.RefObject<HTMLIFrameElement | null>;
  isPlaying: boolean;
  /** Seconds elapsed / total, polled from the player. */
  currentTime: number;
  duration: number;
  shareUrl?: string;
  className?: string;
};

const formatTime = (seconds: number, forceHours: boolean = false): string => {
  if (!Number.isFinite(seconds) || seconds < 0)
    return forceHours ? '0:00:00' : '0:00';
  const totalSecs = Math.floor(seconds);
  const hours = Math.floor(totalSecs / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;

  if (hours > 0 || forceHours) {
    return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const iconButtonClass =
  'flex h-7 w-7 shrink-0 items-center justify-center rounded text-white/90 transition hover:text-white focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:outline-none';

export function VideoControls({
  playerRef,
  isPlaying,
  currentTime,
  duration,
  shareUrl,
  className = '',
}: VideoControlsProps) {
  const [isMuted, setIsMuted] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [shareLabel, setShareLabel] = useState<string | null>(null);
  const settingsRef = useRef<HTMLDivElement>(null);

  const command = useCallback(
    (func: PlayerCommand, args: (number | string)[] = []) => {
      playerRef.current?.contentWindow?.postMessage(
        JSON.stringify({ event: 'command', func, args }),
        '*'
      );
    },
    [playerRef]
  );

  // Close the settings popover on an outside click.
  useEffect(() => {
    if (!showSettings) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!settingsRef.current?.contains(event.target as Node)) {
        setShowSettings(false);
      }
    };

    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [showSettings]);

  const togglePlay = () => command(isPlaying ? 'pauseVideo' : 'playVideo');

  const toggleMute = () => {
    command(isMuted ? 'unMute' : 'mute');
    setIsMuted((muted) => !muted);
  };

  const handleSeek = (event: React.ChangeEvent<HTMLInputElement>) => {
    command('seekTo', [Number(event.target.value), 1]);
  };

  const handleRate = (rate: number) => {
    command('setPlaybackRate', [rate]);
    setPlaybackRate(rate);
    setShowSettings(false);
  };

  const handleShare = async () => {
    const url =
      shareUrl || (typeof window !== 'undefined' ? window.location.href : '');
    if (!url) return;

    try {
      if (navigator.share) {
        await navigator.share({ url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setShareLabel('Link copied');
    } catch {
      setShareLabel('Copy failed');
    }
    setTimeout(() => setShareLabel(null), 2000);
  };

  const handleFullscreen = () => {
    const iframe = playerRef.current;
    if (!iframe) return;
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else iframe.requestFullscreen?.().catch(() => {});
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className={`swiper-no-swiping absolute right-0 bottom-0 left-0 z-20 flex flex-col gap-1 bg-gradient-to-t from-black/80 to-transparent px-2 pt-6 pb-1.5 md:px-3 md:pb-2 ${className}`}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') event.preventDefault();
        event.stopPropagation();
      }}
    >
      {/* Scrubber */}
      <div className='relative flex h-1 w-full items-center'>
        <div className='absolute h-[3px] w-full rounded-full bg-white/30' />
        <div
          className='absolute h-[3px] rounded-full bg-white'
          style={{ width: `${progress}%` }}
        />
        <input
          type='range'
          min={0}
          max={duration || 0}
          step={0.1}
          value={currentTime}
          onChange={handleSeek}
          aria-label='Seek'
          className='absolute h-3 w-full cursor-pointer appearance-none bg-transparent opacity-0'
        />
      </div>

      <div className='flex items-center gap-1 md:gap-2'>
        <button
          type='button'
          onClick={togglePlay}
          aria-label={isPlaying ? 'Pause' : 'Play'}
          className={iconButtonClass}
        >
          {isPlaying ? (
            <FaPause className='h-3 w-3 md:h-3.5 md:w-3.5' />
          ) : (
            <FaPlay className='h-3 w-3 md:h-3.5 md:w-3.5' />
          )}
        </button>

        <button
          type='button'
          onClick={toggleMute}
          aria-label={isMuted ? 'Unmute' : 'Mute'}
          className={iconButtonClass}
        >
          {isMuted ? (
            <FaVolumeMute className='h-3 w-3 md:h-3.5 md:w-3.5' />
          ) : (
            <FaVolumeUp className='h-3 w-3 md:h-3.5 md:w-3.5' />
          )}
        </button>

        <span className='ml-1 text-[10px] leading-none text-white/90 tabular-nums md:text-xs'>
          {formatTime(currentTime, duration >= 3600 || currentTime >= 3600)} /{' '}
          {formatTime(duration, duration >= 3600 || currentTime >= 3600)}
        </span>

        <div className='ml-auto flex items-center gap-1 md:gap-2'>
          {shareLabel && (
            <span className='text-[10px] leading-none text-white/90 md:text-xs'>
              {shareLabel}
            </span>
          )}

          <button
            type='button'
            onClick={handleShare}
            aria-label='Share'
            className={iconButtonClass}
          >
            <FaShareAlt className='h-3 w-3 md:h-3.5 md:w-3.5' />
          </button>

          <div
            ref={settingsRef}
            className='relative'
          >
            <button
              type='button'
              onClick={() => setShowSettings((open) => !open)}
              aria-label='Settings'
              aria-expanded={showSettings}
              className={iconButtonClass}
            >
              <FaCog className='h-3 w-3 md:h-3.5 md:w-3.5' />
            </button>

            {showSettings && (
              <div className='absolute right-0 bottom-full mb-2 min-w-24 overflow-hidden rounded bg-black/90 py-1 text-white shadow-lg'>
                <p className='px-3 py-1 text-[10px] text-white/60 md:text-xs'>
                  Speed
                </p>
                {PLAYBACK_RATES.map((rate) => (
                  <button
                    key={rate}
                    type='button'
                    onClick={() => handleRate(rate)}
                    className={`block w-full px-3 py-1 text-left text-[11px] transition hover:bg-white/15 md:text-xs ${
                      rate === playbackRate ? 'font-semibold' : ''
                    }`}
                  >
                    {rate === 1 ? 'Normal' : `${rate}x`}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type='button'
            onClick={handleFullscreen}
            aria-label='Fullscreen'
            className={iconButtonClass}
          >
            <FaExpand className='h-3 w-3 md:h-3.5 md:w-3.5' />
          </button>
        </div>
      </div>
    </div>
  );
}

export default VideoControls;
