import type { CollectionBeforeChangeHook } from 'payload';

export const populatePublishedAt: CollectionBeforeChangeHook = ({
  data,
  operation,
  originalDoc,
}) => {
  if (operation === 'create' || operation === 'update') {
    if (
      data._status === 'published' &&
      !data.publishedAt &&
      !originalDoc?.publishedAt
    ) {
      return {
        ...data,
        publishedAt: new Date().toISOString(),
      };
    }
  }

  return data;
};
