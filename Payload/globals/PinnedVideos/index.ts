import type { GlobalConfig, Where } from 'payload';

import { adminOrEditor } from '@/Payload/access/adminOrEditor';
import { authenticatedOrPublished } from '@/Payload/access/authenticatedOrPublished';
import { revalidateVideoPageGlobal } from '@/Payload/hooks/revalidateVideoPage';

const PINNED_VIDEO_COUNT = 3;

/**
 * A global to store pinned videos for the videos section.
 */
export const PinnedVideos: GlobalConfig = {
  slug: 'pinned-videos',
  label: 'Pinned Videos',
  access: {
    read: authenticatedOrPublished,
    update: adminOrEditor,
  },
  admin: {
    group: 'Video Collection',
    description: `Up to ${PINNED_VIDEO_COUNT} vertical and ${PINNED_VIDEO_COUNT} horizontal videos highlighted in the videos section.`,
  },
  fields: [
    {
      name: 'ratio',
      type: 'select',
      label: 'Ratio',
      options: [
        { label: 'Horizontal (16:9)', value: '16:9' },
        { label: 'Vertical (9:16)', value: '9:16' },
      ],
      defaultValue: '16:9',
      required: true,
      admin: {
        description: 'Select a ratio to view or update its pinned videos.',
      },
    },
    {
      name: 'horizontalVideos',
      type: 'relationship',
      relationTo: 'videos',
      label: 'Pinned Horizontal Videos',
      hasMany: true,
      maxRows: PINNED_VIDEO_COUNT,
      admin: {
        condition: (data, siblingData) => siblingData?.ratio === '16:9',
        description: `Select up to ${PINNED_VIDEO_COUNT} horizontal videos (16:9).`,
      },
      filterOptions: (): Where => ({
        and: [
          { _status: { equals: 'published' } },
          { ratio: { equals: '16:9' } },
        ],
      }),
    },
    {
      name: 'verticalVideos',
      type: 'relationship',
      relationTo: 'videos',
      label: 'Pinned Vertical Videos',
      hasMany: true,
      maxRows: PINNED_VIDEO_COUNT,
      admin: {
        condition: (data, siblingData) => siblingData?.ratio === '9:16',
        description: `Select up to ${PINNED_VIDEO_COUNT} vertical videos (9:16).`,
      },
      filterOptions: (): Where => ({
        and: [
          { _status: { equals: 'published' } },
          { ratio: { equals: '9:16' } },
        ],
      }),
    },
  ],
  hooks: {
    afterChange: [revalidateVideoPageGlobal],
  },
  versions: {
    drafts: {
      // Disabled for same reasons as PinnedArticles
    },
    max: 50,
  },
};
