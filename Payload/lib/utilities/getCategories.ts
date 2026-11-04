import configPromise from '@payload-config';
import { getPayload } from 'payload';

import type { CategoryOption } from '@/Payload/types';

export type { CategoryOption };

export async function getCategories(): Promise<CategoryOption[]> {
  const payload = await getPayload({ config: configPromise });

  try {
    const result = await payload.find({
      collection: 'news-categories',
      depth: 0,
      sort: 'title',
      pagination: false,
      overrideAccess: false,
      select: {
        title: true,
        slug: true,
      },
    });

    return result.docs;
  } catch (err) {
    payload.logger.error({ err }, 'Failed to load news categories');
    return [];
  }
}
