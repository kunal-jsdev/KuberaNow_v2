import type { Block } from 'payload';

import { visibilityFields } from './visibility';

const NEWS_PER_CARD = 4;

// Accepts the shapes editors actually paste: watch links, share links, embeds
// and shorts, with or without a scheme or `www.`.
const YOUTUBE_URL =
  /^(https?:\/\/)?(www\.|m\.)?(youtube\.com\/(watch\?(.*&)?v=|embed\/|shorts\/|live\/)[\w-]{11}|youtu\.be\/[\w-]{11})/i;

/**
 * A promotional image, e.g. the KuberaNow bulletin banner.
 */
export const SidebarAdBlock: Block = {
  slug: 'sidebarAd',
  interfaceName: 'SidebarAdBlock',
  labels: {
    singular: 'Advertisement',
    plural: 'Advertisements',
  },
  fields: [
    {
      name: 'adType',
      type: 'select',
      label: 'Ad Type',
      required: true,
      defaultValue: 'image',
      options: [
        { label: 'Normal Image', value: 'image' },
        { label: 'Lottie Animation (JSON)', value: 'lottie' },
      ],
      admin: {
        description:
          'Normal Image for PNG, JPG or WebP. Lottie Animation for a .json file exported from Lottie or After Effects.',
      },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      admin: {
        className: 'ad-image-field',
        condition: (_data, siblingData) => siblingData?.adType !== 'lottie',
      },
      validate: (
        value: unknown,
        { siblingData }: { siblingData?: unknown }
      ) => {
        const adType = (siblingData as { adType?: string })?.adType;

        if (adType !== 'lottie' && !value) return 'Please choose an image.';

        return true;
      },
    },
    {
      name: 'lottieFile',
      type: 'upload',
      relationTo: 'media',
      label: 'Lottie JSON',
      admin: {
        components: {
          // Lottie files are not images, so the stock upload preview falls back
          // to a generic file icon. See the component for details.
          Field: '@/Payload/components/LottieUploadField#LottieUploadField',
        },
        condition: (_data, siblingData) => siblingData?.adType === 'lottie',
        description:
          'Upload the .json animation file. Lottie files are not images, so they need their own player.',
      },
      validate: (
        value: unknown,
        { siblingData }: { siblingData?: unknown }
      ) => {
        const adType = (siblingData as { adType?: string })?.adType;

        if (adType === 'lottie' && !value)
          return 'Please upload a Lottie JSON file.';

        return true;
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'href',
          type: 'text',
          label: 'Link URL',
          admin: {
            width: '50%',
            className: 'text-href',
            description:
              'Optional. Leave blank to make the ad non-clickable. For a page on this site, enter only the path, e.g. ipo, india, or gujarat. For another website, enter the full address, e.g. https://example.com or www.google.com.',
          },
        },
        {
          name: 'label',
          type: 'text',
          defaultValue: 'Advertisement by KuberaNow',
          admin: {
            width: '50%',
            description:
              'Caption shown under the image. Leave blank to hide it.',
          },
        },
      ],
    },
    visibilityFields('ad'),
  ],
};

export const SidebarVideoBlock: Block = {
  slug: 'sidebarVideo',
  interfaceName: 'SidebarVideoBlock',
  labels: {
    singular: 'YouTube Video',
    plural: 'YouTube Videos',
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'url',
          type: 'text',
          label: 'YouTube URL',
          required: true,
          admin: {
            description:
              'Paste the YouTube link, e.g. https://www.youtube.com/watch?v=OmmQTwLSwsI or https://youtu.be/dQw4w9WgXcQ.',
            width: '50%',
          },
          validate: (value: string | null | undefined) => {
            if (!value?.trim()) return 'Please enter a YouTube URL.';

            return YOUTUBE_URL.test(value.trim())
              ? true
              : 'That does not look like a YouTube video link. Use a youtube.com/watch, youtu.be, /embed or /shorts URL.';
          },
        },
        {
          name: 'heading',
          type: 'text',
          admin: {
            description: 'Optional title shown above the video.',
            width: '50%',
          },
        },
      ],
    },
    {
      name: 'autoplay',
      type: 'checkbox',
      label: 'Autoplay',
      defaultValue: false,
      admin: {
        description: 'Start the video automatically.',
      },
    },
    visibilityFields('video'),
  ],
};

/**
 * A numbered list of hand-picked articles from one category.
 */
export const SidebarNewsBlock: Block = {
  slug: 'sidebarNews',
  interfaceName: 'SidebarNewsBlock',
  labels: {
    singular: 'Category News List',
    plural: 'Category News Lists',
  },
  fields: [
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'news-categories',
      required: true,
      admin: {
        description:
          'Sets the card heading and the "See more" link, and filters the articles below.',
      },
    },
    {
      name: 'heading',
      type: 'text',
      admin: {
        description: 'Optional. Falls back to the category name when blank.',
      },
    },
    {
      name: 'articles',
      type: 'relationship',
      relationTo: 'news',
      hasMany: true,
      minRows: 1,
      maxRows: NEWS_PER_CARD,
      admin: {
        description: `Pick up to ${NEWS_PER_CARD} articles, shown in the order listed.`,
      },
      // Only articles filed under the category chosen above.
      filterOptions: ({ siblingData }) => {
        const category = (siblingData as { category?: unknown })?.category;

        if (!category) return true;

        return {
          category: {
            equals:
              typeof category === 'object' && category !== null
                ? (category as { id: string }).id
                : category,
          },
        };
      },
    },
    {
      name: 'showSeeMore',
      type: 'checkbox',
      label: 'Show "See more" link',
      defaultValue: true,
    },
    visibilityFields('list'),
  ],
};

export const sidebarBlocks: Block[] = [
  SidebarAdBlock,
  SidebarVideoBlock,
  SidebarNewsBlock,
];
