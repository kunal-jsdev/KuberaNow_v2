import configPromise from '@payload-config';
import { unstable_cache } from 'next/cache';
import { getPayload } from 'payload';

import { sidebarTag } from '@/Payload/collections/Sidebars/hooks/revalidateSidebar';
import type { Sidebar } from '@/payload-types';

async function fetchSidebar(pageSlug: string): Promise<Sidebar | null> {
  const payload = await getPayload({ config: configPromise });

  try {
    const result = await payload.find({
      collection: 'sidebars',
      draft: false,
      where: { pageSlug: { equals: pageSlug } },
      limit: 1,
      depth: 2,
      pagination: false,
      overrideAccess: false,
    });

    return result.docs[0] ?? null;
  } catch (err) {
    payload.logger.error({ err, pageSlug }, 'Failed to load sidebar');
    return null;
  }
}

export async function getSidebar(pageSlug: string): Promise<Sidebar | null> {
  if (!pageSlug) {
    return null;
  }

  // Tagged so `revalidateSidebar` can purge on publish. Every route that shows
  // this sidebar shares one entry, so a single tag purge refreshes them all.
  return unstable_cache(() => fetchSidebar(pageSlug), ['sidebar', pageSlug], {
    tags: [sidebarTag(pageSlug)],
  })();
}
