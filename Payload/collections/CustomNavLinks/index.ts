import type { CollectionConfig } from 'payload';

import { adminOrEditor } from '@/Payload/access/adminOrEditor';
import { anyone } from '@/Payload/access/anyone';

import {
  HOME_SLUG,
  normalizeNavLinkSlug,
  removeCustomNavLinkFromNav,
  revalidateCustomNavLink,
} from './hooks/customNavLinkHooks';

// \p{M} keeps combining marks such as Gujarati vowel signs.
const SLUG_PATTERN = /^[\p{L}\p{M}\p{N}-]+(\/[\p{L}\p{M}\p{N}-]+)*$/u;

/**
 * CustomNavLinks — manually added nav entries (title + slug) for pages that
 * are not news categories. They can be picked alongside categories in the
 * Navigation global's Page Link and Group dropdowns.
 */
export const CustomNavLinks: CollectionConfig<'custom-nav-links'> = {
  slug: 'custom-nav-links',
  labels: {
    singular: 'Custom Nav Link',
    plural: 'Custom Nav Links',
  },
  access: {
    create: adminOrEditor,
    delete: adminOrEditor,
    update: adminOrEditor,
    read: anyone,
  },
  defaultPopulate: {
    title: true,
    slug: true,
  },
  admin: {
    defaultColumns: ['title', 'slug', 'updatedAt'],
    useAsTitle: 'title',
    group: 'Navigation',
    description:
      'Manual nav links for pages that are not categories. Pick them in Navigation → Page Link or Group.',
    components: {
      edit: {
        // Returns to the list after creating a new link.
        SaveButton:
          '@/Payload/components/SaveAndReturnButton#SaveAndReturnButton',
      },
    },
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'title',
          type: 'text',
          label: 'Title',
          required: true,
          admin: {
            width: '50%',
            description: 'Label shown in the navigation.',
          },
        },
        {
          name: 'slug',
          type: 'text',
          label: 'Slug',
          unique: true,
          index: true,
          admin: {
            width: '50%',
            description:
              'Page path without the leading "/" (e.g. "why-kubera" or "market/ipo"). Use "/" or leave empty for the home page.',
          },
          hooks: {
            beforeValidate: [normalizeNavLinkSlug],
          },
          validate: (value: string | null | undefined) => {
            if (!value || value === HOME_SLUG) return true;
            if (!SLUG_PATTERN.test(value))
              return 'Use letters, numbers and hyphens only, with "/" between path segments.';
            return true;
          },
        },
      ],
    },
  ],
  hooks: {
    afterChange: [revalidateCustomNavLink],
    afterDelete: [removeCustomNavLinkFromNav],
  },
};
