import type { Block, Field } from 'payload';

import { clearUnusedSlideFields } from './clearUnusedSlideFields';
import { resolveSlideImage } from './resolveSlideImage';
import { validateSlideImage, validateYouTubeUrl } from './youtube';

const CAROUSEL_SLIDE_LIMIT = 5;

export const carouselFields: Field[] = [
  {
    name: 'enabled',
    type: 'checkbox',
    label: 'Enable carousel',
    defaultValue: true,
    admin: {
      description:
        'Uncheck to hide the carousel from the home page. Slides are kept and reappear when re-enabled.',
    },
  },
  {
    name: 'slides',
    type: 'array',
    required: true,
    minRows: 1,
    maxRows: CAROUSEL_SLIDE_LIMIT,
    labels: {
      singular: 'Slide',
      plural: 'Slides',
    },
    admin: {
      description: `Up to ${CAROUSEL_SLIDE_LIMIT} slides, shown in the order listed.`,
      initCollapsed: true,
    },
    hooks: {
      beforeChange: [clearUnusedSlideFields],
    },
    fields: [
      {
        name: 'mediaType',
        type: 'select',
        defaultValue: 'image',
        required: true,
        options: [
          { label: 'Image', value: 'image' },
          { label: 'YouTube Video', value: 'youtube' },
        ],
        admin: {
          description:
            'A YouTube slide needs only a URL. An image slide also takes an article and headline.',
        },
      },
      // Article and title apply to image slides only: a YouTube slide plays the
      // video and uses neither, so both are hidden to keep that form to just the
      // media type and the URL.
      {
        name: 'article',
        type: 'relationship',
        relationTo: 'news',
        admin: {
          description:
            'Optional. Supplies the fallback title and image, and the link target. Leave blank for a standalone slide.',
          condition: (_data, siblingData) =>
            siblingData?.mediaType !== 'youtube',
        },
      },
      {
        name: 'title',
        type: 'text',
        admin: {
          description:
            'Optional headline. Falls back to the article title when an article is attached.',
          condition: (_data, siblingData) =>
            siblingData?.mediaType !== 'youtube',
        },
      },
      {
        name: 'imageOverride',
        type: 'upload',
        relationTo: 'media',
        label: 'Image',
        admin: {
          description:
            "Required when no article is attached, otherwise falls back to the article's hero image.",
          condition: (_data, siblingData) =>
            siblingData?.mediaType !== 'youtube',
        },
        validate: validateSlideImage,
      },
      {
        name: 'youtubeUrl',
        type: 'text',
        label: 'YouTube URL',
        admin: {
          description: 'Paste a YouTube watch, youtu.be, embed, or Shorts URL.',
          condition: (_data, siblingData) =>
            siblingData?.mediaType === 'youtube',
        },
        validate: validateYouTubeUrl,
      },
      {
        name: 'resolvedImage',
        type: 'text',
        virtual: true,
        admin: {
          hidden: true,
          readOnly: true,
        },
        hooks: {
          afterRead: [resolveSlideImage],
        },
      },
    ],
  },
];

export const Carousel: Block = {
  slug: 'carousel',
  interfaceName: 'CarouselBlock',
  labels: {
    singular: 'Carousel',
    plural: 'Carousels',
  },
  fields: carouselFields,
};
