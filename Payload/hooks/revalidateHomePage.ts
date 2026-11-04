import { revalidatePath, revalidateTag } from 'next/cache';
import type {
  CollectionAfterChangeHook,
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
    payload.logger.info('Revalidating home page at path: /');

    revalidatePath('/');
    revalidateTag('home-page', 'max');
  }
};

/**
 * Shared by the collections that make up the home page, so publishing any of
 * them refreshes `/`.
 */
export const revalidateHomePage: CollectionAfterChangeHook = ({ doc, req }) => {
  revalidate(doc, req as PayloadRequest);
  return doc;
};

/** Same, for globals — they use a separate hook signature. */
export const revalidateHomePageGlobal: GlobalAfterChangeHook = ({
  doc,
  req,
}) => {
  revalidate(doc, req as PayloadRequest);
  return doc;
};
