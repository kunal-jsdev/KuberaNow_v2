import type { Access } from 'payload';

import { isAdminOrSeniorEditorUser } from '@/Payload/lib/Auth/roles';
import { User } from '@/payload-types';

/**
 * Payload `Access` wrapper around `isAdminOrSeniorEditorUser`. Grants access
 * to admins and senior editors, keeping plain editors out of site
 * configuration.
 */
export const adminOrSeniorEditor: Access<User> = ({ req: { user } }) =>
  isAdminOrSeniorEditorUser(user);
