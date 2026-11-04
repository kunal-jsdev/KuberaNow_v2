import type { CollectionConfig } from 'payload';

import { anyone } from '@/Payload/access/anyone';
import { staff } from '@/Payload/access/staff';

export const LottieFiles: CollectionConfig<'lottie-files'> = {
  slug: 'lottie-files',
  labels: {
    singular: 'Lottie File',
    plural: 'Lottie Files',
  },
  access: {
    create: staff,
    delete: staff,
    update: staff,
    read: anyone,
  },
  admin: {
    group: 'Layout',
    hidden: true,
  },
  upload: {
    mimeTypes: ['application/json'],
    disableLocalStorage: true,
  },
  fields: [
    {
      name: 'filename',
      type: 'text',
      admin: {
        components: {
          Cell: '@/Payload/components/LottieFileNameCell#LottieFileNameCell',
        },
      },
    },
    {
      name: 'lottiePreview',
      type: 'ui',
      admin: {
        disableListColumn: true,
        components: {
          Field:
            '@/Payload/components/LottieFileDetailsPreview#LottieFileDetailsPreview',
        },
      },
    },
  ],
};
