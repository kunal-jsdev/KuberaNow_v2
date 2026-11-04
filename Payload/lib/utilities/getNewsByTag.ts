import configPromise from '@payload-config';
import { getPayload } from 'payload';

import type { NewsCardItem } from './getNewsByCategory';

export const NEWS_BY_TAG_LIMIT = 12;

export async function getNewsByTag(
  tagSlug: string,
  limit: number = NEWS_BY_TAG_LIMIT
): Promise<NewsCardItem[]> {
  if (!tagSlug) {
    return [];
  }

  const payload = await getPayload({ config: configPromise });

  try {
    const result = await payload.find({
      collection: 'news',
      draft: false,
      where: {
        and: [
          { _status: { equals: 'published' } },
          { 'tags.slug': { equals: tagSlug } },
        ],
      },
      limit,
      depth: 1,
      sort: '-publishedAt',
      pagination: false,
      overrideAccess: false,
      select: {
        title: true,
        slug: true,
        heroImage: true,
        category: true,
        publishedAt: true,
        article_id: true,
      },
    });

    return result.docs;
  } catch (err) {
    payload.logger.error({ err, tagSlug }, 'Failed to load news by tag');
    return [];
  }
}
