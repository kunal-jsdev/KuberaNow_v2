import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields';
import { type CollectionConfig, slugField } from 'payload';

import { adminOrEditor } from '@/Payload/access/adminOrEditor';
import { anyone } from '@/Payload/access/anyone';
import { canManageCategories } from '@/Payload/lib/Auth/roles';
import { unicodeSlugify } from '@/Payload/lib/utilities/slugify';

import {
  revalidateNewsCategory,
  revalidateNewsCategoryDelete,
} from './hooks/revalidateNewsCategory';

export const NewsCategories: CollectionConfig<'news-categories'> = {
  slug: 'news-categories',
  labels: { singular: 'News Category', plural: 'News Categories' },
  access: {
    create: ({ req: { user } }) => canManageCategories(user),
    delete: ({ req: { user } }) => canManageCategories(user),
    update: adminOrEditor,
    read: anyone,
  },
  defaultPopulate: {
    title: true,
    slug: true,
  },
  admin: {
    defaultColumns: ['title', 'slug', 'updatedAt'],
    useAsTitle: 'title',
    group: 'News',
    description: 'Sections that news articles are filed under (e.g. Market).',
    components: {
      beforeListTable: [
        '@/Payload/components/HideCategorySelection#HideCategorySelection',
      ],
    },
  },
  disableBulkEdit: true,
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            {
              name: 'title',
              type: 'text',
              required: true,
              access: {
                update: ({ req: { user } }) => canManageCategories(user),
              },
            },
            {
              name: 'description',
              type: 'textarea',
              access: {
                update: ({ req: { user } }) => canManageCategories(user),
              },
              admin: {
                description:
                  'Optional short description shown on category pages.',
              },
            },
            {
              name: 'pinnedArticles',
              type: 'relationship',
              relationTo: 'news',
              hasMany: true,
              maxRows: 3,
              admin: {
                hidden: true,
                description:
                  'Optional. Featured articles pinned to the top of this category page. Pick up to 3. Only articles filed under this category can be pinned.',
              },
              filterOptions: ({ id }) => ({
                category: {
                  equals: id,
                },
              }),
            },
          ],
        },
        {
          name: 'meta',
          label: 'SEO',
          fields: [
            OverviewField({
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
              imagePath: 'meta.image',
            }),

            MetaTitleField({
              hasGenerateFn: true,
            }),
            MetaDescriptionField({
              hasGenerateFn: true,
            }),
            MetaImageField({
              relationTo: 'media',
            }),
            PreviewField({
              hasGenerateFn: true,
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
            }),
          ],
        },
      ],
    },

    slugField({
      slugify: unicodeSlugify,
      overrides: (field) => {
        const slug = field.fields[1];

        if (slug?.type === 'text' && slug.name === 'slug') {
          slug.admin = {
            ...slug.admin,
            components: {
              ...slug.admin?.components,
              Field: {
                clientProps: { useAsSlug: 'title' },
                path: '@/Payload/components/CategorySlugField#CategorySlugField',
              },
            },
          };
          slug.access = {
            ...slug.access,
            update: ({ req: { user } }) => canManageCategories(user),
          };
        }

        return field;
      },
    }),
  ],
  hooks: {
    afterChange: [revalidateNewsCategory],
    afterDelete: [revalidateNewsCategoryDelete],
  },
};
