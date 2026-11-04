'use client';

import { type MutableRefObject, useEffect } from 'react';

import {
  BufferingIndicator,
  PlaybackSpeedMenu,
  SeekFeedbackOverlay,
  ShareButton,
  useVideoPlayer,
  VideoRoot,
  VideoScrubber,
  VideoSurface,
  VolumeControl,
} from '@/components/common/VideoPlayer';

import VideoCategoryChip from './VideoCategoryChip';

type ShortsPlayerProps = {
  src?: string | null;
  poster?: string | null;
  title: string;
  description?: string | null;
  categoryTitle?: string | null;
  /** Absolute page URL, used by the share menu. */
  url: string;
  slug: string;
  /** Only the short in view plays; its neighbours stay loaded but paused. */
  active: boolean;
  /** The feed's mute choice, carried from one short to the next. */
  mutedRef: MutableRefObject<boolean>;
};

/**
 * Plays the short while it's the one in view and stops it (back to the start,
 * like YouTube Shorts) when the viewer moves on.
 */
function ActivePlayback({
  active,
  mutedRef,
}: Pick<ShortsPlayerProps, 'active' | 'mutedRef'>) {
  const { videoRef, toggleMute, isEnded, replay } = useVideoPlayer();

  // Shorts loop: when the one in view finishes, start it again. (The player
  // stops itself just before the last frame and marks the video "ended",
  // which is why this isn't the `loop` attribute.)
  useEffect(() => {
    if (active && isEnded) replay();
  }, [active, isEnded, replay]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;

    if (!active) {
      video.pause();
      if (video.currentTime > 0) video.currentTime = 0;
      return undefined;
    }

    const onVolumeChange = () => {
      mutedRef.current = video.muted;
    };

    let started = false;
    const start = () => {
      if (started) return;
      started = true;
      // toggleMute keeps the controls' mute state in sync with the element.
      if (video.muted !== mutedRef.current) toggleMute();
      video.play().catch((err: unknown) => {
        if ((err as { name?: string })?.name !== 'NotAllowedError') return;
        // Browsers refuse sound until the visitor has interacted; go muted.
        if (!video.muted) toggleMute();
        video.play().catch(() => {});
      });
      video.addEventListener('volumechange', onVolumeChange);
    };

    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      start();
    } else {
      video.addEventListener('canplay', start, { once: true });
    }

    return () => {
      video.removeEventListener('canplay', start);
      video.removeEventListener('volumechange', onVolumeChange);
    };
  }, [active, videoRef, toggleMute, mutedRef]);

  return null;
}

/**
 * The bottom of the short, top to bottom: the volume / speed / share stack
 * (right), the progress bar, then the category chip and title on the navy fade.
 */
function ShortsOverlay({
  title,
  description,
  categoryTitle,
  url,
}: Pick<ShortsPlayerProps, 'title' | 'description' | 'categoryTitle' | 'url'>) {
  const { isControlsVisible, activeMenu } = useVideoPlayer();
  const controlsVisible = isControlsVisible || activeMenu !== null;

  return (
    <>
      <div
        className='pointer-events-none absolute inset-0 z-10 bg-[linear-gradient(180deg,rgba(1,8,116,0)_79.457%,#010874_100%)]'
        aria-hidden
      />

      <div className='pointer-events-none absolute inset-x-0 bottom-0 z-30 flex flex-col'>
        <div
          className='pointer-events-auto flex flex-col items-center gap-2 self-end px-3 pb-3 transition-[opacity,transform] duration-200'
          style={{
            opacity: controlsVisible ? 1 : 0,
            transform: controlsVisible ? 'translateY(0)' : 'translateY(6px)',
            pointerEvents: controlsVisible ? 'auto' : 'none',
          }}
        >
          <VolumeControl />
          <PlaybackSpeedMenu />
          <ShareButton
            url={url}
            shareTitle={title}
            shareDescription={description ?? undefined}
          />
        </div>

        <div className='pointer-events-auto'>
          {/* In vertical mode the scrubber pins itself to the bottom edge;
              put it back in flow so it sits above the title. */}
          <VideoScrubber
            style={{
              position: 'relative',
              bottom: 'auto',
              left: 'auto',
              right: 'auto',
            }}
          />
        </div>

        <ShortsCaption
          title={title}
          categoryTitle={categoryTitle}
        />
      </div>
    </>
  );
}

/** Chip + title at the foot of a short; shared with the feed's placeholders. */
export function ShortsCaption({
  title,
  categoryTitle,
}: Pick<ShortsPlayerProps, 'title' | 'categoryTitle'>) {
  return (
    <div className='flex flex-col items-start gap-1 px-4 pt-2 pb-3'>
      {categoryTitle && <VideoCategoryChip title={categoryTitle} />}
      <h2 className='line-clamp-3 [font-family:var(--font-noto-sans),var(--font-noto-sans-guj),sans-serif] text-lg leading-5.5 font-bold tracking-normal wrap-anywhere text-white lg:text-xl lg:leading-6'>
        {title}
      </h2>
    </div>
  );
}

export default function ShortsPlayer({
  src,
  poster,
  title,
  description,
  categoryTitle,
  url,
  slug,
  active,
  mutedRef,
}: ShortsPlayerProps) {
  return (
    <VideoRoot
      ratio='9:16'
      title={title}
      description={description}
      url={url}
      slug={slug}
      className='h-full w-full'
      style={{ aspectRatio: 'auto', borderRadius: 0, boxShadow: 'none' }}
    >
      {/* Mounted ahead of time: hls.js starts buffering straight away, so the
          next short is ready the moment it scrolls into view. */}
      <VideoSurface
        src={src}
        poster={poster}
      />
      <ActivePlayback
        active={active}
        mutedRef={mutedRef}
      />
      <BufferingIndicator />
      {/* No centre play/pause button on shorts (any screen size): tapping
          anywhere on the video plays/pauses it (VideoSurface's click). */}
      <SeekFeedbackOverlay />
      <ShortsOverlay
        title={title}
        description={description}
        categoryTitle={categoryTitle}
        url={url}
      />
    </VideoRoot>
  );
}
