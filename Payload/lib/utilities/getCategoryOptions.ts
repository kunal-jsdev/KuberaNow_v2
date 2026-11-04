import { cache } from 'react';

import configPromise from '@payload-config';
import { getPayload } from 'payload';

import type { CategoryOption } from '@/Payload/types';

export const getCategoryOptions = cache(async (): Promise<CategoryOption[]> => {
  const payload = await getPayload({ config: configPromise });

  try {
    const { docs } = await payload.find({
      collection: 'news-categories',
      limit: 100,
      overrideAccess: false,
      pagination: false,
      sort: 'title',
      depth: 0,
      select: { title: true, slug: true },
    });

    return docs
      .filter((doc) => Boolean(doc.slug))
      .map((doc) => ({ title: doc.title, slug: doc.slug as string }));
  } catch (err) {
    payload.logger.error({ err }, 'Failed to load category options');
    return [];
  }
});
