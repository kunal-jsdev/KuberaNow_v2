import type { Block, CollectionSlug, Field, GlobalConfig } from 'payload';

import { adminOrSeniorEditor } from '@/Payload/access/adminOrSeniorEditor';
import { anyone } from '@/Payload/access/anyone';
import { isEditorUser } from '@/Payload/lib/Auth/roles';

import { revalidateNavConfig } from './hooks/revalidateNavConfig';

/**
 * Nav entries can point at a news category or a manually added custom nav
 * link (title + slug), both picked from the same dropdown.
 */
const NAV_LINK_RELATIONS: CollectionSlug[] = [
  'news-categories',
  'custom-nav-links',
];

/**
 * Header navigation blocks:
 * 1. Page Link — direct link to a category or custom link with optional "NEW" badge.
 * 2. Group — title with multiple categories / custom links in a dropdown, with optional "NEW" badge.
 */
const headerPageLinkBlock: Block = {
  slug: 'pageLink',
  labels: {
    singular: 'Page Link',
    plural: 'Page Links',
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'enabled',
          type: 'checkbox',
          label: 'Enabled',
          defaultValue: true,
          admin: {
            width: '15%',
            description: 'Turn off to hide this category from the navigation.',
          },
        },
        {
          name: 'showNew',
          type: 'checkbox',
          label: 'Show "New"',
          defaultValue: false,
          admin: {
            width: '15%',
            description:
              'Display a "NEW" indicator/icon next to this category in the navigation.',
          },
        },
        {
          name: 'page',
          type: 'relationship',
          relationTo: NAV_LINK_RELATIONS,
          label: 'Page',
          required: true,
          admin: {
            className: 'nav-page-select',
            components: {
              Field:
                '@/Payload/components/NavPageRelationshipField#NavPageRelationshipField',
            },
            allowCreate: false,
            width: '70%',
            description:
              'Pick a category or custom nav link page to show as a nav link.',
          },
        },
      ],
    },
  ],
};

const headerNavGroupBlock: Block = {
  slug: 'navGroup',
  labels: {
    singular: 'Group',
    plural: 'Groups',
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'enabled',
          type: 'checkbox',
          label: 'Enabled',
          defaultValue: true,
          admin: {
            width: '15%',
            description: 'Turn off to hide this group from the navigation.',
          },
        },
        {
          name: 'showNew',
          type: 'checkbox',
          label: 'Show "New"',
          defaultValue: false,
          admin: {
            width: '15%',
            description:
              'Display a "NEW" indicator/icon next to this group in the navigation.',
          },
        },
        {
          name: 'title',
          type: 'text',
          label: 'Group Title',
          required: true,
          admin: {
            width: '30%',
            description:
              'The display name for this group (e.g. "Markets"). Shown as the group label in the navigation.',
          },
        },
        {
          name: 'pages',
          type: 'relationship',
          relationTo: NAV_LINK_RELATIONS,
          hasMany: true,
          label: 'Pages',
          required: true,
          admin: {
            className: 'nav-page-select',
            components: {
              Field:
                '@/Payload/components/NavPageRelationshipField#NavPageRelationshipField',
            },
            allowCreate: false,
            width: '40%',
            description:
              'Select the pages (categories or custom nav links) shown inside the group dropdown.',
          },
        },
      ],
    },
  ],
};

const headerNavBlocks: Block[] = [headerPageLinkBlock, headerNavGroupBlock];

/**
 * Hamburger navigation blocks:
 * "Show New" checkbox is removed completely from Hamburger blocks so it only appears in Header navigation.
 */
const hamburgerPageLinkBlock: Block = {
  slug: 'pageLink',
  labels: {
    singular: 'Page Link',
    plural: 'Page Links',
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'enabled',
          type: 'checkbox',
          label: 'Enabled',
          defaultValue: true,
          admin: {
            width: '20%',
            description: 'Turn off to hide this category from the navigation.',
          },
        },
        {
          name: 'page',
          type: 'relationship',
          relationTo: NAV_LINK_RELATIONS,
          label: 'Page',
          required: true,
          admin: {
            className: 'nav-page-select',
            components: {
              Field:
                '@/Payload/components/NavPageRelationshipField#NavPageRelationshipField',
            },
            allowCreate: false,
            width: '80%',
            description:
              'Pick a category or custom nav link page to show as a nav link.',
          },
        },
      ],
    },
  ],
};

const hamburgerNavGroupBlock: Block = {
  slug: 'navGroup',
  labels: {
    singular: 'Group',
    plural: 'Groups',
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'enabled',
          type: 'checkbox',
          label: 'Enabled',
          defaultValue: true,
          admin: {
            width: '15%',
            description: 'Turn off to hide this group from the navigation.',
          },
        },
        {
          name: 'title',
          type: 'text',
          label: 'Group Title',
          required: true,
          admin: {
            width: '35%',
            description:
              'The display name for this group (e.g. "Markets"). Shown as the group label in the navigation.',
          },
        },
        {
          name: 'pages',
          type: 'relationship',
          relationTo: NAV_LINK_RELATIONS,
          hasMany: true,
          label: 'Pages',
          required: true,
          admin: {
            className: 'nav-page-select',
            components: {
              Field:
                '@/Payload/components/NavPageRelationshipField#NavPageRelationshipField',
            },
            allowCreate: false,
            width: '50%',
            description:
              'Select the pages (categories or custom nav links) shown inside the group dropdown.',
          },
        },
      ],
    },
  ],
};

const hamburgerNavBlocks: Block[] = [
  hamburgerPageLinkBlock,
  hamburgerNavGroupBlock,
];

const getStaticDropdownSettingsFields = (
  tabLabel: 'Header' | 'Hamburger'
): Field[] => [
  {
    name: 'staticDropdown',
    type: 'group',
    label: `${tabLabel} Static Pages Dropdown`,
    admin: {
      description: `Customize the "${tabLabel === 'Header' ? 'header dropdown' : 'hamburger accordion'}" that links to the static pages (Why Kubera, About Us, etc.).`,
    },
    fields: [
      {
        type: 'row',
        fields: [
          {
            name: 'staticDropdownEnabled',
            type: 'checkbox',
            label: 'Enabled',
            defaultValue: true,
            admin: {
              width: '20%',
              description: `Turn this off to hide the static pages dropdown in the ${tabLabel.toLowerCase()}.`,
            },
          },
          {
            name: 'staticDropdownLabel',
            type: 'text',
            label: `${tabLabel} Dropdown Title`,
            defaultValue: 'Kubera Now',
            admin: {
              width: '40%',
              description: `Controls the static pages dropdown title shown in the ${tabLabel.toLowerCase()}.`,
            },
          },
          {
            name: 'staticDropdownPages',
            type: 'relationship',
            relationTo: NAV_LINK_RELATIONS,
            hasMany: true,
            label: 'Pages',
            admin: {
              width: '40%',
              className: 'nav-page-select',
              components: {
                Field:
                  '@/Payload/components/NavPageRelationshipField#NavPageRelationshipField',
              },
              allowCreate: false,
              description:
                'Pages shown inside this dropdown, in this order (drag to reorder). Add static pages such as Why Kubera or About Us as Custom Nav Links first. Leave empty to hide the dropdown.',
            },
          },
        ],
      },
    ],
  },
];

/**
 * NavConfig — controls what appears in the frontend site navigation (Header & Hamburger).
 *
 * Provides two tabs:
 * 1. Header — Category links and dropdown groups for the header navigation bar.
 * 2. Hamburger — Category links and accordion groups for the hamburger menu.
 */
export const NavConfig: GlobalConfig = {
  slug: 'nav-config',
  label: 'Navigation',
  access: {
    read: anyone,
    update: adminOrSeniorEditor,
  },
  admin: {
    hidden: ({ user }) => isEditorUser(user),
    group: 'Navigation',
    description:
      'Control the order and grouping of categories in the site header and hamburger navigation.',
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          name: 'header',
          label: 'Header',
          fields: [
            {
              name: 'navItems',
              type: 'blocks',
              label: 'Header Navigation Items',
              labels: {
                singular: 'Item',
                plural: 'Items',
              },
              admin: {
                className: 'flat-blocks',
                initCollapsed: false,
                description:
                  'Add Page Links and Groups in the order they should appear in the header nav. Drag rows to reorder.',
              },
              blocks: headerNavBlocks,
            },
            ...getStaticDropdownSettingsFields('Header'),
          ],
        },
        {
          name: 'hamburger',
          label: 'Hamburger',
          fields: [
            {
              name: 'navItems',
              type: 'blocks',
              label: 'Hamburger Navigation Items',
              labels: {
                singular: 'Item',
                plural: 'Items',
              },
              admin: {
                className: 'flat-blocks',
                initCollapsed: false,
                description:
                  'Add Page Links and Groups in the order they should appear in the hamburger menu. Drag rows to reorder.',
              },
              blocks: hamburgerNavBlocks,
            },
            ...getStaticDropdownSettingsFields('Hamburger'),
          ],
        },
      ],
    },
  ],
  hooks: {
    afterRead: [
      ({ doc }) => {
        // Backwards compatibility: if data was previously saved at root navItems,
        // populate header.navItems so existing data appears seamlessly in the Header tab.
        if (doc && !doc.header?.navItems && doc.navItems) {
          if (!doc.header) doc.header = {};
          doc.header.navItems = doc.navItems;
        }
        return doc;
      },
    ],
    afterChange: [revalidateNavConfig],
  },
};
