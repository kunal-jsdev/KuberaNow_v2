'use server';

import configPromise from '@payload-config';
import { getPayload, type Where } from 'payload';

import { buildArticleHref } from '@/Payload/lib/utilities/articleId';
import { NewsCategory } from '@/payload-types';

const SEARCH_RESULTS_LIMIT = 5;

export type SearchNewsItem = {
  id: string;
  title: string;
  slug: string;
  categoryTitle: string;
  categorySlug: string;
  /** Ready-built article path, id-suffixed when the article has one. */
  href: string;
};

export async function searchNews(
  query: string,
  categorySlug: string = 'all',
  limit: number = SEARCH_RESULTS_LIMIT
): Promise<SearchNewsItem[]> {
  const payload = await getPayload({ config: configPromise });
  const term = query.trim();

  const conditions: Where[] = [];

  if (term) {
    conditions.push({ title: { contains: term } });
  }

  if (categorySlug && categorySlug !== 'all') {
    conditions.push({ 'category.slug': { equals: categorySlug } });
  }

  try {
    const { docs } = await payload.find({
      collection: 'news',
      where: conditions.length > 0 ? { and: conditions } : {},
      limit,
      depth: 1,
      sort: '-publishedAt',
      pagination: false,
      overrideAccess: false,
      select: {
        title: true,
        slug: true,
        category: true,
        article_id: true,
      },
    });

    return docs.map(toItem);
  } catch (err) {
    payload.logger.error({ err, query, categorySlug }, 'Failed to search news');
    return [];
  }
}

function toItem(doc: {
  id: string;
  title: string;
  slug?: string | null;
  category?: unknown;
  article_id?: string | null;
}): SearchNewsItem {
  const category = doc.category as NewsCategory;
  // doc.category && typeof doc.category === 'object' && doc.category;

  return {
    id: String(doc.id),
    title: doc.title,
    slug: doc.slug ?? '',
    categoryTitle: category.title,
    categorySlug: category.slug,
    href: buildArticleHref(category.slug, doc.slug, doc.article_id) ?? '',
  };
}
