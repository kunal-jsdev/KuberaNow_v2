import { revalidateTag } from 'next/cache';
import type { CollectionAfterChangeHook } from 'payload';

export const revalidateRedirects: CollectionAfterChangeHook = ({
  doc,
  req: { payload },
}) => {
  try {
    payload.logger.info(`Revalidating redirects`);

    revalidateTag('redirects', 'max');
  } catch (err) {
    payload.logger.error({ err }, 'Failed to revalidate redirects');
  }

  return doc;
};
