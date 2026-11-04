import configPromise from '@payload-config';
import { getPayload } from 'payload';

import type { News } from '@/payload-types';

export const TOP_SEARCHES_LIMIT = 10;

export async function getTopSearches(
  limit: number = TOP_SEARCHES_LIMIT
): Promise<News[]> {
  const payload = await getPayload({ config: configPromise });

  try {
    const counts = await payload.find({
      collection: 'news-search-counts',
      limit: limit * 3,
      depth: 0,
      sort: '-count',
      pagination: false,
      overrideAccess: false,
    });

    const rankedIds = counts.docs
      .map((doc) =>
        typeof doc.article === 'object' ? doc.article?.id : doc.article
      )
      .filter((id): id is string => Boolean(id));

    if (rankedIds.length === 0) {
      return [];
    }

    const articles = await payload.find({
      collection: 'news',
      where: { id: { in: rankedIds } },
      limit,
      depth: 1,
      pagination: false,
      overrideAccess: false,
      select: {
        title: true,
        slug: true,
        category: true,
      },
    });

    const byId = new Map(articles.docs.map((doc) => [String(doc.id), doc]));

    return rankedIds
      .map((id) => byId.get(String(id)))
      .filter((doc): doc is News => Boolean(doc))
      .slice(0, limit);
  } catch (err) {
    payload.logger.error({ err }, 'Failed to load top searches');
    return [];
  }
}
