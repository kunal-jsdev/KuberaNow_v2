import type { Access } from 'payload';

import { isStaffRole } from '@/Payload/lib/Auth/roles';
import { User } from '@/payload-types';

export const staff: Access<User> = ({ req: { user } }) =>
  isStaffRole(user?.role);
