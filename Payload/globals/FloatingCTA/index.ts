import type { GlobalConfig } from 'payload';

import { adminOrSeniorEditor } from '@/Payload/access/adminOrSeniorEditor';
import { authenticatedOrPublished } from '@/Payload/access/authenticatedOrPublished';
import { isEditorUser } from '@/Payload/lib/Auth/roles';

import {
  migrateLegacySize,
  syncLegacyFloatingCtaFields,
} from './hooks/migrateLegacySize';
import { revalidateFloatingCtaGlobal } from './hooks/revalidateFloatingCta';

const positionOptions = [
  { label: 'Bottom Right', value: 'bottom-right' },
  { label: 'Bottom Left', value: 'bottom-left' },
  { label: 'Top Right', value: 'top-right' },
  { label: 'Top Left', value: 'top-left' },
];

const dimensionValidator =
  (label: string) =>
  (val: unknown): true | string => {
    if (val === undefined || val === null || val === '') {
      return true;
    }
    const num = Number(val);
    if (isNaN(num) || !Number.isInteger(num)) {
      return `${label} must be a whole number (integer).`;
    }
    if (num < 20) {
      return `${label} must be at least 20px.`;
    }
    if (num > 1200) {
      return `${label} cannot exceed 1200px.`;
    }
    return true;
  };

const spacingValidator =
  (label: string) =>
  (val: unknown): true | string => {
    if (val === undefined || val === null || val === '') {
      return true;
    }
    const num = Number(val);
    if (isNaN(num) || !Number.isInteger(num)) {
      return `${label} must be a whole number (integer).`;
    }
    if (num < 0) {
      return `${label} cannot be negative.`;
    }
    if (num > 1000) {
      return `${label} cannot exceed 1000px.`;
    }
    return true;
  };

const urlValidator = (value: unknown): true | string => {
  if (!value || typeof value !== 'string' || value.trim() === '') {
    return true;
  }
  const trimmed = value.trim();
  const isUrl = /^https?:\/\//i.test(trimmed);
  const isRelative = trimmed.startsWith('/');
  const isCustomScheme = /^(whatsapp|tel|mailto):/i.test(trimmed);

  if (!isUrl && !isRelative && !isCustomScheme) {
    return 'Please enter a valid URL (starting with http://, https://, whatsapp://, mailto:, or an internal path starting with /).';
  }

  if (isUrl) {
    try {
      new URL(trimmed);
    } catch {
      return 'Please enter a valid formatted URL.';
    }
  }

  return true;
};

export const FloatingCTA: GlobalConfig = {
  slug: 'floating-cta',
  label: 'Floating CTA',
  access: {
    read: authenticatedOrPublished,
    update: adminOrSeniorEditor,
  },
  admin: {
    hidden: ({ user }) => isEditorUser(user),
    group: 'Globals',
    description:
      'Upload and manage the floating icon CTA for desktop and mobile screens.',
  },
  fields: [
    {
      name: 'lottieAutoSync',
      type: 'ui',
      admin: {
        components: {
          Field: '@/Payload/components/LottieAutoSync#LottieAutoSync',
        },
      },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Desktop',
          description:
            'Configure how the floating CTA appears on desktop screens.',
          fields: [
            {
              name: 'desktopEnabled',
              type: 'checkbox',
              label: 'On Desktop',
              defaultValue: true,
              admin: {
                description:
                  'Toggle on to display the floating CTA on desktop screens.',
                components: {
                  Field:
                    '@/Payload/components/ToggleSwitchField#ToggleSwitchField',
                },
              },
            },
            {
              name: 'desktopLottieJson',
              type: 'upload',
              relationTo: 'lottie-files',
              label: 'Lottie JSON',
              admin: {
                description:
                  'Select an uploaded Lottie JSON animation file for desktop screens (and default for mobile).',
                components: {
                  afterInput: [
                    '@/Payload/components/LottieThumbnail#LottieThumbnail',
                  ],
                },
              },
            },

            {
              name: 'desktopLink',
              type: 'text',
              label: 'Link',
              defaultValue:
                'https://www.whatsapp.com/channel/0029VbDPNhHISTkJEDTirJ16',
              validate: urlValidator,
              admin: {
                placeholder: 'https://whatsapp.com/channel/... or /contact',
                description:
                  'Destination URL when user clicks the floating CTA on desktop.',
                components: {
                  Field: '@/Payload/components/LinkField#LinkField',
                },
              },
            },

            {
              type: 'row',
              fields: [
                {
                  name: 'desktopPosition',
                  type: 'select',
                  label: 'Position',
                  options: positionOptions,
                  defaultValue: 'bottom-right',
                  admin: {
                    width: '33.33%',
                    description: 'Screen anchor corner',
                  },
                },
                {
                  name: 'desktopHorizontalSpacing',
                  type: 'number',
                  label: 'Horizontal Spacing (px)',
                  defaultValue: 24,
                  min: 0,
                  max: 1000,
                  validate: spacingValidator('Desktop horizontal spacing'),
                  admin: {
                    width: '33.33%',
                    placeholder: '24',
                    description: 'Offset from left or right edge (0 - 1000px)',
                  },
                },
                {
                  name: 'desktopVerticalSpacing',
                  type: 'number',
                  label: 'Vertical Spacing (px)',
                  defaultValue: 24,
                  min: 0,
                  max: 1000,
                  validate: spacingValidator('Desktop vertical spacing'),
                  admin: {
                    width: '33.33%',
                    placeholder: '24',
                    description: 'Offset from bottom or top edge (0 - 1000px)',
                  },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'desktopWidth',
                  type: 'number',
                  label: 'Width (px)',
                  defaultValue: 300,
                  min: 20,
                  max: 1200,
                  validate: dimensionValidator('Desktop width'),
                  admin: {
                    width: '50%',
                    placeholder: '300',
                    description: 'Width in pixels (20 - 1200px)',
                  },
                },
                {
                  name: 'desktopHeight',
                  type: 'number',
                  label: 'Height (px)',
                  defaultValue: 400,
                  min: 20,
                  max: 1200,
                  validate: dimensionValidator('Desktop height'),
                  admin: {
                    width: '50%',
                    placeholder: '400',
                    description: 'Height in pixels (20 - 1200px)',
                  },
                },
              ],
            },
          ],
        },
        {
          label: 'Mobile',
          description:
            'Configure how the floating CTA appears on mobile screens.',
          fields: [
            {
              name: 'mobileEnabled',
              type: 'checkbox',
              label: 'On Mobile',
              defaultValue: true,
              admin: {
                description:
                  'Toggle on to display the floating CTA on mobile screens.',
                components: {
                  Field:
                    '@/Payload/components/ToggleSwitchField#ToggleSwitchField',
                },
              },
            },
            {
              name: 'mobileLottieJson',
              type: 'upload',
              relationTo: 'lottie-files',
              label: 'Lottie JSON',
              admin: {
                description:
                  'Select a different Lottie JSON animation file for mobile screens if desired. If unselected or cleared, the desktop animation will be used.',
                components: {
                  afterInput: [
                    '@/Payload/components/LottieThumbnail#LottieThumbnail',
                  ],
                },
              },
            },

            {
              name: 'mobileLink',
              type: 'text',
              label: 'Link',
              defaultValue:
                'https://www.whatsapp.com/channel/0029VbDPNhHISTkJEDTirJ16',
              validate: urlValidator,
              admin: {
                placeholder: 'https://whatsapp.com/channel/... or /contact',
                description:
                  'Destination URL when user clicks the floating CTA on mobile.',
                components: {
                  Field: '@/Payload/components/LinkField#LinkField',
                },
              },
            },

            {
              type: 'row',
              fields: [
                {
                  name: 'mobilePosition',
                  type: 'select',
                  label: 'Position',
                  options: positionOptions,
                  defaultValue: 'bottom-right',
                  admin: {
                    width: '33.33%',
                    description: 'Screen anchor corner',
                  },
                },
                {
                  name: 'mobileHorizontalSpacing',
                  type: 'number',
                  label: 'Horizontal Spacing (px)',
                  defaultValue: 16,
                  min: 0,
                  max: 1000,
                  validate: spacingValidator('Mobile horizontal spacing'),
                  admin: {
                    width: '33.33%',
                    placeholder: '16',
                    description: 'Offset from left or right edge (0 - 1000px)',
                  },
                },
                {
                  name: 'mobileVerticalSpacing',
                  type: 'number',
                  label: 'Vertical Spacing (px)',
                  defaultValue: 16,
                  min: 0,
                  max: 1000,
                  validate: spacingValidator('Mobile vertical spacing'),
                  admin: {
                    width: '33.33%',
                    placeholder: '16',
                    description: 'Offset from bottom or top edge (0 - 1000px)',
                  },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'mobileWidth',
                  type: 'number',
                  label: 'Width (px)',
                  defaultValue: 180,
                  min: 20,
                  max: 1200,
                  validate: dimensionValidator('Mobile width'),
                  admin: {
                    width: '50%',
                    placeholder: '180',
                    description: 'Width in pixels (20 - 1200px)',
                  },
                },
                {
                  name: 'mobileHeight',
                  type: 'number',
                  label: 'Height (px)',
                  defaultValue: 240,
                  min: 20,
                  max: 1200,
                  validate: dimensionValidator('Mobile height'),
                  admin: {
                    width: '50%',
                    placeholder: '240',
                    description: 'Height in pixels (20 - 1200px)',
                  },
                },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'displayOn',
      type: 'select',
      defaultValue: 'both',
      options: [
        { label: 'Mobile', value: 'mobile' },
        { label: 'Desktop', value: 'desktop' },
        { label: 'Both', value: 'both' },
        { label: 'None', value: 'none' },
      ],
      admin: {
        hidden: true,
      },
    },
    {
      name: 'lottieJson',
      type: 'upload',
      relationTo: 'lottie-files',
      admin: {
        hidden: true,
      },
    },
    {
      name: 'link',
      type: 'text',
      admin: {
        hidden: true,
      },
    },
    {
      name: 'position',
      type: 'select',
      options: positionOptions,
      defaultValue: 'bottom-right',
      admin: {
        hidden: true,
      },
    },
    {
      name: 'horizontalSpacing',
      type: 'number',
      defaultValue: 24,
      admin: {
        hidden: true,
      },
    },
    {
      name: 'verticalSpacing',
      type: 'number',
      defaultValue: 24,
      admin: {
        hidden: true,
      },
    },
  ],
  hooks: {
    beforeChange: [syncLegacyFloatingCtaFields],
    afterChange: [revalidateFloatingCtaGlobal],
    afterRead: [migrateLegacySize],
  },
  versions: {
    drafts: true,
    max: 50,
  },
};
