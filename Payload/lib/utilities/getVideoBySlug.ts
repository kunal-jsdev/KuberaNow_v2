import { cache } from 'react';

import configPromise from '@payload-config';
import { getPayload } from 'payload';

import type { Video } from '@/payload-types';

import { splitVideoSegment, videoIdVariants } from './videoId';

/**
 * One video by URL segment (canonical `{slug}-{videoId}`, pure `{videoId}`,
 * or plain `{slug}`), shared by a detail page's metadata and body (`cache`
 * dedupes the query per request). `draft` serves CMS preview.
 */
export const getVideoBySlug = cache(
  async (segment: string, draft = false): Promise<Video | null> => {
    const payload = await getPayload({ config: configPromise });
    const { slug, videoId } = splitVideoSegment(segment);

    if (videoId) {
      const { docs } = await payload.find({
        collection: 'videos',
        draft,
        overrideAccess: draft,
        depth: 1,
        limit: 1,
        pagination: false,
        where: { video_id: { in: videoIdVariants(videoId) } },
      });

      if (docs[0]) return docs[0];
    }

    if (slug) {
      const { docs } = await payload.find({
        collection: 'videos',
        draft,
        overrideAccess: draft,
        depth: 1,
        limit: 1,
        pagination: false,
        where: { slug: { equals: slug } },
      });

      if (docs[0]) return docs[0];
    }

    return null;
  }
);

/**
 * The video behind a `/{videoId}` short link -- just what's needed to send the
 * visitor on to its slug URL.
 */
export const getVideoByVideoId = cache(
  async (
    videoId: string,
    draft = false
  ): Promise<Pick<Video, 'slug' | 'ratio' | 'video_id'> | null> => {
    const payload = await getPayload({ config: configPromise });

    const { docs } = await payload.find({
      collection: 'videos',
      draft,
      overrideAccess: draft,
      depth: 0,
      limit: 1,
      pagination: false,
      select: { slug: true, ratio: true, video_id: true },
      where: { video_id: { in: videoIdVariants(videoId) } },
    });

    return docs[0] ?? null;
  }
);
