import type { Access } from 'payload';

import { User } from '@/payload-types';

export const authenticatedOrPublished: Access<User> = ({ req: { user } }) => {
  if (user) {
    return true;
  }

  return {
    _status: {
      equals: 'published',
    },
  };
};
