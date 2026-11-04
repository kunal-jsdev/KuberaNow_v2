import configPromise from '@payload-config';
import { unstable_cache } from 'next/cache';
import { getPayload } from 'payload';

import type { FloatingCta } from '@/payload-types';

async function fetchFloatingCta(): Promise<FloatingCta | null> {
  const payload = await getPayload({ config: configPromise });

  try {
    const result = await payload.findGlobal({
      slug: 'floating-cta',
      draft: false,
      depth: 2,
      overrideAccess: false,
    });

    return result ?? null;
  } catch (err) {
    payload.logger.error({ err }, 'Failed to load floating CTA global');
    return null;
  }
}

export async function getFloatingCta(): Promise<FloatingCta | null> {
  return unstable_cache(() => fetchFloatingCta(), ['floating-cta'], {
    tags: ['floating-cta'],
    revalidate: 600,
  })();
}
