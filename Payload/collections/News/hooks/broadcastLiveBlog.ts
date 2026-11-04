import type { CollectionAfterChangeHook } from 'payload';

import {
  clearLiveBlogCache,
  type LiveBlogRealtimePayload,
  type LiveBlogUpdateItem,
  publishLiveBlogUpdate,
} from '@/lib/realtime/liveBlogEmitter';
import type { News } from '@/payload-types';

export const broadcastLiveBlog: CollectionAfterChangeHook<News> = async ({
  doc,
  previousDoc,
}) => {
  if (!doc) return;

  const isLiveBlogNow = Boolean(doc.isLiveBlog);
  const wasLiveBlogPrev = Boolean(previousDoc?.isLiveBlog);

  const liveUpdates: LiveBlogUpdateItem[] = Array.isArray(doc.liveUpdates)
    ? (doc.liveUpdates as LiveBlogUpdateItem[])
    : [];

  const hasUpdates = liveUpdates.length > 0;

  if (!isLiveBlogNow && !wasLiveBlogPrev && !hasUpdates) {
    return;
  }

  if (doc._status !== 'published') {
    if (previousDoc?._status === 'published') {
      const identifiersToClear = [
        String(doc.id),
        doc.article_id ?? '',
        doc.slug ?? '',
        previousDoc.article_id ?? '',
        previousDoc.slug ?? '',
      ].filter(Boolean);
      clearLiveBlogCache(identifiersToClear);
    }
    return;
  }

  const sortedUpdates = [...liveUpdates].sort((a, b) => {
    const timeA = new Date(a.timestamp).getTime();
    const timeB = new Date(b.timestamp).getTime();
    return (
      (Number.isNaN(timeB) ? 0 : timeB) - (Number.isNaN(timeA) ? 0 : timeA)
    );
  });

  const status: 'active' | 'concluded' = isLiveBlogNow ? 'active' : 'concluded';

  const payload: LiveBlogRealtimePayload = {
    type: 'update',
    articleId: String(doc.id),
    article_id: doc.article_id ?? undefined,
    slug: doc.slug,
    isLiveBlog: isLiveBlogNow,
    liveBlogStatus: status,
    updatedAt: doc.updatedAt || new Date().toISOString(),
    liveUpdates: sortedUpdates,
    latestUpdate: sortedUpdates[0] ?? null,
    totalUpdates: sortedUpdates.length,
  };

  try {
    publishLiveBlogUpdate(payload);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to broadcast live blog update:', err);
  }
};
