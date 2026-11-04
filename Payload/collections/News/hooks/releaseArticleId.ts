import type { CollectionAfterDeleteHook } from 'payload';

import {
  parseArticleId,
  SEQUENCE_LENGTH,
} from '@/Payload/lib/utilities/articleId';

import { COUNTER_COLLECTION } from './generateArticleId';

/**
 * Rewinds the day's counter after an article is deleted, so the freed number
 * is handed to the next article instead of being lost.
 *
 * The counter is set to the highest sequence still in use that day, rather
 * than simply decremented. Deleting several articles at once runs these hooks
 * in an arbitrary order, and recomputing gives the same result whichever
 * order they arrive in -- and never reissues a number that is still taken.
 */
export const releaseArticleId: CollectionAfterDeleteHook = async ({
  doc,
  req,
}) => {
  const parsed = parseArticleId(doc?.article_id);
  if (!parsed) return doc;

  const { day } = parsed;
  const articleId = doc.article_id as string;
  const db = req.payload.db.connection;

  try {
    // Highest id left for this day, e.g. `2026081700007` -> 7.
    //
    // The deleted article is excluded explicitly: this hook runs inside the
    // delete's transaction, where that document is still visible, so relying
    // on it having disappeared would leave the counter one too high.
    const [highest] = await db
      .collection('news')
      .find(
        {
          article_id: {
            $regex: `^${day}\\d{${SEQUENCE_LENGTH}}$`,
            $ne: articleId,
          },
        },
        { projection: { article_id: 1 }, sort: { article_id: -1 }, limit: 1 }
      )
      .toArray();

    const sequence = highest ? Number(String(highest.article_id).slice(8)) : 0;

    await db
      .collection(COUNTER_COLLECTION)
      .updateOne({ _id: day as unknown as never }, { $set: { sequence } });
  } catch (err) {
    // The article is already gone; never fail the delete over bookkeeping.
    req.payload.logger.error({ err }, `Could not rewind counter for ${day}`);
  }

  return doc;
};
