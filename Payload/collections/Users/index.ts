import type { CollectionConfig } from 'payload';

import { isAdmin } from '@/Payload/access/isAdmin';
import { isAdminUser, isStaffRole } from '@/Payload/lib/Auth/roles';

export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    admin: ({ req: { user } }) => isStaffRole(user?.role),
    create: isAdmin,
    delete: isAdmin,
    read: ({ req: { user } }) => {
      if (!user) return false;
      if (isStaffRole(user.role)) return true;
      return { id: { equals: user.id } };
    },
    update: ({ req: { user }, id }) => {
      if (!user) return false;
      if (isAdminUser(user)) return true;
      // Non-admins may only edit themselves.
      return user.id === id;
    },
  },
  admin: {
    defaultColumns: ['name', 'email', 'role'],
    useAsTitle: 'name',
    group: 'Users',
    description: 'Admins and editors.',
    hidden: ({ user }) => !isAdminUser(user as { role?: string | null }),
  },
  auth: {
    useSessions: true,
    tokenExpiration: 60 * 60 * 24 * 7,
    maxLoginAttempts: 5,
    lockTime: 600 * 1000,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Senior Editor', value: 'senior-editor' },
        { label: 'Editor', value: 'editor' },
      ],
      defaultValue: 'editor',
      saveToJWT: true,
      admin: {
        position: 'sidebar',
      },
      access: {
        update: ({ req: { user } }) => isAdminUser(user),
        read: ({ req: { user }, id }) =>
          isAdminUser(user) || (Boolean(user) && user?.id === id),
      },
    },
    {
      name: 'avatar',
      type: 'upload',
      relationTo: 'media',
      admin: {
        position: 'sidebar',
        description: 'Profile photo.',
      },
    },
  ],
  timestamps: true,
};
