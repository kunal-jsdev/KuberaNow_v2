'use server';

import type { VideoCardData } from '@/components/videos/types';
import { getMoreVideos } from '@/Payload/lib/utilities/getVideoListing';

const MAX_BATCH = 24;
const MAX_EXCLUDED = 1000;

/**
 * Next batch of shorts for the /short-videos infinite scroll. Callable from
 * the browser, so the inputs are clamped rather than trusted.
 */
export async function fetchMoreShorts({
  excludeIds,
  limit,
}: {
  excludeIds: string[];
  limit: number;
}): Promise<{ docs: VideoCardData[]; hasMore: boolean }> {
  const safeLimit = Math.min(Math.max(Math.trunc(limit) || 1, 1), MAX_BATCH);
  const safeIds = (Array.isArray(excludeIds) ? excludeIds : [])
    .filter((id): id is string => typeof id === 'string' && id.length <= 64)
    .slice(0, MAX_EXCLUDED);

  try {
    return await getMoreVideos('9:16', safeLimit, safeIds);
  } catch {
    return { docs: [], hasMore: false };
  }
}
