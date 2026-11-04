import type { GlobalConfig, Where } from 'payload';

import { adminOrEditor } from '@/Payload/access/adminOrEditor';
import { authenticatedOrPublished } from '@/Payload/access/authenticatedOrPublished';

import { syncPinnedArticlesGlobalToNewsCategory } from './hooks/syncPinnedArticlesGlobalToNewsCategory';

export const PinnedNewsCategories: GlobalConfig = {
  slug: 'pinned-news-categories',
  label: 'Pinned News Categories',
  access: {
    read: authenticatedOrPublished,
    update: adminOrEditor,
  },
  admin: {
    group: 'News',
    description: 'Sections that news articles are filed under (e.g. Market).',
  },
  fields: [
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'news-categories',
      label: 'Categories list',
      required: true,
      admin: {
        description: 'Select a category to view or update its pinned articles.',
      },
    },
    {
      name: 'pinnedArticles',
      type: 'relationship',
      relationTo: 'news',
      label: 'Pinned Articles',
      hasMany: true,
      maxRows: 3,
      admin: {
        allowCreate: false,
        description:
          'Optional. Featured articles pinned to the top of this category page. Pick up to 3. Only articles filed under this category can be pinned.',
        components: {
          Field: '@/Payload/components/PinnedArticlesField#PinnedArticlesField',
        },
      },
      validate: (value, options) => {
        if (Array.isArray(value) && value.length > 3) {
          return 'Only 3 articles are allowed per category';
        }
        return true;
      },
      filterOptions: ({ siblingData, data }): Where => {
        const category =
          (siblingData as { category?: string | { id?: string } | null })
            ?.category ??
          (data as { category?: string | { id?: string } | null })?.category;

        const categoryId =
          typeof category === 'object' && category !== null
            ? category.id
            : category;

        if (categoryId) {
          return {
            category: {
              equals: categoryId,
            },
            _status: {
              equals: 'published',
            },
          };
        }

        return {
          id: {
            equals: 'none',
          },
        };
      },
    },
  ],
  hooks: {
    afterChange: [syncPinnedArticlesGlobalToNewsCategory],
  },
};
