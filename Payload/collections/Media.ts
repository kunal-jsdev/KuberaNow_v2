import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical';
import type { CollectionConfig } from 'payload';

import { anyone } from '@/Payload/access/anyone';
import { authenticated } from '@/Payload/access/authenticated';

export const Media: CollectionConfig = {
  slug: 'media',
  folders: true,
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
    {
      name: 'caption',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [
            ...rootFeatures,
            FixedToolbarFeature(),
            InlineToolbarFeature(),
          ];
        },
      }),
    },
    {
      name: 'filename',
      type: 'text',
      admin: {
        components: {
          Cell: '@/Payload/components/MediaThumbnailCell#MediaThumbnailCell',
        },
      },
    },
  ],
  upload: {
    disableLocalStorage: true,
    mimeTypes: ['image/jpeg', 'image/png', 'application/pdf', 'video/mp4'],
    adminThumbnail: ({ doc }) => {
      if (typeof doc.url === 'string' && doc.url) return doc.url;

      const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
      if (cloudName && typeof doc.filename === 'string' && doc.filename) {
        return `https://res.cloudinary.com/${cloudName}/image/upload/${doc.filename}`;
      }
      return null;
    },
    focalPoint: true,
    imageSizes: [],
  },
};
