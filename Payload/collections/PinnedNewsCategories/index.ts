import type { CollectionConfig, Where } from 'payload';

import { adminOrEditor } from '@/Payload/access/adminOrEditor';
import { anyone } from '@/Payload/access/anyone';

import { clearPinnedArticlesOnNewsCategoryDelete } from './hooks/clearPinnedArticlesOnNewsCategoryDelete';
import { syncPinnedArticlesToNewsCategory } from './hooks/syncPinnedArticlesToNewsCategory';

export const PinnedNewsCategories: CollectionConfig = {
  slug: 'pinned-news-categories',
  labels: {
    singular: 'Pinned News Category',
    plural: 'Pinned News Categories',
  },
  access: {
    create: adminOrEditor,
    delete: adminOrEditor,
    update: adminOrEditor,
    read: anyone,
  },
  defaultPopulate: {
    category: true,
    pinnedArticles: true,
  },
  admin: {
    defaultColumns: ['categoryTitle', 'category', 'updatedAt'],
    useAsTitle: 'categoryTitle',
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
      unique: true,
      admin: {
        description: 'Select a category to manage its pinned articles.',
      },
    },
    {
      name: 'categoryTitle',
      type: 'text',
      admin: {
        hidden: true,
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
    beforeValidate: [
      async ({ data, req: { payload } }) => {
        if (data?.category) {
          const catId =
            typeof data.category === 'object' && data.category !== null
              ? data.category.id
              : data.category;
          try {
            const categoryDoc = await payload.findByID({
              collection: 'news-categories',
              id: catId,
            });
            if (categoryDoc?.title) {
              data.categoryTitle = categoryDoc.title;
            }
          } catch {
            // Ignore if category fetch fails
          }
        }
        return data;
      },
    ],
    afterChange: [syncPinnedArticlesToNewsCategory],
    afterDelete: [clearPinnedArticlesOnNewsCategoryDelete],
  },
};
