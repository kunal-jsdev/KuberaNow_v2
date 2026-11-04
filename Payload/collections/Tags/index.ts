import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields';
import { type CollectionConfig, slugField } from 'payload';

import { anyone } from '@/Payload/access/anyone';
import { staff } from '@/Payload/access/staff';
import { unicodeSlugify } from '@/Payload/lib/utilities/slugify';
import { isValidTagTitle, TAG_TITLE_RULE } from '@/utils/titleRules';

import { ensureUniqueSlug } from './hooks/ensureUniqueSlug';
import { ensureUniqueTitle } from './hooks/ensureUniqueTitle';
import {
  revalidateTagChange,
  revalidateTagDelete,
} from './hooks/revalidateTag';

export const Tags: CollectionConfig<'tags'> = {
  slug: 'tags',
  labels: {
    singular: 'Tag',
    plural: 'Tags',
  },
  access: {
    create: staff,
    delete: staff,
    update: staff,
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
    description: 'Free-form tags applied to news articles (e.g. Nifty 50).',
  },
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
              unique: true,
              admin: {
                description:
                  'Only alphabets (a-z, A-Z), numbers (0-9), spaces and hyphens (-) are allowed.',
              },
              validate: (value: string | null | undefined) => {
                if (!value) return 'Title is required.';
                if (!isValidTagTitle(value))
                  return `Tag name ${TAG_TITLE_RULE}`;
                return true;
              },
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
    slugField({ slugify: unicodeSlugify }),
  ],
  hooks: {
    beforeValidate: [ensureUniqueTitle],
    beforeChange: [ensureUniqueSlug],
    afterChange: [revalidateTagChange],
    afterDelete: [revalidateTagDelete],
  },
};
