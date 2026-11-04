/* eslint-disable no-console -- a CLI script reports progress on stdout */
/**
 * Backfills `video_id` on videos that predate the field, then copies it into
 * their version snapshots (the admin list reads `_videos_versions`).
 *
 * Same scheme as `scripts/backfillArticleIds.ts`: `YYYYMMDD` from each
 * video's `createdAt` + a daily sequence, oldest first, never reusing a number
 * already taken. The video counter is then moved past every number in use.
 *
 * Safe to run more than once.
 *
 *   npx tsx --env-file=.env scripts/backfillVideoIds.ts --dry-run
 *   npx tsx --env-file=.env scripts/backfillVideoIds.ts
 */
import type { ObjectId } from 'mongodb';
import { getPayload } from 'payload';

import config from '../payload.config';
import { VIDEO_COUNTER_COLLECTION } from '../Payload/collections/Videos/hooks/generateVideoId';
import { dateKey } from '../Payload/hooks/generateDailyId';
import {
  formatArticleId,
  parseArticleId,
} from '../Payload/lib/utilities/articleId';

type VideoDoc = {
  _id: ObjectId;
  createdAt?: Date | string | null;
  title?: string | null;
  video_id?: string | null;
};

const DRY_RUN = process.argv.includes('--dry-run');

const run = async () => {
  const payload = await getPayload({ config });
  const db = payload.db.connection;
  const videos = db.collection('videos');
  const versions = db.collection('_videos_versions');
  const counters = db.collection(VIDEO_COUNTER_COLLECTION);

  // 1. Reserve every sequence already in use, per day.
  const taken = new Map<string, Set<number>>();
  const idByParent = new Map<string, string>();

  const existing = (await videos
    .find({ video_id: { $type: 'string' } }, { projection: { video_id: 1 } })
    .toArray()) as VideoDoc[];

  for (const doc of existing) {
    const parsed = parseArticleId(doc.video_id);
    if (!parsed) continue;
    if (!taken.has(parsed.day)) taken.set(parsed.day, new Set());
    taken.get(parsed.day)!.add(parsed.sequence);
    idByParent.set(String(doc._id), doc.video_id!);
  }

  console.log(`${existing.length} video(s) already have an id.`);

  // 2. Videos needing an id, oldest first.
  const pending = (await videos
    .find(
      { video_id: { $not: { $type: 'string' } } },
      { projection: { createdAt: 1, title: 1 } }
    )
    .sort({ createdAt: 1, _id: 1 })
    .toArray()) as VideoDoc[];

  console.log(`${pending.length} video(s) need an id.\n`);

  const nextFreeSequence = (day: string): number => {
    if (!taken.has(day)) taken.set(day, new Set());
    const used = taken.get(day)!;
    let candidate = 1;
    while (used.has(candidate)) candidate += 1;
    used.add(candidate);
    return candidate;
  };

  const skipped: VideoDoc[] = [];
  let assigned = 0;

  for (const doc of pending) {
    if (!doc.createdAt) {
      skipped.push(doc);
      continue;
    }

    const day = dateKey(new Date(doc.createdAt));
    const videoId = formatArticleId(day, nextFreeSequence(day));
    idByParent.set(String(doc._id), videoId);
    assigned += 1;

    console.log(
      `  ${videoId}  ${String(doc.title ?? '(untitled)').slice(0, 46)}`
    );

    if (!DRY_RUN) {
      await videos.updateOne({ _id: doc._id }, { $set: { video_id: videoId } });
    }
  }

  // 3. Move each day's counter past everything now in use.
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

  // 4. Copy each parent's id into its version snapshots.
  const snapshots = (await versions
    .find({}, { projection: { parent: 1, 'version.video_id': 1 } })
    .toArray()) as {
    _id: ObjectId;
    parent?: ObjectId | string | null;
    version?: { video_id?: string | null };
  }[];

  let versionsUpdated = 0;
  for (const snapshot of snapshots) {
    const expected = snapshot.parent
      ? idByParent.get(String(snapshot.parent))
      : undefined;
    if (!expected || snapshot.version?.video_id === expected) continue;

    versionsUpdated += 1;
    if (!DRY_RUN) {
      await versions.updateOne(
        { _id: snapshot._id },
        { $set: { 'version.video_id': expected } }
      );
    }
  }

  const verb = DRY_RUN ? '[dry run] would assign' : 'assigned';
  console.log(
    `\n${verb} ${assigned} id(s); ${versionsUpdated} snapshot(s) to sync.`
  );

  if (skipped.length > 0) {
    console.log(
      `\n${skipped.length} video(s) skipped for having no createdAt:`
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
  console.error('Video id backfill failed:', err);
  process.exit(1);
});
