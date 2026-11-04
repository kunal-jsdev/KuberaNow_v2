import type { CollectionBeforeChangeHook } from 'payload';

export const populateMetaImage: CollectionBeforeChangeHook = ({ data }) => {
  if (!data) return data;

  if (data.heroImage && !data.meta?.image) {
    return {
      ...data,
      meta: {
        ...data.meta,
        image: data.heroImage,
      },
    };
  }

  return data;
};

export default populateMetaImage;
