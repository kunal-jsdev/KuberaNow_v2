export const STAFF_ROLES = ['admin', 'editor', 'senior-editor'] as const;

export type StaffRole = (typeof STAFF_ROLES)[number];
export type UserRole = StaffRole;

export function isStaffRole(role?: string | null): role is StaffRole {
  if (!role) return false;

  return STAFF_ROLES.includes(role as StaffRole);
}

export function isAdminUser(user?: { role?: string | null } | null): boolean {
  return user?.role === 'admin';
}

export function isAdminOrEditorUser(
  user?: { role?: string | null } | null
): boolean {
  return (
    user?.role === 'admin' ||
    user?.role === 'editor' ||
    user?.role === 'senior-editor'
  );
}

export function canManageCategories(
  user?: { role?: string | null } | null
): boolean {
  return user?.role === 'admin' || user?.role === 'senior-editor';
}

/**
 * True for the plain `editor` role. Editors are restricted to content work
 * (news, pinning) and are kept out of site configuration such as the floating
 * CTA, navigation, sidebar layout and Morning Brief subscribers.
 */
export function isEditorUser(user?: { role?: string | null } | null): boolean {
  return user?.role === 'editor';
}

/**
 * Admins and senior editors — the roles allowed to manage site
 * configuration that plain editors cannot touch.
 */
export function isAdminOrSeniorEditorUser(
  user?: { role?: string | null } | null
): boolean {
  return user?.role === 'admin' || user?.role === 'senior-editor';
}
