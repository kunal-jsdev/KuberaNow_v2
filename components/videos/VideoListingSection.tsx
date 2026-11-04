import ShortsCard from './ShortsCard';
import type { VideoCardData } from './types';
import VideoCard from './VideoCard';
import { VideoPreviewProvider } from './VideoPreviewContext';
import VideoSection from './VideoSection';
import VideoSectionHeader from './VideoSectionHeader';

/** Following the design: a shorts row after the first grid, then every two grids. */
const GRIDS_BETWEEN_SHORTS = 2;

/**
 * Section sizes differ per screen (Figma): phones 2×2 videos and shorts rows
 * of 2, tablets 2×4 and rows of 4, desktop 2×3 and rows of 3. A section box
 * wraps its own group of cards, so CSS can't regroup them — each layout is
 * rendered and only the one for the current screen is displayed. (Hidden
 * layouts' lazy images never download, and previews only run when visible.)
 */
const LAYOUTS = [
  {
    key: 'phone',
    visibility: 'md:hidden',
    videosPerGrid: 4,
    shortsPerRow: 2,
    videoGrid: 'grid-cols-2 gap-x-3 gap-y-4',
    shortsGrid: 'grid-cols-2 gap-4',
  },
  {
    key: 'tablet',
    visibility: 'hidden md:block lg:hidden',
    videosPerGrid: 8,
    shortsPerRow: 4,
    videoGrid: 'grid-cols-4 gap-4',
    shortsGrid: 'grid-cols-4 gap-4',
  },
  {
    key: 'desktop',
    visibility: 'hidden lg:block',
    videosPerGrid: 6,
    shortsPerRow: 3,
    videoGrid: 'grid-cols-3 gap-5',
    shortsGrid: 'grid-cols-3 gap-x-5 gap-y-6',
  },
] as const;

type Layout = (typeof LAYOUTS)[number];

type VideoListingSectionProps = {
  videos: VideoCardData[];
  shorts: VideoCardData[];
  /** Heading over the first video grid: "Videos" on the listing page. */
  heading?: string;
  /** h1 on the listing; h2 on a detail page, where the video title is h1. */
  headingAs?: 'h1' | 'h2';
  /** Card previews: a hovered card plays its (muted) highlights. */
  previewPlayback?: boolean;
  /**
   * Also preview the first video on load (the /videos page). Off on a detail
   * page, where the main video is already playing above.
   */
  autoplayFirst?: boolean;
  /** Shorts rows to show at most (the listing has 2, a detail page 1). */
  maxShortsSections?: number;
  mobileInterleave?: boolean;
};

type Block =
  | { type: 'videos'; items: VideoCardData[] }
  | { type: 'shorts'; items: VideoCardData[] };

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

function buildBlocks(
  videos: VideoCardData[],
  shorts: VideoCardData[],
  layout: Layout,
  maxShortsSections: number
): Block[] {
  const videoGrids = chunk(videos, layout.videosPerGrid);
  const shortsRows = chunk(
    shorts.slice(0, layout.shortsPerRow * maxShortsSections),
    layout.shortsPerRow
  );
  const blocks: Block[] = [];

  const [firstGrid, ...restGrids] = videoGrids;
  if (firstGrid) blocks.push({ type: 'videos', items: firstGrid });

  while (restGrids.length > 0 || shortsRows.length > 0) {
    const row = shortsRows.shift();
    if (row) blocks.push({ type: 'shorts', items: row });

    restGrids.splice(0, GRIDS_BETWEEN_SHORTS).forEach((items) => {
      blocks.push({ type: 'videos', items });
    });
  }

  return blocks;
}

export default function VideoListingSection({
  videos,
  shorts,
  heading = 'Videos',
  headingAs = 'h1',
  previewPlayback = false,
  autoplayFirst = true,
  maxShortsSections = 2,
  mobileInterleave = false,
}: VideoListingSectionProps) {
  const renderLayout = (layout: Layout) => {
    const blocks = buildBlocks(videos, shorts, layout, maxShortsSections);
    const firstVideoBlock = blocks.findIndex(
      (block) => block.type === 'videos'
    );
    const interleave = mobileInterleave && layout.key === 'phone';

    return (
      <div
        key={layout.key}
        className={`w-full ${layout.visibility} ${interleave ? 'max-md:contents' : ''}`}
      >
        <div
          data-mobile-interleave={interleave || undefined}
          className='flex w-full flex-col gap-6'
        >
          {/* Keep an h1 on the page even when only shorts are published. */}
          {headingAs === 'h1' &&
            firstVideoBlock === -1 &&
            blocks.length > 0 && <h1 className='sr-only'>{heading}</h1>}

          {headingAs === 'h1' && blocks.length === 0 && (
            <VideoSection>
              <VideoSectionHeader
                title={heading}
                as='h1'
              />
              <p className='text-text-muted text-sm'>
                No videos published yet.
              </p>
            </VideoSection>
          )}

          {blocks.map((block, index) => {
            if (block.type === 'shorts') {
              return (
                <VideoSection key={`shorts-${block.items[0].id}`}>
                  <VideoSectionHeader
                    title='Shorts'
                    moreHref='/short-videos'
                  />
                  <div className={`grid ${layout.shortsGrid}`}>
                    {block.items.map((video) => (
                      <ShortsCard
                        key={video.id}
                        video={video}
                      />
                    ))}
                  </div>
                </VideoSection>
              );
            }

            const isFirstVideoBlock = index === firstVideoBlock;

            return (
              <VideoSection key={`videos-${block.items[0].id}`}>
                {isFirstVideoBlock && (
                  <VideoSectionHeader
                    title={heading}
                    as={headingAs}
                  />
                )}
                <div className={`grid ${layout.videoGrid}`}>
                  {block.items.map((video, videoIndex) => (
                    <VideoCard
                      key={video.id}
                      video={video}
                      priority={isFirstVideoBlock && videoIndex < 3}
                    />
                  ))}
                </div>
              </VideoSection>
            );
          })}
        </div>
      </div>
    );
  };

  const content = <>{LAYOUTS.map(renderLayout)}</>;

  if (!previewPlayback) return content;

  // Start with the first video that can actually play (one still processing
  // on Cloudflare has no stream yet).
  const firstPlayableId = autoplayFirst
    ? (videos.find((video) => video.videoSource === 'upload' && video.hlsUrl)
        ?.id ?? null)
    : null;

  return (
    <VideoPreviewProvider initialActiveId={firstPlayableId}>
      {content}
    </VideoPreviewProvider>
  );
}
