/* eslint-disable no-console -- a CLI script reports progress on stdout */
/**
 * Copies `article_id` from each news document into its version snapshots.
 *
 * `scripts/backfillArticleIds.ts` assigned ids on the `news` collection, but
 * the collection has drafts enabled -- so the admin list view reads each
 * document's latest snapshot out of `_news_versions`, not `news`. Snapshots
 * written before the field existed have no `article_id`, which is why
 * migrated articles show an empty articleId column while newly created ones
 * do not.
 *
 * For every version whose parent document has an id, this writes
 * `version.article_id` to match the parent. The parent document is the source
 * of truth and is never modified.
 *
 * Safe to run more than once: versions that already carry the correct id are
 * skipped.
 *
 *   npx tsx --env-file=.env scripts/backfillVersionArticleIds.ts --dry-run
 *   npx tsx --env-file=.env scripts/backfillVersionArticleIds.ts
 */
import type { ObjectId } from 'mongodb';
import { getPayload } from 'payload';

import config from '../payload.config';

const VERSIONS_COLLECTION = '_news_versions';

type NewsDoc = {
  _id: ObjectId;
  article_id?: string | null;
};

const DRY_RUN = process.argv.includes('--dry-run');

const run = async () => {
  const payload = await getPayload({ config });
  const db = payload.db.connection;
  const news = db.collection('news');
  const versions = db.collection(VERSIONS_COLLECTION);

  // 1. Every parent document's id, keyed by document id.
  const parents = (await news
    .find(
      { article_id: { $type: 'string' } },
      { projection: { article_id: 1 } }
    )
    .toArray()) as NewsDoc[];

  const idByParent = new Map<string, string>();
  for (const doc of parents) {
    if (typeof doc.article_id === 'string' && doc.article_id) {
      idByParent.set(String(doc._id), doc.article_id);
    }
  }

  console.log(`${idByParent.size} article(s) carry an id on the parent doc.`);

  const totalVersions = await versions.countDocuments({});
  console.log(
    `${totalVersions} version snapshot(s) in ${VERSIONS_COLLECTION}.\n`
  );

  // 2. Snapshots whose stored id does not already match the parent's.
  const stale = (await versions
    .find({}, { projection: { parent: 1, 'version.article_id': 1 } })
    .toArray()) as {
    _id: ObjectId;
    parent?: ObjectId | string | null;
    version?: { article_id?: string | null };
  }[];

  let updated = 0;
  let alreadyCorrect = 0;
  let orphaned = 0;

  for (const snapshot of stale) {
    const parentId = snapshot.parent ? String(snapshot.parent) : null;
    const expected = parentId ? idByParent.get(parentId) : undefined;

    if (!expected) {
      // A snapshot whose parent is gone, or whose parent never got an id.
      orphaned += 1;
      continue;
    }

    if (snapshot.version?.article_id === expected) {
      alreadyCorrect += 1;
      continue;
    }

    updated += 1;

    if (!DRY_RUN) {
      await versions.updateOne(
        { _id: snapshot._id },
        { $set: { 'version.article_id': expected } }
      );
    }
  }

  console.log(
    `${DRY_RUN ? '[dry run] would update' : 'updated'} ${updated} snapshot(s).`
  );
  console.log(`${alreadyCorrect} snapshot(s) already correct.`);
  if (orphaned > 0) {
    console.log(
      `${orphaned} snapshot(s) skipped -- no parent document with an id.`
    );
  }

  if (DRY_RUN)
    console.log('\nNothing was written. Re-run without --dry-run to apply.');

  process.exit(0);
};

run().catch((err) => {
  console.error('Version backfill failed:', err);
  process.exit(1);
});
