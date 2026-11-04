import { revalidatePath, revalidateTag } from 'next/cache';
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
} from 'payload';

import type { Sidebar } from '@/payload-types';

export const sidebarTag = (pageSlug: string) => `sidebar-${pageSlug}`;

export const revalidateSidebar: CollectionAfterChangeHook<Sidebar> = ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    try {
      if (doc._status === 'published' && doc.pageSlug) {
        payload.logger.info(`Revalidating sidebar for: ${doc.pageSlug}`);
        revalidateTag(sidebarTag(doc.pageSlug), 'max');
      }

      // Purge the old slug too when it stops pointing at this sidebar.
      const wasUnpublished =
        previousDoc?._status === 'published' && doc._status !== 'published';
      const slugChanged =
        previousDoc?._status === 'published' &&
        previousDoc.pageSlug !== doc.pageSlug;

      if ((wasUnpublished || slugChanged) && previousDoc.pageSlug) {
        revalidateTag(sidebarTag(previousDoc.pageSlug), 'max');
      }
      revalidatePath('/', 'layout');
    } catch (err) {
      payload.logger.error({ err }, 'Failed to revalidate sidebar');
    }
  }

  return doc;
};

export const revalidateSidebarDelete: CollectionAfterDeleteHook<Sidebar> = ({
  doc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    try {
      if (doc?.pageSlug) {
        revalidateTag(sidebarTag(doc.pageSlug), 'max');
      }
      revalidatePath('/', 'layout');
    } catch (err) {
      payload.logger.error({ err }, 'Failed to revalidate deleted sidebar');
    }
  }

  return doc;
};
