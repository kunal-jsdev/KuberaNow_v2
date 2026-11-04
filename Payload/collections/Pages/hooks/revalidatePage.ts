import { revalidatePath, revalidateTag } from 'next/cache';
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
} from 'payload';

import type { Page } from '@/payload-types';

/** See the note in News/hooks/revalidateNews.ts — paths must be encoded to
 * match the cache key Next assigns prerendered entries. */
const pagePath = (slug?: string | null): string =>
  !slug || slug === 'home' ? '/' : `/${encodeURIComponent(slug)}`;

export const revalidatePage: CollectionAfterChangeHook<Page> = ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    try {
      if (doc._status === 'published') {
        const path = doc.slug === 'home' ? '/' : `/${doc.slug}`;

        payload.logger.info(`Revalidating page at path: ${path}`);

        revalidatePath(path);
        revalidateTag(`page-${doc.slug}`, 'max');
        revalidateTag('pages-sitemap', 'max');
      }

      const wasUnpublished =
        previousDoc?._status === 'published' && doc._status !== 'published';
      const slugChanged =
        previousDoc?._status === 'published' && previousDoc.slug !== doc.slug;

      if (wasUnpublished || slugChanged) {
        const oldPath =
          previousDoc.slug === 'home' ? '/' : `/${previousDoc.slug}`;

        payload.logger.info(`Revalidating old page at path: ${oldPath}`);

        revalidatePath(oldPath);
        revalidateTag(`page-${previousDoc.slug}`, 'max');
        revalidateTag('pages-sitemap', 'max');
      }
    } catch (err) {
      payload.logger.error({ err }, 'Failed to revalidate page');
    }
  }

  return doc;
};

export const revalidateDelete: CollectionAfterDeleteHook<Page> = ({
  doc,
  req: { payload, context },
}) => {
  if (context.disableRevalidate) return doc;

  try {
    revalidatePath(pagePath(doc?.slug), 'page');
  } catch (err) {
    payload.logger.error({ err }, 'Failed to revalidate deleted page');
  }

  return doc;
};
