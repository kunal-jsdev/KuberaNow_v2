import type { Payload } from 'payload';

/**
 * A `schedulePublish` run takes seconds. One still marked `processing` after
 * this long was orphaned: the server restarted or crashed mid-run, and Payload
 * never clears that flag itself. Left alone, the exclusive concurrency key
 * makes every later job for the same document wait behind it forever.
 */
const STALE_JOB_AFTER_MS = 10 * 60 * 1000;

type CronGlobal = typeof globalThis & { _payloadCronOwner?: Payload };

/**
 * Starts Payload's job cron at most once per Node process.
 *
 * Payload starts crons from two places that do not know about each other: our
 * `onInit` (so the worker runs even when nobody opens the admin panel) and
 * `getPayload({ cron: true })`, which @payloadcms/next calls on every admin
 * render and auth request. Neither checks whether a cron is already running,
 * so without this guard the process ends up with two workers racing for the
 * same jobs. Wrapping `_initializeCrons` makes every later call a no-op.
 *
 * The owner is kept on `globalThis` because Next can load more than one copy
 * of Payload in a process, each with its own instance. A destroyed owner (HMR
 * reload in dev) has an empty `crons` list, so the next instance takes over.
 */
export const startJobWorkerOnce = async (payload: Payload): Promise<void> => {
  const cronGlobal = globalThis as CronGlobal;
  const initializeCrons = payload._initializeCrons.bind(payload);

  payload._initializeCrons = async () => {
    const owner = cronGlobal._payloadCronOwner;
    if (owner && owner.crons.length > 0) return;

    cronGlobal._payloadCronOwner = payload;
    await initializeCrons();
    payload.logger.info(
      `Payload job worker started (${payload.crons.length} cron(s))`
    );
  };

  await payload._initializeCrons();
};

/**
 * Puts orphaned `schedulePublish` jobs back in the queue so the next run
 * retries them. Called from `shouldAutoRun`, i.e. before every cron tick, so a
 * job orphaned by a restart is recovered within minutes, not only at boot.
 */
export const releaseStaleJobs = async (payload: Payload): Promise<void> => {
  const cutoff = new Date(Date.now() - STALE_JOB_AFTER_MS).toISOString();

  try {
    const { docs } = await payload.update({
      collection: 'payload-jobs',
      where: {
        and: [
          { taskSlug: { equals: 'schedulePublish' } },
          { processing: { equals: true } },
          { updatedAt: { less_than: cutoff } },
        ],
      },
      data: { processing: false },
      depth: 0,
    });

    if (docs.length) {
      payload.logger.warn(
        `Released ${docs.length} stale schedulePublish job(s): ${docs
          .map((doc) => doc.id)
          .join(', ')}`
      );
    }
  } catch (err) {
    // Never let recovery stop the queue from running.
    payload.logger.error({ err, msg: 'Failed to release stale jobs' });
  }
};
