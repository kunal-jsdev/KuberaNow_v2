import type { FieldHook } from 'payload';

type Slide = {
  mediaType?: string | null;
  article?: unknown;
  title?: unknown;
  imageOverride?: unknown;
  youtubeUrl?: unknown;
};

export const clearUnusedSlideFields: FieldHook = ({ value }) => {
  if (!Array.isArray(value)) return value;

  return value.map((slide: Slide) => {
    if (!slide || typeof slide !== 'object') return slide;

    if (slide.mediaType === 'youtube') {
      return {
        ...slide,
        article: null,
        title: null,
        imageOverride: null,
      };
    }

    return { ...slide, youtubeUrl: null };
  });
};

export default clearUnusedSlideFields;
