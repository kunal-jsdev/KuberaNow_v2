'use client';

import { SlugField, useAuth } from '@payloadcms/ui';
import type { TextFieldClientProps } from 'payload';

import { canManageCategories } from '@/Payload/lib/Auth/roles';
import type { User } from '@/payload-types';

type CategorySlugFieldProps = TextFieldClientProps & {
  useAsSlug?: string;
};

export const CategorySlugField = (props: CategorySlugFieldProps) => {
  const { user } = useAuth<User>();

  const readOnly = !canManageCategories(user);

  return (
    <SlugField
      {...props}
      field={{
        ...props.field,
        admin: { ...props.field?.admin, readOnly },
      }}
      readOnly={readOnly}
    />
  );
};

export default CategorySlugField;
