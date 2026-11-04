import { type CollectionConfig } from 'payload';

import { anyone } from '@/Payload/access/anyone';
import { isAdmin } from '@/Payload/access/isAdmin';

export const NewsSearchCounts: CollectionConfig<'news-search-counts'> = {
  slug: 'news-search-counts',
  access: {
    create: () => false,
    update: () => false,
    delete: isAdmin,
    read: anyone,
  },
  admin: {
    hidden: process.env.NEXT_PAYLOAD_NEWS_SEARCH_COUNTS_HIDDEN === 'true',
    defaultColumns: ['article', 'count', 'lastSearchedAt'],
    useAsTitle: 'article',
    group: 'News',
    description:
      'How often each article was opened from search. Powers Top Searches. Read-only — counts are maintained by the site.',
  },
  fields: [
    {
      name: 'article',
      type: 'relationship',
      relationTo: 'news',
      required: true,
      unique: true,
      index: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'count',
      type: 'number',
      required: true,
      defaultValue: 0,
      index: true,
      admin: {
        readOnly: true,
        description: 'Times this article was opened from a search result.',
      },
    },
    {
      name: 'lastSearchedAt',
      type: 'date',
      admin: {
        readOnly: true,
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
  ],
};
