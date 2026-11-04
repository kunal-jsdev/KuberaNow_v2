import type { FieldHook } from 'payload';

type MediaLike = {
  transformedUrl?: string | null;
  cloudinaryUrl?: string | null;
  url?: string | null;
  originalUrl?: string | null;
};

const toUrl = (media: unknown): string | null => {
  if (!media || typeof media !== 'object') return null;

  const { transformedUrl, cloudinaryUrl, url, originalUrl } =
    media as MediaLike;

  return transformedUrl || cloudinaryUrl || url || originalUrl || null;
};

const idOf = (value: unknown): string | number | null => {
  if (typeof value === 'string' || typeof value === 'number') return value;
  if (value && typeof value === 'object') {
    const { id } = value as { id?: unknown };
    if (typeof id === 'string' || typeof id === 'number') return id;
  }
  return null;
};

export const resolveSlideImage: FieldHook = async ({ siblingData, req }) => {
  const slide = siblingData as
    | { imageOverride?: unknown; article?: unknown }
    | undefined;

  if (!slide) return null;

  const payload = req?.payload;
  if (!payload) return null;

  const overrideId = idOf(slide.imageOverride);
  if (overrideId !== null) {
    const media = await payload
      .findByID({ collection: 'media', id: overrideId, depth: 0, req })
      .catch(() => null);

    const url = toUrl(media);
    if (url) return url;
  }

  // 2. Fall back to the attached article's hero image.
  const articleId = idOf(slide.article);
  if (articleId === null) return null;

  const article = await payload
    .findByID({ collection: 'news', id: articleId, depth: 1, req })
    .catch(() => null);

  return toUrl(article?.heroImage);
};

export default resolveSlideImage;
