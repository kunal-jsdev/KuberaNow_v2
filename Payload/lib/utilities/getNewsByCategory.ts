import configPromise from '@payload-config';
import { getPayload } from 'payload';

import type { News } from '@/payload-types';

export const NEWS_BY_CATEGORY_LIMIT = 12;

export type NewsCardItem = Pick<
  News,
  | 'id'
  | 'title'
  | 'slug'
  | 'heroImage'
  | 'category'
  | 'publishedAt'
  | 'article_id'
>;

export async function getNewsByCategory(
  categorySlug: string,
  limit: number = NEWS_BY_CATEGORY_LIMIT
): Promise<NewsCardItem[]> {
  if (!categorySlug) {
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
          { 'category.slug': { equals: categorySlug } },
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
    payload.logger.error(
      { err, categorySlug },
      'Failed to load news by category'
    );
    return [];
  }
}
