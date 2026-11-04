import type { CollectionBeforeChangeHook } from 'payload';

import type { News } from '@/payload-types';

/**
 * `publishedAt` is prefilled with "now" the moment an editor opens a new
 * article, and it drives both the displayed date and every `-publishedAt` sort.
 * For a scheduled article that prefilled value is the date it was *drafted*, so
 * without this hook an article written on the 1st and scheduled for the 8th
 * goes live stamped the 1st — showing a week-old date and sorting below newer
 * news the moment it appears.
 *
 * Restamp when a draft becomes published while carrying a `publishedAt` that
 * nobody touched in this save and that is already in the past. That covers the
 * scheduled-publish task, which submits the stored draft unchanged.
 *
 * Deliberately not keyed on the caller: `req.user` is set for scheduled runs
 * too (the task loads the user who scheduled the post), and `data` arrives
 * fully merged with the existing document rather than as a status-only patch,
 * so neither distinguishes the job from a manual publish.
 *
 * Two cases are left alone: a `publishedAt` edited during this save, and one
 * set in the future — both are dates a person chose on purpose.
 */
export const syncScheduledPublishedAt: CollectionBeforeChangeHook<News> = ({
  data,
  originalDoc,
}) => {
  const isBecomingPublished =
    data._status === 'published' && originalDoc?._status !== 'published';

  if (!isBecomingPublished) return data;

  // An edited date is the editor's explicit choice; only a carried-over one is
  // a candidate for restamping.
  const isUnchanged = data.publishedAt === originalDoc?.publishedAt;
  if (!isUnchanged) return data;

  const now = new Date();
  const current = data.publishedAt ? new Date(data.publishedAt) : null;
  const isStale = !current || Number.isNaN(current.getTime()) || current < now;

  if (!isStale) return data;

  return { ...data, publishedAt: now.toISOString() };
};
