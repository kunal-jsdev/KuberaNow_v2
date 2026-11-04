'use client';

import { useAuth } from '@payloadcms/ui';

import { isEditorUser } from '@/Payload/lib/Auth/roles';
import type { User } from '@/payload-types';

/**
 * Editors may only pin/select news inside existing sidebar widgets, so hide
 * the controls that add, remove, duplicate, paste or reorder widgets. The
 * server enforces the same rule in `restrictEditorChanges`.
 */
export const HideSidebarWidgetActions = () => {
  const { user } = useAuth<User>();

  if (!isEditorUser(user)) return null;

  return (
    <style>
      {`
        .sidebar-widgets > .blocks-field__drawer-toggler,
        .sidebar-widgets .blocks-field__header-actions .clipboard-action,
        .sidebar-widgets .blocks-field__row .array-actions,
        .sidebar-widgets .blocks-field__row .collapsible__drag {
          display: none;
        }
      `}
    </style>
  );
};

export default HideSidebarWidgetActions;
