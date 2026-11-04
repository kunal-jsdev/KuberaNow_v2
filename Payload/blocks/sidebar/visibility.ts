import type { Field } from 'payload';

/** The market sub-pages a widget can be targeted at. */
export const MARKET_PAGES = [
  { label: 'Stocks', value: 'stocks' },
  { label: 'Crypto', value: 'crypto' },
] as const;

/** The video pages a widget can be targeted at. */
export const VIDEO_PAGES = [
  { label: 'Videos page', value: 'videos' },
  { label: 'Detailed video page', value: 'video-detail' },
  { label: 'Short videos page', value: 'shorts' },
  { label: 'Detailed shorts page', value: 'short-detail' },
] as const;

export type VideoPage = (typeof VIDEO_PAGES)[number]['value'];

/**
 * The "where does this widget appear" collapsible, shared by every sidebar
 * block so the field names stay identical across them — the frontend filters
 * on one shape regardless of which widget it is reading.
 *
 * @param noun - what the widget is called in the field descriptions, e.g. "ad".
 */
export const visibilityFields = (noun = 'widget'): Field => ({
  type: 'collapsible',
  label: 'Visibility',
  admin: {
    initCollapsed: false,
    description: `Choose which pages this ${noun} appears on.`,
  },
  fields: [
    {
      name: 'selectAllPages',
      type: 'checkbox',
      label: 'Select All Pages',
      defaultValue: true,
      admin: {
        components: {
          Field: '@/Payload/components/SelectAllPages#SelectAllPages',
        },
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'showOnHome',
          type: 'checkbox',
          label: 'Home Page',
          defaultValue: true,
          admin: {
            description: `Show this ${noun} on the home page.`,
          },
        },
        {
          name: 'showOnArticle',
          type: 'checkbox',
          label: 'Article Details Page',
          defaultValue: true,
          admin: {
            description: `Show this ${noun} on article detail pages.`,
          },
        },
        {
          name: 'showOnTag',
          type: 'checkbox',
          label: 'Tags Page',
          defaultValue: true,
          admin: {
            description: `Show this ${noun} on tag pages.`,
          },
        },
        {
          name: 'showOnCategory',
          type: 'checkbox',
          label: 'Category Pages',
          defaultValue: true,
          admin: {
            description: `Show this ${noun} on category pages.`,
          },
        },
        {
          name: 'showOnMarket',
          type: 'checkbox',
          label: 'Market Pages',
          defaultValue: true,
          admin: {
            description: `Show this ${noun} on market pages.`,
          },
        },
        {
          name: 'showOnVideo',
          type: 'checkbox',
          label: 'Video Pages',
          defaultValue: true,
          admin: {
            description: `Show this ${noun} on video and shorts pages.`,
          },
        },
      ],
    },
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'news-categories',
      hasMany: true,
      label: 'Category Pages',
      admin: {
        condition: (_data, siblingData) => Boolean(siblingData?.showOnCategory),
        components: {
          Field:
            '@/Payload/components/CategoryVisibilityField#CategoryVisibilityField',
        },
        description: `Only applies on category pages everywhere else this ${noun} always shows. Pick "All Categories" to show it on every category page, or choose specific ones.`,
      },
    },
    {
      name: 'marketPages',
      type: 'select',
      hasMany: true,
      options: [...MARKET_PAGES],
      label: 'Market Pages',
      admin: {
        condition: (_data, siblingData) => Boolean(siblingData?.showOnMarket),
        components: {
          Field: {
            path: '@/Payload/components/PagesVisibilityField#PagesVisibilityField',
            clientProps: { allLabel: 'All Market Pages' },
          },
        },
        description: `Only applies on market pages everywhere else this ${noun} always shows. Leave as "All Market Pages" to show it on every market page, or choose specific ones.`,
      },
    },
    {
      name: 'videoPages',
      type: 'select',
      hasMany: true,
      options: [...VIDEO_PAGES],
      label: 'Video Pages',
      admin: {
        condition: (_data, siblingData) => Boolean(siblingData?.showOnVideo),
        components: {
          Field: {
            path: '@/Payload/components/PagesVisibilityField#PagesVisibilityField',
            clientProps: { allLabel: 'All Video Pages' },
          },
        },
        description: `Only applies on video pages everywhere else this ${noun} always shows. Leave as "All Video Pages" to show it on every video page, or choose specific ones.`,
      },
    },
  ],
});

export default visibilityFields;
