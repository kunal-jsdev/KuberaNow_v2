'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { fetchMoreShorts } from '@/app/(frontend)/actions/videoActions';

import ShortsCard from './ShortsCard';
import type { VideoCardData } from './types';
import { VideoPreviewProvider } from './VideoPreviewContext';
import VideoSection from './VideoSection';
import VideoSectionHeader from './VideoSectionHeader';

/**
 * Each section is full rows only; only the first has a heading. Like
 * /videos, every breakpoint gets its own copy of the grid, toggled with CSS
 * (no layout flash on load); only the visible copy's previews play.
 * - Phone: 3 rows of 2. Desktop (Figma): 2 rows of 3. Same 6 per section,
 *   so they share one copy.
 * - Tablet: 2 rows of 4.
 */
const LAYOUTS = [
  {
    key: 'phone-desktop',
    className: 'flex md:hidden lg:flex',
    perSection: 6,
    // 20px between columns, 24px between rows on desktop (Figma).
    grid: 'grid-cols-2 gap-4 lg:grid-cols-3 lg:gap-x-5 lg:gap-y-6',
  },
  {
    key: 'tablet',
    className: 'hidden md:flex lg:hidden',
    perSection: 8,
    grid: 'grid-cols-4 gap-4',
  },
] as const;

/** 24 divides into both section sizes, so every loaded batch fills its sections. */
const BATCH_SIZE = 24;

type ShortsListingSectionProps = {
  initialShorts: VideoCardData[];
  initialHasMore: boolean;
  mobileInterleave?: boolean;
};

function chunk<T>(items: T[], size: number): T[][] {
  const groups: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    groups.push(items.slice(i, i + size));
  }
  return groups;
}

export default function ShortsListingSection({
  initialShorts,
  initialHasMore,
  mobileInterleave = false,
}: ShortsListingSectionProps) {
  const [shorts, setShorts] = useState(initialShorts);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isLoading, setIsLoading] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);

    try {
      const res = await fetchMoreShorts({
        excludeIds: shorts.map((video) => video.id),
        limit: BATCH_SIZE,
      });
      setShorts((prev) => {
        const seen = new Set(prev.map((video) => video.id));
        return [...prev, ...res.docs.filter((video) => !seen.has(video.id))];
      });
      setHasMore(res.hasMore && res.docs.length > 0);
    } catch {
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, hasMore, shorts]);

  useEffect(() => {
    if (!loadMoreRef.current || !hasMore) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: '300px' }
    );
    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [loadMore, hasMore]);

  if (shorts.length === 0) {
    return (
      <VideoSection>
        <VideoSectionHeader
          title='Shorts'
          as='h1'
        />
        <p className='text-text-muted text-sm'>No shorts published yet.</p>
      </VideoSection>
    );
  }

  // Same hover previews as /videos: the first playable short starts on load,
  // then whichever short is hovered (others stop).
  const firstPlayableId =
    initialShorts.find(
      (video) => video.videoSource === 'upload' && video.hlsUrl
    )?.id ?? null;

  return (
    <VideoPreviewProvider initialActiveId={firstPlayableId}>
      <div
        className={`flex w-full flex-col gap-6 ${mobileInterleave ? 'max-md:contents' : ''}`}
      >
        {LAYOUTS.map((layout) => (
          <div
            key={layout.key}
            data-mobile-interleave={
              (mobileInterleave && layout.key === 'phone-desktop') || undefined
            }
            className={`${layout.className} w-full flex-col gap-6`}
          >
            {chunk(shorts, layout.perSection).map((group, index) => (
              <VideoSection key={group[0].id}>
                {index === 0 && (
                  <VideoSectionHeader
                    title='Shorts'
                    as='h1'
                  />
                )}
                <div className={`grid ${layout.grid}`}>
                  {group.map((video) => (
                    <ShortsCard
                      key={video.id}
                      video={video}
                    />
                  ))}
                </div>
              </VideoSection>
            ))}
          </div>
        ))}

        {hasMore && (
          <div
            ref={loadMoreRef}
            data-interleave-end
            className='flex h-12 w-full items-center justify-center'
            aria-hidden='true'
          >
            {isLoading && (
              <span className='border-career-stroke border-t-primary size-6 animate-spin rounded-full border-2' />
            )}
          </div>
        )}
      </div>
    </VideoPreviewProvider>
  );
}
