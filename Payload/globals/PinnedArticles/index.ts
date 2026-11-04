import type { GlobalConfig, Where } from 'payload';

import { adminOrEditor } from '@/Payload/access/adminOrEditor';
import { authenticatedOrPublished } from '@/Payload/access/authenticatedOrPublished';
import { revalidateHomePageGlobal } from '@/Payload/hooks/revalidateHomePage';

const PINNED_ARTICLE_COUNT = 3;

/**
 * A global rather than a collection: there is only ever one set of pinned
 * articles, so the admin opens the editor directly instead of a list with
 * "Create new".
 */
export const PinnedArticles: GlobalConfig = {
  slug: 'pinned-articles',
  label: 'Pinned Articles',
  access: {
    read: authenticatedOrPublished,
    update: adminOrEditor,
  },
  admin: {
    group: 'Home Page',
    description: `Up to ${PINNED_ARTICLE_COUNT} articles highlighted on the home page.`,
  },
  fields: [
    {
      name: 'articles',
      type: 'array',
      label: 'Articles',
      labels: {
        singular: 'Article',
        plural: 'Articles',
      },
      minRows: 0,
      maxRows: PINNED_ARTICLE_COUNT,
      admin: {
        description: `Up to ${PINNED_ARTICLE_COUNT} articles, shown in the order listed.`,
        initCollapsed: false,
      },
      fields: [
        {
          name: 'article',
          type: 'relationship',
          relationTo: 'news',
          required: false,
          admin: {
            description:
              'The article to pin. Supplies the title and image. Only published articles can be pinned.',
            components: {
              Field:
                '@/Payload/components/PinnedArticlesField#PinnedArticlesField',
            },
          },
          filterOptions: (): Where => ({
            _status: {
              equals: 'published',
            },
          }),
        },
      ],
    },
  ],
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
