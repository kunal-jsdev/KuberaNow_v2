import { revalidatePath, revalidateTag } from 'next/cache';
import type { GlobalAfterChangeHook } from 'payload';

export const revalidateNavConfig: GlobalAfterChangeHook = ({
  doc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    payload.logger.info('Revalidating nav config — busting layout cache');
    revalidatePath('/', 'layout');
    revalidateTag('nav-config', 'max');
  }
  return doc;
};
