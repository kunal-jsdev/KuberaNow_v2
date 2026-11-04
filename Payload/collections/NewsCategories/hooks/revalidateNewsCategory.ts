import { revalidatePath } from 'next/cache';
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
} from 'payload';

import type { NewsCategory } from '../../../../payload-types';

/** Paths must be encoded to match the cache key Next assigns prerendered entries. */
const categoryListingPath = (slug: string): string =>
  `/${encodeURIComponent(slug)}`;

const revalidateCategory = (
  doc: Partial<NewsCategory> | null | undefined,
  logger: { info: (msg: string) => void }
): void => {
  if (doc?.slug) {
    const path = categoryListingPath(doc.slug);
    logger.info(`Revalidating news category at path: ${path}`);
    revalidatePath(path, 'page');
  }

  revalidatePath('/', 'layout');
};

export const revalidateNewsCategory: CollectionAfterChangeHook<
  NewsCategory
> = ({ doc, previousDoc, req: { payload, context } }) => {
  if (context.disableRevalidate) return doc;

  try {
    revalidateCategory(doc, payload.logger);

    if (previousDoc?.slug && previousDoc.slug !== doc.slug) {
      const oldPath = categoryListingPath(previousDoc.slug);
      payload.logger.info(`Revalidating old news category path: ${oldPath}`);
      revalidatePath(oldPath, 'page');
    }
  } catch (err) {
    payload.logger.error({ err }, 'Failed to revalidate news category');
  }

  return doc;
};

export const revalidateNewsCategoryDelete: CollectionAfterDeleteHook<
  NewsCategory
> = ({ doc, req: { payload, context } }) => {
  if (context.disableRevalidate) return doc;

  try {
    revalidateCategory(doc, payload.logger);
  } catch (err) {
    payload.logger.error({ err }, 'Failed to revalidate deleted news category');
  }

  return doc;
};
