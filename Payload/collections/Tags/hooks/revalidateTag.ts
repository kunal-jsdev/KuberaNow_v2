import {
  revalidatePath,
  revalidateTag as revalidateCacheTag,
} from 'next/cache';
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  Payload,
} from 'payload';

import type { Tag } from '@/payload-types';

import { buildArticleHref } from '../../../lib/utilities/articleId';

const revalidateArticlesUsingTag = async (
  tagId: string,
  payload: Payload
): Promise<void> => {
  try {
    const { docs } = await payload.find({
      collection: 'news',
      depth: 1,
      limit: 0,
      pagination: false,
      overrideAccess: true,
      where: {
        tags: { in: [tagId] },
        _status: { equals: 'published' },
      },
      select: { slug: true, category: true, article_id: true },
    });

    const paths: string[] = [];

    for (const article of docs) {
      const categorySlug =
        article.category &&
        typeof article.category === 'object' &&
        'slug' in article.category
          ? article.category.slug
          : null;

      if (!categorySlug || !article.slug) continue;

      const path = buildArticleHref(
        categorySlug,
        article.slug,
        article.article_id
      );

      if (path) {
        const identifier = article.article_id || article.slug;
        revalidateCacheTag(`news-${identifier}`, 'max');
        revalidatePath(path, 'page');
        paths.push(path);
      }
    }

    payload.logger.info(
      paths.length
        ? `Revalidated tag usage on: ${paths.join(', ')}`
        : 'Tag changed; no published article uses it'
    );
  } catch (err) {
    payload.logger.error({ err }, 'Failed to revalidate articles for tag');
  }
};

export const revalidateTagChange: CollectionAfterChangeHook<Tag> = async ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  const titleChanged = previousDoc && previousDoc.title !== doc.title;
  const slugChanged = previousDoc && previousDoc.slug !== doc.slug;
  const metaChanged =
    JSON.stringify(previousDoc?.meta) !== JSON.stringify(doc.meta);

  if (
    !context.disableRevalidate &&
    (titleChanged || slugChanged || metaChanged || !previousDoc)
  ) {
    await revalidateArticlesUsingTag(String(doc.id), payload);
  }

  return doc;
};

export const revalidateTagDelete: CollectionAfterDeleteHook<Tag> = async ({
  doc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    await revalidateArticlesUsingTag(String(doc.id), payload);
  }

  return doc;
};
