'use server';

import configPromise from '@payload-config';
import { getPayload } from 'payload';

import type { NewsCardData } from '@/components/news/NewsCard';
import { isLiveBlogActive } from '@/lib/utils/liveBlog';
import { buildArticleHref } from '@/Payload/lib/utilities/articleId';
import { getMediaUrl } from '@/Payload/lib/utilities/getMediaUrl';

const newsCardSelect = {
  slug: true,
  title: true,
  summary: true,
  heroImage: true,
  category: true,
  article_id: true,
} as const;

export type HomeNewsCardItem = {
  id: string | number;
  image: string;
  category: string;
  categorySlug?: string;
  headline: string;
  description: string;
  link?: string;
  isLive?: boolean;
};

export async function fetchMoreHomeNews({
  page = 2,
  limit = 32,
  pinnedIds = [],
}: {
  page: number;
  limit?: number;
  pinnedIds?: (string | number)[];
}) {
  try {
    const payload = await getPayload({ config: configPromise });

    const whereClause: any = {
      _status: {
        equals: 'published',
      },
    };

    if (pinnedIds && pinnedIds.length > 0) {
      whereClause.id = { not_in: pinnedIds };
    }

    const result = await payload.find({
      collection: 'news',
      draft: false,
      where: whereClause,
      limit,
      page,
      sort: '-publishedAt',
      depth: 2,
    });

    const docs: HomeNewsCardItem[] = (result.docs || []).map((article: any) => {
      const heroImage =
        article?.heroImage && typeof article.heroImage === 'object'
          ? article.heroImage
          : null;
      const category =
        article?.category && typeof article.category === 'object'
          ? article.category
          : null;

      const mediaUrl = heroImage?.url || getMediaUrl(heroImage) || '';

      return {
        id: article.id,
        image: mediaUrl,
        category: category?.title || '',
        categorySlug: category?.slug || undefined,
        headline: article.title || '',
        description: article.summary || '',
        link:
          buildArticleHref(
            category?.slug,
            article?.slug,
            article?.article_id
          ) ?? undefined,
        isLive: isLiveBlogActive(article),
      };
    });

    return {
      docs,
      hasNextPage: result.hasNextPage,
      nextPage: result.nextPage,
    };
  } catch {
    throw new Error('Failed to load more news');
  }
}

export async function fetchMoreCategoryNews({
  page = 2,
  limit = 32,
  categoryId,
  pinnedIds = [],
}: {
  page: number;
  limit?: number;
  categoryId: string | number;
  pinnedIds?: (string | number)[];
}) {
  try {
    const payload = await getPayload({ config: configPromise });

    const whereClause: any = {
      _status: {
        equals: 'published',
      },
    };

    if (categoryId) {
      whereClause.category = {
        equals: categoryId,
      };
    }

    if (pinnedIds && pinnedIds.length > 0) {
      whereClause.id = { not_in: pinnedIds };
    }

    const result = await payload.find({
      collection: 'news',
      draft: false,
      where: whereClause,
      limit,
      page,
      sort: '-publishedAt',
      depth: 1,
      select: newsCardSelect,
    });

    return {
      docs: (result.docs || []) as NewsCardData[],
      hasNextPage: result.hasNextPage,
      nextPage: result.nextPage,
    };
  } catch {
    throw new Error('Failed to load more news');
  }
}

export async function fetchMoreTagNews({
  page = 2,
  limit = 32,
  tagId,
}: {
  page: number;
  limit?: number;
  tagId: string | number;
}) {
  try {
    const payload = await getPayload({ config: configPromise });

    const result = await payload.find({
      collection: 'news',
      draft: false,
      overrideAccess: false,
      where: {
        and: [{ _status: { equals: 'published' } }, { tags: { in: [tagId] } }],
      },
      limit,
      page,
      sort: '-publishedAt',
      depth: 1,
      select: newsCardSelect,
    });

    return {
      docs: (result.docs || []) as NewsCardData[],
      hasNextPage: result.hasNextPage,
      nextPage: result.nextPage,
    };
  } catch {
    throw new Error('Failed to load more news');
  }
}
