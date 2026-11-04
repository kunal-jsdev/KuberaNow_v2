import { APIError, type CollectionBeforeChangeHook } from 'payload';

import { unicodeSlugify } from '@/Payload/lib/utilities/slugify';

import { isValidTagTitle } from '../../../../utils/titleRules';

export const ensureUniqueSlug: CollectionBeforeChangeHook = async ({
  data,
  originalDoc,
  req,
}) => {
  const typed = typeof data?.slug === 'string' ? data.slug.trim() : '';
  const fromTitle = typeof data?.title === 'string' ? data.title : '';
  const source = typed || fromTitle;

  if (!source) return data;

  if (fromTitle && !isValidTagTitle(fromTitle)) return data;

  const slug = unicodeSlugify({ data, req, valueToSlugify: source });

  if (!slug) return data;

  if (!typed) data.slug = slug;

  if (originalDoc?.slug === slug) return data;

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
      `The slug "${slug}" is already used by the tag "${clash.title}". Slugs must be unique.`,
      400,
      [{ field: 'slug', message: 'This slug is already in use.' }],
      true
    );
  }

  return data;
};
