import { revalidatePath, revalidateTag } from 'next/cache';
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
  PayloadRequest,
} from 'payload';

type Revalidatable = {
  payload: { logger: { info: (msg: string) => void } };
  context: { disableRevalidate?: unknown };
};

const revalidate = (
  doc: { _status?: string | null },
  { payload, context }: Revalidatable
) => {
  if (!context.disableRevalidate) {
    payload.logger.info(
      'Revalidating video pages at paths: /videos, /short-videos'
    );

    // A failed revalidation must never fail the save itself.
    try {
      revalidatePath('/');
      revalidatePath('/videos');
      revalidatePath('/short-videos');
      // Every detail page lists other videos ("You May Like This"), so any
      // published change refreshes all of them, not just the edited one.
      revalidatePath('/videos/[slug]', 'page');
      revalidatePath('/short-videos/[slug]', 'page');
      revalidateTag('video-page', 'max');
    } catch {}
  }
};

/**
 * Shared by the collections that make up the video page, so publishing any of
 * them refreshes `/videos` and `/short-videos`.
 */
export const revalidateVideoPage: CollectionAfterChangeHook = ({
  doc,
  previousDoc,
  req,
}) => {
  // A draft that has never been published is not on the site, so there is
  // nothing to revalidate. Skipping these matters: Videos autosaves, and
  // opening "Create New" makes the initial draft while the admin page is
  // rendering, where `revalidatePath` throws and the page fails to open.
  const isDraftOnly =
    doc?._status !== 'published' && previousDoc?._status !== 'published';

  if (!isDraftOnly) revalidate(doc, req as PayloadRequest);
  return doc;
};

/** Same, for deletes — a removed video must drop off both listings too. */
export const revalidateVideoPageDelete: CollectionAfterDeleteHook = ({
  doc,
  req,
}) => {
  if (doc?._status === 'published') revalidate(doc, req as PayloadRequest);
  return doc;
};

/** Same, for globals — they use a separate hook signature. */
export const revalidateVideoPageGlobal: GlobalAfterChangeHook = ({
  doc,
  req,
}) => {
  revalidate(doc, req as PayloadRequest);
  return doc;
};
