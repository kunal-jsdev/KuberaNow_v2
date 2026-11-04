'use client';

import { useEffect, useRef, useState } from 'react';

import Image from 'next/image';

import LiveIndicatorDot from '@/components/news-detail/LiveIndicatorDot';

import type { HeadLineCardProps } from './types';
import { VideoControls } from './VideoControls';

/**
 * Extracts an 11-character YouTube video ID from a URL or returns it as-is.
 * Supports watch, youtu.be, embed, shorts, and raw ID formats.
 */
function getYouTubeId(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
  const match = trimmed.match(
    /^.*(?:youtu\.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|&v=)([^#&?]*).*/
  );
  return match && match[1].length === 11 ? match[1] : null;
}

export type { HeadLineCardProps };

export function HeadLineCard({
  src,
  mediaType,
  headline,
  isActive = true,
  priority = false,
  isLive = false,
  onVideoPlayingChange,
}: HeadLineCardProps) {
  const resolvedSrc = src || '/assets/coming_soon.png';
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playPromiseRef = useRef<Promise<void> | undefined>(undefined);

  const youTubeId = mediaType === 'youtube' ? getYouTubeId(src) : null;

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const isVideo =
    mediaType === 'video' ||
    (src ? /\.(mp4|webm|m3u8)(?:.*)?$/i.test(src) : false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive) {
      playPromiseRef.current = video.play().catch(() => {});
    } else {
      const stop = () => {
        video.pause();
        if (video.readyState >= 1) {
          video.currentTime = 0;
        }
      };

      if (playPromiseRef.current !== undefined) {
        playPromiseRef.current.then(stop).catch(stop);
        playPromiseRef.current = undefined;
      } else {
        stop();
      }
    }
  }, [isActive]);

  // Drive the YouTube player over the iframe API rather than remounting it, so
  // the user's playback position survives and the controls stay responsive.
  const postToPlayer = (func: 'playVideo' | 'pauseVideo') => {
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: 'command', func, args: [] }),
      '*'
    );
  };

  useEffect(() => {
    if (!youTubeId) return;

    if (!isActive) {
      postToPlayer('pauseVideo');
      onVideoPlayingChange?.(false);
    }
  }, [isActive, youTubeId, onVideoPlayingChange]);

  // YouTube reports state through postMessage once enablejsapi=1. The player
  // only starts sending events after we subscribe via the `listening` handshake.
  useEffect(() => {
    if (!youTubeId) return;

    const PLAYING = 1;
    const ENDED = 0;
    const iframe = iframeRef.current;

    const subscribe = () => {
      iframe?.contentWindow?.postMessage(
        JSON.stringify({ event: 'listening', id: youTubeId }),
        '*'
      );
    };

    const command = (func: string, args: (number | string)[] = []) => {
      iframe?.contentWindow?.postMessage(
        JSON.stringify({ event: 'command', func, args }),
        '*'
      );
    };

    // Stands in for the `loop` param, which we can't use without playlist mode.
    const restart = () => {
      command('seekTo', [0, 1]);
      command('playVideo');
    };

    const onMessage = (event: MessageEvent) => {
      if (!event.origin.includes('youtube')) return;
      if (event.source !== iframe?.contentWindow) return;

      try {
        const data =
          typeof event.data === 'string' ? JSON.parse(event.data) : event.data;

        if (data?.event === 'onReady') subscribe();

        if (data?.event === 'onStateChange') {
          if (data.info === ENDED) restart();

          const playing = data.info === PLAYING;
          setIsPlaying(playing);
          onVideoPlayingChange?.(playing);
        }

        // `infoDelivery` carries the running time and duration.
        const info = data?.info;
        if (info) {
          if (typeof info.currentTime === 'number') {
            setCurrentTime(info.currentTime);
          }
          if (typeof info.duration === 'number' && info.duration > 0) {
            setDuration(info.duration);
          }
          if (typeof info.playerState === 'number') {
            if (info.playerState === ENDED) restart();

            const playing = info.playerState === PLAYING;
            setIsPlaying(playing);
            onVideoPlayingChange?.(playing);
          }
        }
      } catch {
        // Not a JSON payload we care about.
      }
    };

    window.addEventListener('message', onMessage);
    iframe?.addEventListener('load', subscribe);
    subscribe();

    return () => {
      window.removeEventListener('message', onMessage);
      iframe?.removeEventListener('load', subscribe);
      onVideoPlayingChange?.(false);
    };
  }, [youTubeId, onVideoPlayingChange]);

  const renderMedia = () => {
    if (youTubeId) {
      return (
        <iframe
          ref={iframeRef}
          // No `loop`/`playlist` here: playlist mode makes YouTube show parts
          // of its own chrome even with controls=0. Looping is handled by
          // replaying on the ENDED state instead.
          src={`https://www.youtube-nocookie.com/embed/${youTubeId}?autoplay=${
            isActive ? 1 : 0
          }&mute=1&controls=0&playsinline=1&rel=0&enablejsapi=1&modestbranding=1&iv_load_policy=3&disablekb=1&fs=0`}
          title={headline || 'Featured article video'}
          allow='autoplay; encrypted-media; picture-in-picture'
          allowFullScreen
          // Our own bar drives playback, so the iframe itself ignores clicks.
          className='pointer-events-none absolute inset-0 h-full w-full border-0 object-cover'
        />
      );
    }

    if (isVideo) {
      return (
        <video
          ref={videoRef}
          src={resolvedSrc || 'Featured article video'}
          muted
          loop
          playsInline
          preload={isActive ? 'auto' : 'metadata'}
          className='h-full w-full object-cover'
        />
      );
    }

    return (
      <Image
        src={resolvedSrc}
        alt={headline || 'Featured article image'}
        fill
        sizes='(max-width: 768px) 343px, 100vw'
        className='object-cover'
      />
    );
  };

  return (
    <div className='group relative h-full w-full overflow-hidden rounded-sm'>
      {renderMedia()}

      {/* The overlays must not swallow clicks aimed at the player controls. */}
      <div className='pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent' />

      {headline && (
        <div
          className={`pointer-events-none absolute right-0 left-0 z-10 p-2 text-white md:p-5 ${
            youTubeId ? 'bottom-9 md:bottom-12' : 'bottom-0 pb-3 md:pb-8'
          }`}
        >
          <h3 className='font-sans-guj line-clamp-3 pt-1 text-lg leading-normal font-bold text-white md:text-[32px] md:leading-[1.4]'>
            {isLive && (
              <LiveIndicatorDot
                size='sm'
                className='mr-2 ml-1.5 inline-flex align-middle'
              />
            )}
            <span>{headline}</span>
          </h3>
        </div>
      )}

      {youTubeId && (
        <VideoControls
          playerRef={iframeRef}
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
        />
      )}
    </div>
  );
}
