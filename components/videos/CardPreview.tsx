'use client';

import { useEffect, useRef, useState } from 'react';

import type Hls from 'hls.js';
import type { HlsConfig } from 'hls.js';
import Image from 'next/image';

import { useReducedMotion } from '@/hooks/useReducedMotion';
import playIcon from '@/public/assets/videos/play.svg';

import { useVideoPreview } from './VideoPreviewContext';

type CardPreviewProps = {
  id: string;
  /** HLS manifest; previews are skipped for videos without one. */
  src: string | null | undefined;
  /** The play icon on idle cards (videos have it; shorts don't). */
  showPlayButton?: boolean;
};

/**
 * Highlights: the preview plays 3s from each of these points in the video,
 * then loops — a ~12s teaser of the whole thing rather than its opening.
 */
const CLIP_STARTS = [0.1, 0.3, 0.55, 0.8];
const CLIP_SECONDS = 3;
/** Shorter than this, clips would overlap: just play it straight through. */
const MIN_HIGHLIGHT_DURATION = 16;

/**
 * Previews are always muted, so drop the separate audio rendition from the
 * master playlist: the player then downloads (and waits for) video only.
 */
function stripAudio(master: string): string {
  return master
    .split('\n')
    .filter(
      (line) =>
        !(line.startsWith('#EXT-X-MEDIA') && line.includes('TYPE=AUDIO'))
    )
    .map((line) =>
      line.startsWith('#EXT-X-STREAM-INF')
        ? line.replace(/,AUDIO="[^"]*"/, '').replace(
            /CODECS="([^"]*)"/,
            (_match, codecs: string) =>
              `CODECS="${codecs
                .split(',')
                .filter((codec) => !codec.trim().startsWith('mp4a'))
                .join(',')}"`
          )
        : line
    )
    .join('\n');
}

/** The smallest video rendition's playlist URI (what previews play). */
function lowestVideoPlaylist(master: string): string | null {
  const lines = master.split('\n');
  let uri: string | null = null;
  let lowest = Infinity;
  lines.forEach((line, i) => {
    if (!line.startsWith('#EXT-X-STREAM-INF')) return;
    const bandwidth = Number(/BANDWIDTH=(\d+)/.exec(line)?.[1] ?? Infinity);
    const next = lines[i + 1]?.trim();
    if (next && bandwidth < lowest) {
      lowest = bandwidth;
      uri = next;
    }
  });
  return uri;
}

/** Segment URIs of a media playlist with their start times, and its length. */
function parseSegments(playlist: string) {
  const segments: { uri: string; start: number }[] = [];
  let duration = 0;
  let pending: number | null = null;
  playlist.split('\n').forEach((raw) => {
    const line = raw.trim();
    if (line.startsWith('#EXTINF:')) {
      pending = parseFloat(line.slice(8));
    } else if (line && !line.startsWith('#') && pending !== null) {
      segments.push({ uri: line, start: duration });
      duration += pending;
      pending = null;
    }
  });
  return { segments, duration };
}

/** Where the first highlight clip starts, given the video's length. */
function firstClipTime(duration: number): number {
  return duration < MIN_HIGHLIGHT_DURATION ? 0 : duration * CLIP_STARTS[0];
}

/**
 * Where the first highlight clip starts, in seconds (0 for short videos).
 * Reads the playlists the prefetch already cached, so it's near-instant;
 * passing it to the player as its start position means it never downloads
 * the opening segment just to jump away from it.
 */
async function firstClipStart(src: string): Promise<number> {
  try {
    const master = await (await fetch(src)).text();
    const variant = lowestVideoPlaylist(master);
    if (!variant) return 0;
    const playlist = await (await fetch(new URL(variant, src))).text();
    return firstClipTime(parseSegments(playlist).duration);
  } catch {
    return 0;
  }
}

/** Previews already fetched ahead of a hover (per page load). */
const prefetched = new Set<string>();

/**
 * Warm the browser cache for a card on screen with exactly what its preview
 * starts with: master playlist, smallest video playlist, its init segment
 * and the segment where the first highlight clip begins (~40KB). A hover
 * then plays from cache instead of waiting on Cloudflare.
 */
async function prefetchStart(src: string) {
  if (prefetched.has(src)) return;
  prefetched.add(src);
  try {
    const master = await (await fetch(src)).text();
    const variant = lowestVideoPlaylist(master);
    if (!variant) return;
    const playlistUrl = new URL(variant, src);
    const playlist = await (await fetch(playlistUrl)).text();
    const init = /#EXT-X-MAP:URI="([^"]+)"/.exec(playlist)?.[1];
    const { segments, duration } = parseSegments(playlist);
    const at = firstClipTime(duration);
    const firstClip = [...segments].reverse().find((s) => s.start <= at)?.uri;
    await Promise.all(
      [init, firstClip]
        .filter((uri): uri is string => Boolean(uri))
        .map((uri) => fetch(new URL(uri, playlistUrl)).catch(() => {}))
    );
  } catch {
    prefetched.delete(src);
  }
}

/**
 * Prefetching only makes sense for visitors with a mouse (hover previews),
 * and never when they've asked to save data. Resolves on the first mouse
 * movement, so phones and tablets never prefetch.
 */
let mouseUser: Promise<void> | null = null;
function whenMouseUser(): Promise<void> {
  if (!mouseUser) {
    mouseUser = new Promise((resolve) => {
      const saveData = (
        navigator as Navigator & { connection?: { saveData?: boolean } }
      ).connection?.saveData;
      if (saveData) return;
      const onMove = (e: PointerEvent) => {
        if (e.pointerType !== 'mouse') return;
        window.removeEventListener('pointermove', onMove);
        resolve();
      };
      window.addEventListener('pointermove', onMove);
    });
  }
  return mouseUser;
}

/**
 * A muted, looping highlights preview drawn over a card's thumbnail while the
 * card is the listing's active one (the first card on load). Hovering
 * anywhere on a card makes it active and stops the previous one. Recently
 * used previews stay loaded, paused, so returning to them is instant; the
 * thumbnail shows until frames exist.
 */
export default function CardPreview({
  id,
  src,
  showPlayButton = true,
}: CardPreviewProps) {
  const preview = useVideoPreview();
  const reducedMotion = useReducedMotion();
  const anchorRef = useRef<HTMLSpanElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  /** Which highlight clip the preview is on (kept while paused-but-warm). */
  const clipRef = useRef(0);
  const [hasFrames, setHasFrames] = useState(false);
  // Listings render a layout per screen size and hide the others; only the
  // copy of this card that's actually displayed may preview.
  const [isDisplayed, setIsDisplayed] = useState(false);

  const setActiveId = preview?.setActiveId;
  const clearActiveId = preview?.clearActiveId;
  const canPreview = Boolean(preview && src && !reducedMotion && isDisplayed);
  const isActive = canPreview && preview?.activeId === id;
  const isMounted = canPreview && Boolean(preview?.warmIds.includes(id));

  useEffect(() => {
    const card = anchorRef.current?.closest('a');
    if (!card) return undefined;
    // A display:none card has no boxes; its size changes when it's shown.
    const update = () => setIsDisplayed(card.getClientRects().length > 0);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(card);
    return () => observer.disconnect();
  }, []);

  // The preview plays only while the mouse is on the card (thumbnail or
  // title), and stops when it leaves. Even a card that can't preview (still
  // processing) takes the focus, so hovering it stops whatever was playing.
  useEffect(() => {
    const card = anchorRef.current?.closest('a');
    if (!card || !setActiveId || !clearActiveId) return undefined;

    const onEnter = () => setActiveId(id);
    const onLeave = () => clearActiveId(id);
    card.addEventListener('mouseenter', onEnter);
    card.addEventListener('mouseleave', onLeave);
    return () => {
      card.removeEventListener('mouseenter', onEnter);
      card.removeEventListener('mouseleave', onLeave);
    };
  }, [id, setActiveId, clearActiveId]);

  // Cards on (or near) screen get their first clip fetched in advance.
  useEffect(() => {
    const card = anchorRef.current?.closest('a');
    if (!card || !src || !canPreview) return undefined;

    let cancelled = false;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        whenMouseUser().then(() => {
          if (!cancelled) prefetchStart(src);
        });
      },
      { rootMargin: '200px' }
    );
    observer.observe(card);
    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [src, canPreview]);

  // Attach the stream once while mounted (active or kept warm).
  useEffect(() => {
    const video = videoRef.current;
    if (!isMounted || !video || !src) return undefined;

    let cancelled = false;

    // Prefer hls.js wherever Media Source is available — including Chrome,
    // which now plays HLS natively too, but natively we can't drop the audio
    // track, cap the quality, reuse prefetched files or stop buffering.
    // Native playback is only the fallback (e.g. older iPhones).
    Promise.all([import('hls.js'), firstClipStart(src)]).then(
      ([{ default: HlsClass }, startPosition]) => {
        if (cancelled) return;
        if (!HlsClass.isSupported()) {
          if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = src;
          }
          return;
        }

        // Same request as the prefetch (so it's served from cache), with the
        // audio rendition removed from the master playlist on arrival.
        const BaseLoader = HlsClass.DefaultConfig.loader;
        class VideoOnlyLoader extends BaseLoader {
          load(
            ...[context, config, callbacks]: Parameters<
              InstanceType<typeof BaseLoader>['load']
            >
          ) {
            const { onSuccess } = callbacks;
            super.load(context, config, {
              ...callbacks,
              onSuccess: (response, stats, ctx, details) => {
                if (
                  typeof response.data === 'string' &&
                  response.data.includes('#EXT-X-STREAM-INF')
                ) {
                  response.data = stripAudio(response.data);
                }
                onSuccess(response, stats, ctx, details);
              },
            });
          }
        }

        const instance = new HlsClass({
          // Playlist-loader typing is narrower than the base Loader class it is.
          pLoader: VideoOnlyLoader as unknown as HlsConfig['pLoader'],
          // Smallest rendition only, no bandwidth probe: the card is ~290px
          // wide, so first frames matter far more than quality.
          startLevel: 0,
          testBandwidth: false,
          // Begin at the first highlight clip, not the opening.
          startPosition,
          startFragPrefetch: true,
          maxBufferLength: 4,
          maxMaxBufferLength: 8,
          backBufferLength: 0,
        });
        instance.on(HlsClass.Events.MANIFEST_PARSED, () => {
          instance.autoLevelCapping = 0;
        });
        instance.on(HlsClass.Events.ERROR, (_event, data) => {
          // e.g. a stream deleted on Cloudflare: give up, keep the thumbnail.
          if (data.fatal) instance.destroy();
        });
        instance.loadSource(src);
        instance.attachMedia(video);
        hlsRef.current = instance;
      }
    );

    return () => {
      cancelled = true;
      hlsRef.current?.destroy();
      hlsRef.current = null;
      video.pause();
      video.removeAttribute('src');
      video.load();
      setHasFrames(false);
    };
  }, [isMounted, src]);

  // Play (muted) only while active. Warm ones pause where they left off and
  // stop downloading, so they never compete with the preview being watched.
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isMounted) return undefined;

    if (!isActive) {
      video.pause();
      hlsRef.current?.stopLoad();
      return undefined;
    }

    hlsRef.current?.startLoad(-1);
    video.play().catch(() => {});

    // Highlights: 3s from each clip point, then on to the next, looping.
    // Short videos (and ones whose length isn't known yet) play straight.
    const clipStart = (duration: number) =>
      duration * CLIP_STARTS[clipRef.current];
    const stepClips = () => {
      const { duration, currentTime } = video;
      if (!Number.isFinite(duration) || duration < MIN_HIGHLIGHT_DURATION) {
        return;
      }
      const start = clipStart(duration);
      if (currentTime >= start + CLIP_SECONDS) {
        clipRef.current = (clipRef.current + 1) % CLIP_STARTS.length;
        video.currentTime = clipStart(duration);
      } else if (currentTime < start - 1) {
        // Started elsewhere (e.g. native playback from 0): go to the clip.
        video.currentTime = start;
      }
    };
    stepClips();
    video.addEventListener('timeupdate', stepClips);
    video.addEventListener('loadedmetadata', stepClips);
    return () => {
      video.removeEventListener('timeupdate', stepClips);
      video.removeEventListener('loadedmetadata', stepClips);
    };
  }, [isActive, isMounted]);

  return (
    <>
      {/* Locates the card element; renders nothing visible. */}
      <span
        ref={anchorRef}
        hidden
      />
      {isMounted && (
        <video
          ref={videoRef}
          // Previews are always silent (and muted video may always autoplay).
          muted
          autoPlay={isActive}
          loop
          playsInline
          preload='auto'
          aria-hidden='true'
          tabIndex={-1}
          onPlaying={() => setHasFrames(true)}
          onCanPlay={() => {
            const video = videoRef.current;
            if (isActive && video?.paused) video.play().catch(() => {});
          }}
          className={`pointer-events-none absolute inset-0 size-full object-cover transition-opacity duration-200 ${
            hasFrames && isActive ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}
      {/* Figma "play / pause": on every idle video card, gone while its
          preview plays. 24px on phones/tablets, 40px on desktop. */}
      {showPlayButton && (
        <span
          aria-hidden
          className={`pointer-events-none absolute top-1/2 left-1/2 size-6 -translate-x-1/2 -translate-y-1/2 rounded-full backdrop-blur-xs transition-opacity duration-200 lg:size-10 ${
            hasFrames && isActive ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <Image
            src={playIcon}
            alt=''
            fill
            unoptimized
          />
        </span>
      )}
    </>
  );
}
