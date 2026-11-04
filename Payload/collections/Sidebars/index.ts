import {
  type Block,
  type CollectionConfig,
  type Field,
  type FieldAccess,
} from 'payload';

import { adminOrSeniorEditor } from '@/Payload/access/adminOrSeniorEditor';
import { anyone } from '@/Payload/access/anyone';
import { staff } from '@/Payload/access/staff';
import { sidebarBlocks } from '@/Payload/blocks/sidebar';
import { isAdminOrSeniorEditorUser } from '@/Payload/lib/Auth/roles';

import { restrictEditorChanges } from './hooks/restrictEditorChanges';
import {
  revalidateSidebar,
  revalidateSidebarDelete,
} from './hooks/revalidateSidebar';

/** Fields editors may still change: the articles pinned in a news widget. */
const EDITOR_EDITABLE_FIELDS = ['articles'];

const canConfigureSidebar: FieldAccess = ({ req: { user } }) =>
  isAdminOrSeniorEditorUser(user);

/**
 * Makes every field read-only for plain editors except the ones listed in
 * `EDITOR_EDITABLE_FIELDS`, recursing through rows and collapsibles.
 * `restrictEditorChanges` enforces the same rule for block rows.
 */
const lockForEditors = (fields: Field[]): Field[] =>
  fields.map((field) => {
    // Blocks are locked per sub-field instead (see `editorLockedSidebarBlocks`),
    // otherwise editors could not reach the articles inside them.
    if (
      field.type === 'blocks' ||
      ('name' in field && EDITOR_EDITABLE_FIELDS.includes(field.name))
    ) {
      return field;
    }

    if ('name' in field && field.type !== 'ui') {
      return {
        ...field,
        access: { ...field.access, update: canConfigureSidebar },
      } as Field;
    }

    if ('fields' in field) {
      return { ...field, fields: lockForEditors(field.fields) } as Field;
    }

    return field;
  });

const editorLockedSidebarBlocks: Block[] = sidebarBlocks.map((block) => ({
  ...block,
  fields: lockForEditors(block.fields),
}));

export const Sidebars: CollectionConfig<'sidebars'> = {
  slug: 'sidebars',
  labels: {
    singular: 'Sidebar',
    plural: 'Sidebars',
  },
  access: {
    create: adminOrSeniorEditor,
    delete: adminOrSeniorEditor,
    // Editors keep update access, limited to pinning news (see
    // `restrictEditorChanges`).
    update: staff,
    read: anyone,
  },
  admin: {
    hidden: process.env.NEXT_PAYLOAD_SIDEBAR_HIDDEN === 'true',
    defaultColumns: ['name', 'pageSlug', 'updatedAt'],
    useAsTitle: 'name',
    group: 'Layout',
    description:
      'Sidebar content per page. The page slug decides which page a sidebar appears on.',
  },
  fields: lockForEditors([
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description:
          'Internal label, e.g. "Home sidebar". Not shown to readers.',
      },
    },
    {
      name: 'pageSlug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description:
          'The page path this sidebar belongs to, without a leading slash — e.g. "home", "news", "news/market". One sidebar per slug.',
      },
      hooks: {
        beforeValidate: [
          ({ value }) =>
            typeof value === 'string'
              ? value
                  .trim()
                  .toLowerCase()
                  .replace(/^\/+|\/+$/g, '')
              : value,
        ],
      },
    },
    {
      name: 'widgets',
      type: 'blocks',
      required: true,
      minRows: 1,
      blocks: editorLockedSidebarBlocks,
      admin: {
        description: 'Cards shown in the sidebar, top to bottom.',
        initCollapsed: true,
        className: 'sidebar-widgets',
        components: {
          afterInput: [
            '@/Payload/components/HideSidebarWidgetActions#HideSidebarWidgetActions',
          ],
        },
      },
    },
  ]),
  hooks: {
    beforeValidate: [restrictEditorChanges],
    afterChange: [revalidateSidebar],
    afterDelete: [revalidateSidebarDelete],
  },
  versions: {
    drafts: {
      // Disabled: scheduled publishing needs a job runner to execute the queued
      // jobs. Nothing invokes the queue yet (no `jobs` config in payload.config.ts),
      // so anything scheduled would silently never publish.
      // schedulePublish: true,
    },
    maxPerDoc: 50,
  },
};
