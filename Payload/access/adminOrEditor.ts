import type { Access } from 'payload';

import { isAdminOrEditorUser } from '@/Payload/lib/Auth/roles';
import { User } from '@/payload-types';

/**
 * Payload `Access` wrapper around `isAdminOrEditorUser`. Grants access to
 * admins and editors — the roles trusted to curate featured content.
 */
export const adminOrEditor: Access<User> = ({ req: { user } }) =>
  isAdminOrEditorUser(user);
