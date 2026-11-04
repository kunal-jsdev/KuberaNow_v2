import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields';
import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical';
import {
  type CollectionConfig,
  type Field,
  type FieldHook,
  slugField,
  type TextField,
  type TextFieldSingleValidation,
  type Where,
} from 'payload';

import { authenticatedOrPublished } from '@/Payload/access/authenticatedOrPublished';
import { isAdmin } from '@/Payload/access/isAdmin';
import { staff } from '@/Payload/access/staff';
import { DefaultJustifyFeature } from '@/Payload/components/DefaultJustify';
import { WordCountFeature } from '@/Payload/components/WordCount';
import { populatePublishedAt } from '@/Payload/hooks/populatePublishedAt';
import { isAdminOrEditorUser } from '@/Payload/lib/Auth/roles';
import { generatePreviewPath } from '@/Payload/lib/utilities/generatePreviewPath';
import { unicodeSlugify, validateSlug } from '@/Payload/lib/utilities/slugify';

import { DEFAULT_DISCLAIMER, JUSTIFIED_RICH_TEXT_DEFAULT } from './constants';
import { generateAiSlugHandler } from './endpoints/generateAiSlug';
import { broadcastLiveBlog } from './hooks/broadcastLiveBlog';
import { clearPinnedArticleOnUnpublish } from './hooks/clearPinnedArticleOnUnpublish';
import { generateArticleId } from './hooks/generateArticleId';
import { populateAuthors } from './hooks/populateAuthors';
import { populateDisclaimer } from './hooks/populateDisclaimer';
import { populateMetaImage } from './hooks/populateMetaImage';
import { revalidateNews, revalidateNewsDelete } from './hooks/revalidateNews';
import { syncLiveBlogState } from './hooks/syncLiveBlogState';
import { syncScheduledPublishedAt } from './hooks/syncScheduledPublishedAt';

export const News: CollectionConfig<'news'> = {
  slug: 'news',
  access: {
    create: staff,
    delete: isAdmin,
    update: staff,
    read: authenticatedOrPublished,
  },
  endpoints: [
    {
      path: '/generate-ai-slug',
      method: 'post',
      handler: generateAiSlugHandler,
    },
  ],
  defaultPopulate: {
    title: true,
    article_id: true,
    slug: true,
    summary: true,
    heroImage: true,
    category: true,
    newsBy: true,
    publishedAt: true,
    _status: true,
    isLiveBlog: true,
    publishedIsLiveBlog: true,
    isInActiveBlogs: true,
    liveBlogStatus: true,
    liveUpdates: true,
  },
  defaultSort: '-publishedAt',
  admin: {
    defaultColumns: [
      'title',
      'article_id',
      'category',
      'author',
      'publishedAt',
      '_status',
    ],
    group: 'News',
    useAsTitle: 'title',
    baseListFilter: ({ req }): Where | null => {
      const tab = (req as any)?.query?.tab;
      if (tab === 'active-blogs') {
        return {
          or: [
            { isInActiveBlogs: { equals: true } },
            { isLiveBlog: { equals: true } },
            { publishedIsLiveBlog: { equals: true } },
          ],
        };
      }
      return null;
    },
    components: {
      beforeListTable: ['@/Payload/components/NewsListTabs#NewsListTabs'],
      edit: {
        PublishButton: '@/Payload/components/PublishButton#default',
      },
      views: {
        edit: {
          versions: {
            Component: '@/Payload/components/ArticleVersionsView#default',
          },
        },
      },
    },
    livePreview: {
      url: ({ data, req }) =>
        generatePreviewPath({
          slug: typeof data?.slug === 'string' ? data.slug : '',
          articleId: data?.article_id,
          category: data?.category,
          collection: 'news',
          req,
        }),
    },
    preview: (data, { req }) =>
      generatePreviewPath({
        slug: typeof data?.slug === 'string' ? data.slug : '',
        articleId: data?.article_id,
        category: data?.category,
        collection: 'news',
        req,
      }),
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
          label: 'Content',
          fields: [
            {
              name: 'summary',
              type: 'textarea',
              label: 'Description',
              required: true,
              admin: {
                description:
                  'Standfirst / summary shown below the headline and on cards.',
              },
            },
            {
              name: 'heroImage',
              type: 'upload',
              relationTo: 'media',
              required: true,
            },
            {
              name: 'showImageCaption',
              type: 'checkbox',
              label: 'Show Image Caption',
              defaultValue: true,
              admin: {
                description:
                  'Toggle the hero image caption on or off. Turning it off hides the caption without deleting the text below.',
              },
            },
            {
              name: 'imageCaption',
              type: 'text',
              admin: {
                description:
                  'Caption shown under the hero image, on the left (e.g. "નિફ્ટી 50 ઈન્ડેક્સ · સત્રની ગતિ · 9:15 AM થી 3:30 PM IST").',
                condition: (_data, siblingData) =>
                  Boolean(siblingData?.showImageCaption),
              },
            },
            {
              name: 'imageCredit',
              type: 'text',
              admin: {
                description:
                  'Photo credit shown under the hero image, on the right (e.g. KuberaNow).',
              },
            },
            {
              name: 'showKeyPoints',
              type: 'checkbox',
              label: 'Show Key Points',
              defaultValue: true,
              admin: {
                description:
                  'Toggle the "મુખ્ય મુદ્દાઓ" highlights box on or off. Turning it off hides the box without deleting the points below.',
              },
            },
            {
              name: 'keyPoints',
              type: 'array',
              label: 'Key Points',
              labels: {
                singular: 'Key Point',
                plural: 'Key Points',
              },
              admin: {
                description: 'Bulleted highlights box ("મુખ્ય મુદ્દાઓ").',
                condition: (_data, siblingData) =>
                  Boolean(siblingData?.showKeyPoints),
              },
              fields: [
                {
                  name: 'point',
                  type: 'text',
                  required: true,
                },
              ],
            },
            {
              name: 'content',
              type: 'richText',
              required: true,
              defaultValue: JUSTIFIED_RICH_TEXT_DEFAULT,
              editor: lexicalEditor({
                features: ({ rootFeatures }) => [
                  ...rootFeatures,
                  HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
                  FixedToolbarFeature(),
                  InlineToolbarFeature(),
                  DefaultJustifyFeature(),
                  WordCountFeature(),
                ],
              }),
              label: 'Body',
            },
            {
              name: 'showDisclaimer',
              type: 'checkbox',
              label: 'Show Disclaimer',
              defaultValue: true,
              admin: {
                description:
                  'Toggle the disclaimer on or off. Turning it off hides it without deleting the text below.',
              },
            },
            {
              name: 'disclaimer',
              type: 'textarea',
              label: 'Disclaimer',
              defaultValue: DEFAULT_DISCLAIMER,
              admin: {
                description:
                  'Prefilled with the standard investment disclaimer. Edit it for this article if needed.',
                condition: (_data, siblingData) =>
                  Boolean(siblingData?.showDisclaimer),
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
            MetaImageField({
              relationTo: 'media',
              hasGenerateFn: true,
            }),
            MetaDescriptionField({
              hasGenerateFn: true,
            }),
            PreviewField({
              hasGenerateFn: true,
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
            }),
          ],
        },
        {
          label: 'Live Blog',
          fields: [
            {
              name: 'isLiveBlog',
              label: 'Live Blog',
              type: 'checkbox',
              defaultValue: false,
              admin: {
                description:
                  'Toggle on to activate real-time Live Blog with milestone carousel and live blog feed.',
                components: {
                  Field:
                    '@/Payload/components/ToggleSwitchField#ToggleSwitchField',
                },
              },
            },
            {
              name: 'publishedIsLiveBlog',
              type: 'checkbox',
              defaultValue: false,
              admin: {
                hidden: true,
              },
            },
            {
              name: 'isInActiveBlogs',
              type: 'checkbox',
              defaultValue: false,
              index: true,
              admin: {
                hidden: true,
              },
            },
            {
              name: 'liveBlogStatus',
              type: 'select',
              defaultValue: 'active',
              options: [
                { label: 'Live / Active', value: 'active' },
                { label: 'Concluded / Closed', value: 'concluded' },
              ],
              admin: {
                hidden: true,
              },
              hooks: {
                beforeChange: [
                  ({ siblingData, data }) => {
                    const isLive = Boolean(
                      siblingData?.isLiveBlog ?? data?.isLiveBlog
                    );
                    return isLive ? 'active' : 'concluded';
                  },
                ],
              },
            },
            {
              name: 'liveUpdates',
              type: 'array',
              label: 'Live Blogs Timeline',
              labels: {
                singular: 'Live Blog',
                plural: 'Live Blogs',
              },
              admin: {
                description:
                  'Add real-time blog updates as the event/market unfolds. Most recent blogs are shown first to readers.',
                initCollapsed: false,
                isSortable: false,
                components: {
                  RowLabel:
                    '@/Payload/components/LiveBlogRowLabel#LiveBlogRowLabel',
                  beforeInput: [
                    '@/Payload/components/LiveBlogAddRow#LiveBlogAddRow',
                  ],
                },
              },
              fields: [
                {
                  name: 'timestamp',
                  type: 'date',
                  label: 'Blog Time',
                  required: true,
                  defaultValue: () => new Date().toISOString(),
                  validate: (value: unknown) => {
                    if (!value) {
                      return 'Blog time is required.';
                    }
                    const selectedDate =
                      value instanceof Date ? value : new Date(String(value));
                    if (isNaN(selectedDate.getTime())) {
                      return 'Please select a valid date and time.';
                    }
                    return true;
                  },
                  admin: {
                    date: {
                      pickerAppearance: 'dayAndTime',
                    },
                    description:
                      'Timestamp when this blog entry occurred. Cannot be in the future.',
                  },
                },
                {
                  name: 'headline',
                  type: 'text',
                  label: 'Blog Title / Headline',
                  required: true,
                },
                {
                  name: 'content',
                  type: 'richText',
                  label: 'Blog Content',
                  defaultValue: JUSTIFIED_RICH_TEXT_DEFAULT,
                  editor: lexicalEditor({
                    features: ({ rootFeatures }) => [
                      ...rootFeatures,
                      HeadingFeature({ enabledHeadingSizes: ['h3', 'h4'] }),
                      FixedToolbarFeature(),
                      InlineToolbarFeature(),
                      DefaultJustifyFeature(),
                    ],
                  }),
                },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'news-categories',
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'tags',
      type: 'relationship',
      relationTo: 'tags',
      hasMany: true,
      admin: {
        position: 'sidebar',
        allowCreate: false,
        allowEdit: true,
        description:
          'Search existing tags, or type a new name and press Enter or comma (,) to add it.',
        components: {
          Field: '@/Payload/components/TagsField#TagsField',
        },
      },
    },
    {
      name: 'newsBy',
      type: 'text',
      defaultValue: 'desk@kuberanow',
      hooks: {
        beforeValidate: [
          ({ value }) =>
            typeof value === 'string' && value.trim() !== ''
              ? value
              : 'desk@kuberanow',
        ],
      },
      admin: {
        position: 'sidebar',
        description:
          'Public NewsBy shown next to the date. Optional — falls back to "desk@kuberanow" when left blank.',
      },
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      defaultValue: ({ user }) => user?.id,
      admin: {
        position: 'sidebar',
        description:
          'Internal attribution (the user who wrote the article). Not shown publicly — use News By for that.',
        allowCreate: false,
        allowEdit: false,
      },
      access: {
        update: ({ req: { user } }) => isAdminOrEditorUser(user),
      },
    },
    {
      name: 'updatedBy',
      label: 'Last Modified By',
      type: 'relationship',
      relationTo: 'users',
      defaultValue: ({ user }) => user?.id,
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'User who last modified this article / version.',
        allowCreate: false,
        allowEdit: false,
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      index: true,
      defaultValue: () => new Date().toISOString(),
      admin: {
        position: 'sidebar',
        date: {
          pickerAppearance: 'dayAndTime',
        },
        description:
          'Prefilled with the current date & time. Editable — set any date/time you want.',
      },
    },
    slugField({
      slugify: unicodeSlugify,
      overrides: (field) => {
        const slug = field.fields.find(
          (f: Field) => 'name' in f && f.name === 'slug'
        ) as TextField | undefined;
        if (slug) {
          slug.label = 'URL';
          slug.validate = validateSlug(
            slug.validate as TextFieldSingleValidation | undefined
          );
          slug.hooks = {
            ...slug.hooks,
            beforeValidate: [
              ...(slug.hooks?.beforeValidate || []),
              (({ value, req, data }) => {
                if (typeof value === 'string') {
                  const slugified = unicodeSlugify({
                    data,
                    req,
                    valueToSlugify: value,
                  });
                  return slugified || value;
                }
                return value;
              }) as FieldHook,
            ],
          };
          if (slug.admin?.components) {
            // Assign the custom description component to show a soft warning
            slug.admin.components.Description =
              '@/Payload/collections/News/components/SlugDescription#SlugDescription';
            delete slug.admin.components.Error;
          }
        }

        field.fields.unshift({
          name: 'slugWarningUI',
          type: 'ui',
          admin: {
            components: {
              Field: '@/Payload/components/SlugWarning#SlugWarning',
            },
          },
        });

        return field;
      },
    }),
    {
      name: 'article_id',
      type: 'text',
      label: 'articleId',
      unique: true,
      index: true,
      hooks: {
        beforeChange: [generateArticleId],
      },
      admin: {
        position: 'sidebar',
        readOnly: true,
        description:
          'Auto-generated when the article is created: YYYYMMDD followed by a 5-digit daily sequence (e.g. 2026082000004). Assigned once and never changes.',
      },
    },
  ],
  hooks: {
    afterChange: [
      revalidateNews,
      clearPinnedArticleOnUnpublish,
      broadcastLiveBlog,
    ],
    afterRead: [populateDisclaimer],
    beforeChange: [
      populateAuthors,
      populatePublishedAt,
      populateMetaImage,
      syncScheduledPublishedAt,
      syncLiveBlogState,
    ],
    afterDelete: [revalidateNewsDelete],
  },
  versions: {
    drafts: {
      autosave: {
        interval: 3000,
      },
      // Scheduled publish/unpublish. The queued jobs are executed by the worker
      // configured under `jobs` in payload.config.ts — that must be running
      // (ENABLE_PAYLOAD_AUTORUN=true, or an external cron hitting
      // /api/payload-jobs/run) or scheduled articles silently never publish.
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
};
