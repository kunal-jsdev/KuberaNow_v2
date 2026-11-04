import { revalidatePath, revalidateTag } from 'next/cache';
import type { GlobalAfterChangeHook } from 'payload';

export const revalidateFloatingCtaGlobal: GlobalAfterChangeHook = ({
  doc,
  req: { payload, context },
}) => {
  if (context.disableRevalidate) return doc;

  try {
    payload.logger.info('Revalidating layout for Floating CTA global update');
    revalidatePath('/', 'layout');
    revalidateTag('floating-cta', 'max');
  } catch (err) {
    payload.logger.error({ err }, 'Failed to revalidate floating CTA');
  }

  return doc;
};
