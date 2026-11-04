export const SEQUENCE_LENGTH = 5;

const DATE_LENGTH = 8;

const ARTICLE_ID_PATTERN = new RegExp(
  `^(\\d{${DATE_LENGTH}})(\\d{${SEQUENCE_LENGTH}})$`
);

export const formatArticleId = (day: string, sequence: number): string =>
  `${day}${String(sequence).padStart(SEQUENCE_LENGTH, '0')}`;

export const parseArticleId = (
  articleId: unknown
): { day: string; sequence: number } | null => {
  if (typeof articleId !== 'string') return null;

  const match = ARTICLE_ID_PATTERN.exec(articleId);
  if (!match) return null;

  return { day: match[1], sequence: Number(match[2]) };
};

export const isArticleId = (segment: unknown): boolean =>
  parseArticleId(segment) !== null;

/** Matches a trailing `-<articleId>` on a URL segment. */
const TRAILING_ID_PATTERN = new RegExp(
  `^(.*)-(\\d{${DATE_LENGTH + SEQUENCE_LENGTH}})$`
);

/**
 * Splits a story segment into its slug and its trailing article id.
 *
 * Handles the `{slug}-{articleId}` form, e.g.
 * `market-dip-explained-2026082000002` -> slug `market-dip-explained`,
 * articleId `2026082000002`.
 *
 * A segment carrying no id yields `{ slug: segment, articleId: null }`, so
 * plain `/{category}/{slug}` URLs keep working unchanged. The id is the
 * durable half: when both are present the id identifies the article and a
 * stale slug can simply be ignored.
 */
export const splitStorySegment = (
  segment: string
): { slug: string; articleId: string | null } => {
  const match = TRAILING_ID_PATTERN.exec(segment);

  if (!match || !isArticleId(match[2])) {
    return { slug: segment, articleId: null };
  }

  return { slug: match[1], articleId: match[2] };
};

/** `market-dip` + `2026082000002` -> `market-dip-2026082000002` */
export const buildStorySegment = (
  slug: string | null | undefined,
  articleId: string | null | undefined
): string => {
  if (!articleId) return slug ?? '';
  return slug ? `${slug}-${articleId}` : articleId;
};

export const buildArticleHref = (
  categorySlug: string | null | undefined,
  slug: string | null | undefined,
  articleId?: string | null
): string | null => {
  if (!categorySlug || !slug) return null;
  return `/${categorySlug}/${buildStorySegment(slug, articleId)}`;
};
