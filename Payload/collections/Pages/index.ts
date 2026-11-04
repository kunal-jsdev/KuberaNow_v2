import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields';
import { type CollectionConfig, slugField } from 'payload';

import { authenticatedOrPublished } from '@/Payload/access/authenticatedOrPublished';
import { isAdmin } from '@/Payload/access/isAdmin';
import { Banner } from '@/Payload/components/Banner/config';
import { Content } from '@/Payload/components/Content/config';
import { populatePublishedAt } from '@/Payload/hooks/populatePublishedAt';
import { generatePreviewPath } from '@/Payload/lib/utilities/generatePreviewPath';

import { revalidateDelete, revalidatePage } from './hooks/revalidatePage';

export const Pages: CollectionConfig<'pages'> = {
  slug: 'pages',
  access: {
    create: isAdmin,
    delete: isAdmin,
    update: isAdmin,
    read: authenticatedOrPublished,
  },
  defaultPopulate: {
    title: true,
    slug: true,
  },
  admin: {
    defaultColumns: ['title', 'slug', 'updatedAt'],
    livePreview: {
      url: ({ data, req }) =>
        generatePreviewPath({
          slug: data?.slug,
          collection: 'pages',
          req,
        }),
    },
    preview: (data, { req }) =>
      generatePreviewPath({
        slug: data?.slug as string,
        collection: 'pages',
        req,
      }),
    useAsTitle: 'title',
    hidden: true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      type: 'tabs',
      tabs: [
        {
          fields: [
            {
              name: 'layout',
              type: 'blocks',
              blocks: [Content, Banner],
              admin: {
                initCollapsed: true,
              },
            },
          ],
          label: 'Content',
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
            MetaImageField({
              relationTo: 'media',
            }),

            MetaDescriptionField({}),
            PreviewField({
              // if the `generateUrl` function is configured
              hasGenerateFn: true,

              // field paths to match the target field for data
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
            }),
          ],
        },
      ],
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
      },
    },
    slugField(),
  ],
  hooks: {
    afterChange: [revalidatePage],
    beforeChange: [populatePublishedAt],
    afterDelete: [revalidateDelete],
  },
  versions: {
    drafts: {
      // Disabled: scheduled publishing needs a job runner to execute the queued
      // jobs. Nothing invokes the queue yet (no `jobs` config in payload.config.ts),
      // so anything scheduled would silently never publish.
      // schedulePublish: true,
    },
    maxPerDoc: 50,
  },
};
