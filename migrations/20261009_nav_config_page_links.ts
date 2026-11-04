import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-mongodb';
import { Types } from 'mongoose';

/**
 * Nav-config: Category Link → Page Link.
 *
 * Old shape (per block in header.navItems, hamburger.navItems and the legacy
 * root navItems):
 *   { blockType: 'categoryLink', category: ObjectId }
 *   { blockType: 'navGroup', Categories: ObjectId[] }
 * (`category` / `Categories` may also already hold `{ relationTo, value }`
 * if the global was saved with the interim schema.)
 *
 * New shape:
 *   { blockType: 'pageLink', page: { relationTo, value: ObjectId } }
 *   { blockType: 'navGroup', pages: { relationTo, value: ObjectId }[] }
 * where relationTo is 'news-categories' or 'custom-nav-links'.
 *
 * Safety:
 * - The whole nav-config document is copied to the
 *   `nav-config-migration-backups` collection before every write (up and
 *   down), outside the transaction. Backups are never deleted.
 * - `up` removes nothing: the old `category` / `Categories` keys are left in
 *   place next to the new `page` / `pages` keys (Payload drops them on the
 *   next admin save). Every other field (ids, enabled, showNew, title,
 *   staticDropdown, …) is copied as is.
 * - `down` restores the old keys; custom nav links cannot exist in the old
 *   schema, so they are logged and left out (they remain in the backup).
 * - The converted data is verified before and after the write; any mismatch
 *   aborts the migration (and rolls back when Mongo transactions are
 *   available).
 * - Idempotent: already-converted blocks are left unchanged.
 * - Dry run: set NAV_MIGRATION_DRY_RUN=true to log the result without writing.
 *   The run then fails on purpose so Payload does not mark it as done.
 */

const MIGRATION_NAME = '20261009_nav_config_page_links';
const BACKUP_COLLECTION = 'nav-config-migration-backups';
const NAV_ITEM_PATHS = ['header', 'hamburger', 'root'] as const;

type NavPath = (typeof NAV_ITEM_PATHS)[number];
type Ref = { relationTo: string; value: unknown };
type Block = Record<string, unknown> & { blockType?: string };

const isDryRun = () => process.env.NAV_MIGRATION_DRY_RUN === 'true';

const isEmpty = (value: unknown) => value === null || value === undefined;

const isRef = (value: unknown): value is Ref =>
  !!value &&
  typeof value === 'object' &&
  'relationTo' in value &&
  'value' in value;

const toObjectId = (value: unknown) => {
  if (value instanceof Types.ObjectId) return value;
  if (typeof value === 'string' && Types.ObjectId.isValid(value)) {
    return new Types.ObjectId(value);
  }
  if (value && typeof value === 'object' && 'toHexString' in value) {
    return new Types.ObjectId(
      (value as { toHexString: () => string }).toHexString()
    );
  }
  throw new Error(`Invalid relationship id: ${JSON.stringify(value)}`);
};

const toRef = (value: unknown): Ref | null => {
  if (isEmpty(value)) return null;
  if (isRef(value)) {
    return { relationTo: value.relationTo, value: toObjectId(value.value) };
  }
  return { relationTo: 'news-categories', value: toObjectId(value) };
};

const getItems = (doc: Record<string, any>, path: NavPath) =>
  path === 'root' ? doc.navItems : doc[path]?.navItems;

const setKey = (path: NavPath) =>
  path === 'root' ? 'navItems' : `${path}.navItems`;

/* -------------------------------------------------------------------------- */
/*                                     up                                     */
/* -------------------------------------------------------------------------- */

const upgradeBlock = (item: Block): Block => {
  if (item.blockType === 'categoryLink' || item.blockType === 'pageLink') {
    return {
      ...item,
      blockType: 'pageLink',
      page: toRef(
        item.blockType === 'categoryLink' ? item.category : item.page
      ),
    };
  }

  if (item.blockType === 'navGroup') {
    const source = Array.isArray(item.pages) ? item.pages : item.Categories;
    if (!Array.isArray(source)) return item;
    return {
      ...item,
      pages: source.map(toRef).filter((ref): ref is Ref => ref !== null),
    };
  }

  return item;
};

/** Throws unless `next` holds exactly the data of `prev` in the new shape. */
const verifyUpgrade = (prev: Block[], next: Block[], path: NavPath) => {
  const fail = (msg: string) => {
    throw new Error(`[${MIGRATION_NAME}] ${path}.navItems: ${msg}`);
  };

  if (prev.length !== next.length) {
    fail(`block count changed ${prev.length} → ${next.length}`);
  }

  next.forEach((item, i) => {
    const old = prev[i];
    if (String(item.id) !== String(old.id)) fail(`block ${i} id changed`);

    if (old.blockType === 'categoryLink' || old.blockType === 'pageLink') {
      if (item.blockType !== 'pageLink') fail(`block ${i} not a pageLink`);
      const oldRef = toRef(
        old.blockType === 'categoryLink' ? old.category : old.page
      );
      const newRef = item.page as Ref | null;
      if (
        String(oldRef?.value) !== String(newRef?.value) ||
        oldRef?.relationTo !== newRef?.relationTo
      ) {
        fail(`block ${i} page does not match the original category`);
      }
    }

    if (old.blockType === 'navGroup') {
      const source = Array.isArray(old.pages) ? old.pages : old.Categories;
      const oldIds = (Array.isArray(source) ? source : [])
        .map(toRef)
        .filter(Boolean)
        .map((ref) => `${ref!.relationTo}:${String(ref!.value)}`);
      const newIds = ((item.pages as Ref[] | undefined) ?? []).map(
        (ref) => `${ref.relationTo}:${String(ref.value)}`
      );
      if (oldIds.join() !== newIds.join()) {
        fail(`group ${i} ("${String(old.title)}") pages do not match`);
      }
    }
  });
};

/* -------------------------------------------------------------------------- */
/*                                    down                                    */
/* -------------------------------------------------------------------------- */

// The new `page` / `pages` keys are dropped on the way down (they stay in the
// backup), so a later `up` rebuilds them from whatever the old app saved.
const downgradeBlock = (item: Block, dropped: string[]): Block | null => {
  if (item.blockType === 'pageLink') {
    const { page, ...rest } = item;
    const ref = toRef(page);
    if (ref && ref.relationTo !== 'news-categories') {
      dropped.push(`page link → ${ref.relationTo}:${String(ref.value)}`);
      return null;
    }
    return { ...rest, blockType: 'categoryLink', category: ref?.value ?? null };
  }

  if (item.blockType === 'navGroup' && Array.isArray(item.pages)) {
    const { pages, ...rest } = item;
    const Categories = (pages as unknown[])
      .map(toRef)
      .filter((ref): ref is Ref => {
        if (!ref) return false;
        if (ref.relationTo === 'news-categories') return true;
        dropped.push(
          `group "${String(item.title)}" → ${ref.relationTo}:${String(ref.value)}`
        );
        return false;
      })
      .map((ref) => ref.value);
    return { ...rest, Categories };
  }

  return item;
};

/* -------------------------------------------------------------------------- */
/*                                   runner                                   */
/* -------------------------------------------------------------------------- */

const run = async (
  { payload, session }: MigrateUpArgs | MigrateDownArgs,
  direction: 'up' | 'down'
) => {
  const log = (msg: string) =>
    payload.logger.info(`[${MIGRATION_NAME}:${direction}] ${msg}`);

  const globals = payload.db.connection.collection('globals');
  const doc = await globals.findOne({ globalType: 'nav-config' }, { session });

  if (!doc) {
    log('No nav-config document found — nothing to migrate.');
    return;
  }

  const set: Record<string, Block[]> = {};
  const dropped: string[] = [];

  for (const path of NAV_ITEM_PATHS) {
    const items = getItems(doc, path);
    if (!Array.isArray(items)) continue;

    if (direction === 'up') {
      const next = items.map(upgradeBlock);
      verifyUpgrade(items, next, path);
      set[setKey(path)] = next;
    } else {
      set[setKey(path)] = items
        .map((item: Block) => downgradeBlock(item, dropped))
        .filter((item: Block | null): item is Block => item !== null);
    }

    log(`${path}.navItems: ${items.length} block(s) converted`);
  }

  if (dropped.length) {
    log(
      `Custom nav links cannot exist in the old schema and were left out (still in the backup):\n  ${dropped.join('\n  ')}`
    );
  }

  if (Object.keys(set).length === 0) {
    log('No navItems found — nothing to migrate.');
    return;
  }

  if (isDryRun()) {
    log(`Dry run result:\n${JSON.stringify(set, null, 2)}`);
    throw new Error(
      `[${MIGRATION_NAME}] Dry run finished — nothing was written. Unset NAV_MIGRATION_DRY_RUN to apply.`
    );
  }

  // Deliberately outside the transaction: creating a collection inside a Mongo
  // transaction fails ("catalog changes"), and the backup should survive even
  // if the migration itself is rolled back.
  const backup = await payload.db.connection
    .collection(BACKUP_COLLECTION)
    .insertOne({
      migration: MIGRATION_NAME,
      direction,
      createdAt: new Date(),
      doc,
    });
  log(`Backup saved to "${BACKUP_COLLECTION}" (_id: ${backup.insertedId}).`);

  const result = await globals.updateOne(
    { _id: doc._id },
    { $set: { ...set, updatedAt: new Date() } },
    { session }
  );
  if (result.matchedCount !== 1) {
    throw new Error(`[${MIGRATION_NAME}] nav-config document not updated.`);
  }

  if (direction === 'up') {
    const saved = await globals.findOne({ _id: doc._id }, { session });
    for (const path of NAV_ITEM_PATHS) {
      const items = getItems(doc, path);
      if (Array.isArray(items)) {
        verifyUpgrade(items, getItems(saved ?? {}, path) ?? [], path);
      }
    }
    log('Verified saved data.');
  }

  log('Done.');
};

export async function up(args: MigrateUpArgs): Promise<void> {
  await run(args, 'up');
}

export async function down(args: MigrateDownArgs): Promise<void> {
  await run(args, 'down');
}
