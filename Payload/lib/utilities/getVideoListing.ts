import configPromise from '@payload-config';
import { getPayload, type Where } from 'payload';

import type { VideoCardData } from '@/components/videos/types';
import type { Video } from '@/payload-types';

type VideoRatio = '16:9' | '9:16';

const videoCardSelect = {
  slug: true,
  title: true,
  description: true,
  category: true,
  videoThumbnail: true,
  thumbnailUrl: true,
  hlsUrl: true,
  videoSource: true,
  video_id: true,
} as const;

function onlyPublished(
  items: (string | Video)[] | null | undefined
): VideoCardData[] {
  return (items ?? []).filter(
    (item): item is Video =>
      typeof item === 'object' && item._status === 'published'
  );
}

/**
 * Videos of one ratio for a listing: the ones pinned in the `pinned-videos`
 * global first (in the order the editor set), then the rest newest-first.
 */
export async function getVideoListing(
  ratio: VideoRatio,
  limit: number,
  /** e.g. the video being watched, so "You May Like This" never repeats it. */
  excludeIds: string[] = []
): Promise<VideoCardData[]> {
  const payload = await getPayload({ config: configPromise });

  const pinnedGlobal = await payload.findGlobal({
    slug: 'pinned-videos',
    depth: 2,
    overrideAccess: false,
  });

  const pinned = onlyPublished(
    ratio === '16:9'
      ? pinnedGlobal?.horizontalVideos
      : pinnedGlobal?.verticalVideos
  )
    .filter((video) => !excludeIds.includes(video.id))
    .slice(0, limit);
  const skipIds = [...excludeIds, ...pinned.map((video) => video.id)];

  const remaining = limit - pinned.length;
  if (remaining <= 0) return pinned;

  const where: Where = {
    and: [
      { ratio: { equals: ratio } },
      ...(skipIds.length > 0 ? [{ id: { not_in: skipIds } }] : []),
    ],
  };

  const { docs } = await payload.find({
    collection: 'videos',
    draft: false,
    overrideAccess: false,
    depth: 1,
    limit: remaining,
    sort: '-createdAt',
    select: videoCardSelect,
    where,
  });

  return [...pinned, ...docs];
}

/**
 * The next batch for infinite scroll: newest-first, skipping everything the
 * page already shows (pinned included), so batches never repeat or skip.
 */
export async function getMoreVideos(
  ratio: VideoRatio,
  limit: number,
  excludeIds: string[]
): Promise<{ docs: VideoCardData[]; hasMore: boolean }> {
  const payload = await getPayload({ config: configPromise });

  const { docs, hasNextPage } = await payload.find({
    collection: 'videos',
    draft: false,
    overrideAccess: false,
    depth: 1,
    limit,
    sort: '-createdAt',
    select: videoCardSelect,
    where: {
      and: [
        { ratio: { equals: ratio } },
        ...(excludeIds.length > 0 ? [{ id: { not_in: excludeIds } }] : []),
      ],
    },
  });

  return { docs, hasMore: hasNextPage };
}

/**
 * Latest videos of one ratio in one category, newest first — e.g. a detail
 * page's "You May Like This" and Shorts rows for the video being watched.
 */
export async function getLatestInCategory(
  ratio: VideoRatio,
  categoryId: string,
  limit: number,
  excludeIds: string[] = []
): Promise<VideoCardData[]> {
  const payload = await getPayload({ config: configPromise });

  const { docs } = await payload.find({
    collection: 'videos',
    draft: false,
    overrideAccess: false,
    depth: 1,
    limit,
    sort: '-createdAt',
    select: videoCardSelect,
    where: {
      and: [
        { ratio: { equals: ratio } },
        { category: { equals: categoryId } },
        ...(excludeIds.length > 0 ? [{ id: { not_in: excludeIds } }] : []),
      ],
    },
  });

  return docs;
}

/**
 * A detail page's related row: the same category first (an IPO video gets
 * IPO videos), then — when the category runs short — the latest of the rest,
 * so the section never comes up empty.
 */
export async function getRelatedVideos(
  ratio: VideoRatio,
  categoryId: string | null | undefined,
  limit: number,
  excludeIds: string[] = []
): Promise<VideoCardData[]> {
  const sameCategory = categoryId
    ? await getLatestInCategory(ratio, categoryId, limit, excludeIds)
    : [];
  if (sameCategory.length >= limit) return sameCategory;

  const { docs: others } = await getMoreVideos(
    ratio,
    limit - sameCategory.length,
    [...excludeIds, ...sameCategory.map((video) => video.id)]
  );
  return [...sameCategory, ...others];
}
