import type { GlobalConfig } from 'payload';

import { adminOrEditor } from '@/Payload/access/adminOrEditor';
import { authenticatedOrPublished } from '@/Payload/access/authenticatedOrPublished';
import { carouselFields } from '@/Payload/components/Carousel/config';
import { revalidateHomePageGlobal } from '@/Payload/hooks/revalidateHomePage';

/**
 * A global rather than a collection: there is only ever one home page carousel,
 * so the admin opens the editor directly instead of a list with "Create new".
 */
export const Carousel: GlobalConfig = {
  slug: 'carousel',
  label: 'Carousel',
  access: {
    read: authenticatedOrPublished,
    update: adminOrEditor,
  },
  admin: {
    group: 'Home Page',
    description: 'Slides for the home page hero carousel.',
  },
  fields: carouselFields,
  hooks: {
    afterChange: [revalidateHomePageGlobal],
  },
  versions: {
    drafts: {
      // Disabled: scheduled publishing needs a job runner to execute the queued
      // jobs. Nothing invokes the queue yet (no `jobs` config in payload.config.ts),
      // so anything scheduled would silently never publish.
      // schedulePublish: true,
    },
    max: 50,
  },
};
