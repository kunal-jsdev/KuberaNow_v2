import configPromise from '@payload-config';
import { getPayload, type Where } from 'payload';

import type { VideoCardData } from '@/components/videos/types';

export interface InterleavedSectionMedia {
  videos: VideoCardData[];
  hasMoreVideos: boolean;
  moreVideosHref?: string;
  shorts: VideoCardData[];
  hasMoreShorts: boolean;
  moreShortsHref?: string;
}

/** Fewest videos (or shorts) a section needs to be shown at all. */
const MIN_SECTION_ITEMS = 3;

const videoSelect = {
  id: true,
  slug: true,
  title: true,
  category: true,
  videoThumbnail: true,
  thumbnailUrl: true,
  hlsUrl: true,
  videoSource: true,
  video_id: true,
} as const;

interface QueryMediaArgs {
  categoryId?: string | number;
  categorySlug?: string;
  tagId?: string | number;
  tagSlug?: string;
}

export async function getInterleavedMedia({
  categoryId,
  categorySlug,
  tagId,
  tagSlug,
}: QueryMediaArgs = {}): Promise<InterleavedSectionMedia> {
  try {
    const payload = await getPayload({ config: configPromise });

    const videoConditions: Where[] = [
      { ratio: { equals: '16:9' } },
      { _status: { equals: 'published' } },
    ];

    const shortsConditions: Where[] = [
      { ratio: { equals: '9:16' } },
      { _status: { equals: 'published' } },
    ];

    if (categoryId) {
      videoConditions.push({ category: { equals: categoryId } });
      shortsConditions.push({ category: { equals: categoryId } });
    } else if (tagId) {
      videoConditions.push({ tags: { in: [tagId] } });
      shortsConditions.push({ tags: { in: [tagId] } });
    }

    const [videoResult, shortsResult] = await Promise.all([
      payload.find({
        collection: 'videos',
        draft: false,
        overrideAccess: false,
        depth: 1,
        limit: 5,
        sort: '-createdAt',
        select: videoSelect,
        where: { and: videoConditions },
      }),
      payload.find({
        collection: 'videos',
        draft: false,
        overrideAccess: false,
        depth: 1,
        limit: 5,
        sort: '-createdAt',
        select: videoSelect,
        where: { and: shortsConditions },
      }),
    ]);

    // Category / tag pages use only their own videos and shorts (no top-up
    // from other categories). A section needs MIN_SECTION_ITEMS of them,
    // otherwise it is not shown.
    const rawVideos = (videoResult.docs as unknown as VideoCardData[]) || [];
    const totalVideos = videoResult.totalDocs ?? rawVideos.length;

    const rawShorts = (shortsResult.docs as unknown as VideoCardData[]) || [];
    const totalShorts = shortsResult.totalDocs ?? rawShorts.length;

    const videos =
      rawVideos.length >= MIN_SECTION_ITEMS ? rawVideos.slice(0, 4) : [];
    const hasMoreVideos = totalVideos > 3;

    const shorts =
      rawShorts.length >= MIN_SECTION_ITEMS ? rawShorts.slice(0, 4) : [];
    const hasMoreShorts = totalShorts > 3;

    let moreVideosHref = '/videos';
    if (categorySlug) {
      moreVideosHref = `/videos?category=${encodeURIComponent(categorySlug)}`;
    } else if (tagSlug) {
      moreVideosHref = `/videos?tag=${encodeURIComponent(tagSlug)}`;
    }

    let moreShortsHref = '/short-videos';
    if (categorySlug) {
      moreShortsHref = `/short-videos?category=${encodeURIComponent(categorySlug)}`;
    } else if (tagSlug) {
      moreShortsHref = `/short-videos?tag=${encodeURIComponent(tagSlug)}`;
    }

    return {
      videos,
      hasMoreVideos,
      moreVideosHref: hasMoreVideos ? moreVideosHref : undefined,
      shorts,
      hasMoreShorts,
      moreShortsHref: hasMoreShorts ? moreShortsHref : undefined,
    };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error fetching interleaved media:', err);
    return {
      videos: [],
      hasMoreVideos: false,
      shorts: [],
      hasMoreShorts: false,
    };
  }
}
