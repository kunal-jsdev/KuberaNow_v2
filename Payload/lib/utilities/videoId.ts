import { formatArticleId, parseArticleId } from './articleId';

/**
 * Video ids are article ids with a `v` in front (`v2026100900004`), so both
 * can be short links at the site root: `/{articleId}` opens an article and
 * `/{videoId}` a video.
 */
export const VIDEO_ID_PREFIX = 'v';

export const formatVideoId = (day: string, sequence: number): string =>
  `${VIDEO_ID_PREFIX}${formatArticleId(day, sequence)}`;

export const parseVideoId = (
  videoId: unknown
): { day: string; sequence: number } | null => {
  if (typeof videoId !== 'string' || !videoId.startsWith(VIDEO_ID_PREFIX)) {
    return null;
  }

  return parseArticleId(videoId.slice(VIDEO_ID_PREFIX.length));
};

export const isVideoId = (segment: unknown): boolean =>
  parseVideoId(segment) !== null;

// The id hook stores plain `YYYYMMDD#####` ids (no `v`), so under /videos and
// /short-videos a segment may carry either form.
const isSegmentVideoId = (segment: unknown): boolean =>
  isVideoId(segment) || parseArticleId(segment) !== null;

const TRAILING_VIDEO_ID_PATTERN = new RegExp(
  `^(.*)-(${VIDEO_ID_PREFIX}?\\d{13})$`
);

export const splitVideoSegment = (
  segment: string
): { slug: string; videoId: string | null } => {
  if (isSegmentVideoId(segment)) {
    return { slug: '', videoId: segment };
  }

  const match = TRAILING_VIDEO_ID_PATTERN.exec(segment);
  if (!match || !isSegmentVideoId(match[2])) {
    return { slug: segment, videoId: null };
  }

  return { slug: match[1], videoId: match[2] };
};

/** `2026102300006` -> `v2026102300006`; already-prefixed ids pass through. */
export const toVideoUrlId = (videoId: string): string =>
  videoId.startsWith(VIDEO_ID_PREFIX)
    ? videoId
    : `${VIDEO_ID_PREFIX}${videoId}`;

/** Both stored forms of an id, for lookups: `[v2026..., 2026...]`. */
export const videoIdVariants = (videoId: string): string[] => {
  const urlId = toVideoUrlId(videoId);
  return [urlId, urlId.slice(VIDEO_ID_PREFIX.length)];
};

export const buildVideoSegment = (
  slug: string | null | undefined,
  videoId: string | null | undefined
): string => {
  if (!videoId) return slug ?? '';
  // URLs always show the `v` form, whichever form is stored.
  const urlId = toVideoUrlId(videoId);
  if (!slug) return urlId;
  if (slug.endsWith(`-${urlId}`) || slug === urlId) return slug;
  return `${slug}-${urlId}`;
};
