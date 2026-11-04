'use server';

import configPromise from '@payload-config';
import { getPayload } from 'payload';

export async function trackSearchClick(articleId: string): Promise<void> {
  if (!articleId) {
    return;
  }

  const payload = await getPayload({ config: configPromise });

  try {
    const existing = await payload.find({
      collection: 'news-search-counts',
      where: { article: { equals: articleId } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    });

    const now = new Date().toISOString();
    const current = existing.docs[0];

    if (current) {
      await payload.update({
        collection: 'news-search-counts',
        id: current.id,
        data: { count: (current.count ?? 0) + 1, lastSearchedAt: now },
        overrideAccess: true,
      });
    } else {
      await payload.create({
        collection: 'news-search-counts',
        data: { article: articleId, count: 1, lastSearchedAt: now },
        overrideAccess: true,
      });
    }
  } catch (err) {
    payload.logger.error({ err }, 'Failed to track search click');
  }
}
