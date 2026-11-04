/* eslint-disable no-console -- a CLI script reports progress on stdout */
/**
 * Backfills `article_id` on news articles that predate the field.
 *
 * Ids follow the live format, `YYYYMMDD` + a zero-padded daily sequence
 * (e.g. `2026082100006`). The date comes from each article's `createdAt`, and
 * the sequence counts articles within that same day, ordered oldest-first --
 * so the oldest article created on a day gets `00001`, the next `00002`, and
 * so on.
 *
 * Safe to run more than once: articles that already have an id are skipped,
 * and numbers already in use on a day are never handed out again.
 *
 *   npx tsx --env-file=.env scripts/backfillArticleIds.ts --dry-run
 *   npx tsx --env-file=.env scripts/backfillArticleIds.ts
 */
import type { ObjectId } from 'mongodb';
import { getPayload } from 'payload';

import config from '../payload.config';
import {
  COUNTER_COLLECTION,
  dateKey,
} from '../Payload/collections/News/hooks/generateArticleId';
import {
  formatArticleId,
  parseArticleId,
} from '../Payload/lib/utilities/articleId';

type NewsDoc = {
  _id: ObjectId;
  createdAt?: Date | string | null;
  title?: string | null;
  article_id?: string | null;
};

const DRY_RUN = process.argv.includes('--dry-run');

const run = async () => {
  const payload = await getPayload({ config });
  const db = payload.db.connection;
  const news = db.collection('news');
  const counters = db.collection(COUNTER_COLLECTION);

  // 1. Reserve every sequence already in use, per day, so a backfilled id can
  //    never collide with one the live hook has already issued.
  const taken = new Map<string, Set<number>>();

  const existing = (await news
    .find(
      { article_id: { $type: 'string' } },
      { projection: { article_id: 1 } }
    )
    .toArray()) as NewsDoc[];

  for (const doc of existing) {
    const parsed = parseArticleId(doc.article_id);
    if (!parsed) continue;
    if (!taken.has(parsed.day)) taken.set(parsed.day, new Set());
    taken.get(parsed.day)!.add(parsed.sequence);
  }

  console.log(
    `${existing.length} article(s) already have an id, across ${taken.size} day(s).`
  );

  // 2. Articles needing an id, oldest first, so each day numbers in the order
  //    the articles were actually created.
  const pending = (await news
    .find(
      { article_id: { $not: { $type: 'string' } } },
      { projection: { createdAt: 1, title: 1 } }
    )
    .sort({ createdAt: 1, _id: 1 })
    .toArray()) as NewsDoc[];

  console.log(`${pending.length} article(s) need an id.\n`);

  const nextFreeSequence = (day: string): number => {
    if (!taken.has(day)) taken.set(day, new Set());
    const used = taken.get(day)!;
    let candidate = 1;
    while (used.has(candidate)) candidate += 1;
    used.add(candidate);
    return candidate;
  };

  const perDayAssigned = new Map<string, number>();
  const skipped: NewsDoc[] = [];
  let assigned = 0;

  for (const doc of pending) {
    if (!doc.createdAt) {
      // No creation date means no day to number within; leave it for a human.
      skipped.push(doc);
      continue;
    }

    // `dateKey` is the same helper the live hook uses, so backfilled ids fall
    // on the same day boundaries as newly created ones.
    const day = dateKey(new Date(doc.createdAt));
    const sequence = nextFreeSequence(day);
    const articleId = formatArticleId(day, sequence);

    perDayAssigned.set(day, (perDayAssigned.get(day) ?? 0) + 1);
    assigned += 1;

    console.log(
      `  ${articleId}  ${String(doc.title ?? '(untitled)').slice(0, 46)}`
    );

    if (!DRY_RUN) {
      await news.updateOne(
        { _id: doc._id },
        { $set: { article_id: articleId } }
      );
    }
  }

  // 3. Move each day's counter past everything now in use, so the next article
  //    created continues the sequence instead of colliding with a backfill.
  console.log('');
  for (const [day, used] of taken) {
    const highest = Math.max(0, ...used);
    if (DRY_RUN) {
      console.log(`counter ${day} -> ${highest}`);
      continue;
    }
    await counters.updateOne(
      { _id: day as unknown as never },
      { $max: { sequence: highest } },
      { upsert: true }
    );
  }

  console.log(
    `\n${DRY_RUN ? '[dry run] would assign' : 'assigned'} ${assigned} id(s) across ${perDayAssigned.size} day(s).`
  );

  if (skipped.length > 0) {
    console.log(
      `\n${skipped.length} article(s) skipped for having no createdAt:`
    );
    for (const doc of skipped) {
      console.log(
        `  ${String(doc._id)}  ${String(doc.title ?? '(untitled)').slice(0, 46)}`
      );
    }
  }

  if (DRY_RUN)
    console.log('\nNothing was written. Re-run without --dry-run to apply.');

  process.exit(0);
};

run().catch((err) => {
  console.error('Backfill failed:', err);
  process.exit(1);
});
