import type { FieldHook, Payload } from 'payload';

import { formatArticleId } from '@/Payload/lib/utilities/articleId';

/** Today's date as YYYYMMDD, in the server's local timezone. */
export const dateKey = (date: Date = new Date()): string => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}${mm}${dd}`;
};

const nextSequence = async (
  payload: Payload,
  counterCollection: string,
  day: string
): Promise<number> => {
  const result = await payload.db.connection
    .collection(counterCollection)
    .findOneAndUpdate(
      { _id: day as unknown as never },
      { $inc: { sequence: 1 } },
      { upsert: true, returnDocument: 'after' }
    );

  const doc = (result?.value ?? result) as { sequence?: number } | null;
  return doc?.sequence ?? 1;
};

/**
 * A `beforeChange` field hook that assigns a `YYYYMMDD` + 5-digit daily
 * sequence id once, on the first save, and keeps it forever after.
 *
 * Each collection passes its own counter collection, so their sequences run
 * independently (article `2026100900001` and video `2026100900001` can both
 * exist -- they live under different URLs).
 */
export const createDailyIdHook =
  (fieldName: string, counterCollection: string): FieldHook =>
  async ({ value, originalDoc, data, req }) => {
    const existing = value ?? data?.[fieldName] ?? originalDoc?.[fieldName];
    if (typeof existing === 'string' && existing !== '') return existing;

    const day = dateKey();
    return formatArticleId(
      day,
      await nextSequence(req.payload, counterCollection, day)
    );
  };
