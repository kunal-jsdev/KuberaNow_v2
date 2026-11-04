import type { Access } from 'payload';

import { isAdminUser } from '@/Payload/lib/Auth/roles';
import { User } from '@/payload-types';

/**
 * Payload `Access` wrapper around `isAdminUser`, for use in collection
 * `access` config. Grants access only to users with the `admin` role.
 */
export const isAdmin: Access<User> = ({ req: { user } }) => isAdminUser(user);
