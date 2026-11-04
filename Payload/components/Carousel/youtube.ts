const YOUTUBE_ID = /^[\w-]{11}$/;

const YOUTUBE_HOSTS = new Set([
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'youtu.be',
]);

export const getYouTubeId = (url?: string | null): string | null => {
  if (typeof url !== 'string' || url.trim() === '') return null;

  const trimmed = url.trim();

  const withScheme = /^[a-z][a-z\d+\-.]*:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  let parsed: URL;
  try {
    parsed = new URL(withScheme);
  } catch {
    return null;
  }

  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return null;

  if (!YOUTUBE_HOSTS.has(parsed.hostname)) return null;

  const fromQuery = parsed.searchParams.get('v');
  if (fromQuery && YOUTUBE_ID.test(fromQuery)) return fromQuery;

  const segments = parsed.pathname.split('/').filter(Boolean);

  if (parsed.hostname === 'youtu.be') {
    const [id] = segments;
    return id && YOUTUBE_ID.test(id) ? id : null;
  }

  const [prefix, id] = segments;
  if ((prefix === 'embed' || prefix === 'shorts' || prefix === 'live') && id) {
    return YOUTUBE_ID.test(id) ? id : null;
  }

  return null;
};

type SlideSiblingData = {
  mediaType?: string;
  article?: unknown;
};

const hasArticle = (siblingData?: unknown): boolean =>
  Boolean((siblingData as SlideSiblingData | undefined)?.article);

/**
 * With no article there is no hero image to fall back to, but a YouTube slide
 * gets its visuals from the video instead.
 */
export const validateSlideImage = (
  value: unknown,
  { siblingData }: { siblingData?: unknown }
): true | string => {
  const mediaType = (siblingData as SlideSiblingData | undefined)?.mediaType;

  if (mediaType === 'youtube' || hasArticle(siblingData)) return true;

  return value
    ? true
    : 'An image is required when no article is attached to the slide.';
};

export const validateYouTubeUrl = (
  value: unknown,
  { siblingData }: { siblingData?: unknown }
): true | string => {
  const mediaType = (siblingData as SlideSiblingData | undefined)?.mediaType;

  if (mediaType !== 'youtube') return true;

  if (typeof value !== 'string' || value.trim() === '') {
    return 'A YouTube URL is required when the slide media type is YouTube Video.';
  }

  return getYouTubeId(value)
    ? true
    : 'Enter a valid YouTube URL (watch, youtu.be, embed, Shorts or live link).';
};
