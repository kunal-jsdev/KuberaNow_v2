import { APIError, type CollectionBeforeValidateHook } from 'payload';

import { unicodeSlugify } from '@/Payload/lib/utilities/slugify';

import { isValidTagTitle } from '../../../../utils/titleRules';

export const ensureUniqueTitle: CollectionBeforeValidateHook = async ({
  data,
  originalDoc,
  operation,
  req,
}) => {
  const title = typeof data?.title === 'string' ? data.title.trim() : undefined;

  if (!title) return data;

  if (!isValidTagTitle(title)) return data;

  if (operation === 'update' && originalDoc?.title?.trim() === title) {
    return data;
  }

  const slug = unicodeSlugify({ data, req, valueToSlugify: title });

  if (!slug) return data;

  const duplicates = await req.payload.find({
    collection: 'tags',
    depth: 0,
    limit: 1,
    pagination: false,
    req,
    where: {
      slug: { equals: slug },
      ...(originalDoc?.id ? { id: { not_equals: originalDoc.id } } : {}),
    },
  });

  const clash = duplicates.docs[0];

  if (clash) {
    throw new APIError(
      `A tag named "${clash.title}" already exists. Tag names must be unique, regardless of capitalisation.`,
      400,
      [{ field: 'title', message: 'A tag with this name already exists.' }],
      true
    );
  }

  return data;
};
