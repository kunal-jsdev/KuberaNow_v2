'use client';

import { useAuth } from '@payloadcms/ui';

import { canManageCategories } from '@/Payload/lib/Auth/roles';
import type { User } from '@/payload-types';

export const HideCategorySelection = () => {
  const { user } = useAuth<User>();

  if (canManageCategories(user)) return null;

  return (
    <style>
      {`
        .collection-list .cell-_select,
        .collection-list #heading-_select,
        .collection-list .list-selection,
        .collection-list__list-selection {
          display: none;
        }
      `}
    </style>
  );
};

export default HideCategorySelection;
