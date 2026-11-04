import { APIError, type CollectionBeforeValidateHook } from 'payload';

import { isEditorUser } from '@/Payload/lib/Auth/roles';
import type { Sidebar } from '@/payload-types';

/**
 * Editors may only pin/select the articles shown in "Category News List"
 * widgets. Everything else — the sidebar's name and page slug, and the
 * widgets themselves (adding, removing, reordering or changing their
 * settings) — is managed by admins and senior editors.
 *
 * Field-level access already renders those fields read-only in the admin UI;
 * this hook enforces the same rule on the API, where block rows can still be
 * added, removed or reordered.
 */
export const restrictEditorChanges: CollectionBeforeValidateHook<Sidebar> = ({
  data,
  originalDoc,
  operation,
  req: { user },
}) => {
  if (operation !== 'update' || !isEditorUser(user) || !data || !originalDoc) {
    return data;
  }

  const originalWidgets = originalDoc.widgets ?? [];
  const incomingWidgets = data.widgets ?? originalWidgets;

  const sameLayout =
    incomingWidgets.length === originalWidgets.length &&
    incomingWidgets.every(
      (widget, index) =>
        widget.id === originalWidgets[index]?.id &&
        widget.blockType === originalWidgets[index]?.blockType
    );

  if (!sameLayout) {
    throw new APIError(
      'Editors can only pin or select news in a sidebar. Ask an admin or senior editor to add, remove or reorder widgets.',
      403,
      undefined,
      true
    );
  }

  return {
    ...data,
    name: originalDoc.name,
    pageSlug: originalDoc.pageSlug,
    widgets: originalWidgets.map((widget, index) => {
      const incoming = incomingWidgets[index];

      return widget.blockType === 'sidebarNews' &&
        incoming?.blockType === 'sidebarNews'
        ? { ...widget, articles: incoming.articles }
        : widget;
    }),
  };
};
