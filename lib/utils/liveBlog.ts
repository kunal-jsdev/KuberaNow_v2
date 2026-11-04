/**
 * Determines whether a news article is an active and published live blog.
 */
export function isLiveBlogActive(article: any): boolean {
  if (!article || typeof article !== 'object') return false;

  const hasLiveFlag =
    Boolean(article.isLiveBlog) ||
    (Array.isArray(article.liveUpdates) && article.liveUpdates.length > 0);

  const isNotConcluded = article.liveBlogStatus !== 'concluded';
  const isPublished = article._status ? article._status === 'published' : true;

  return Boolean(hasLiveFlag && isNotConcluded && isPublished);
}

/**
 * Determines whether an article has a live blog enabled OR timeline updates to display.
 */
export function hasLiveBlogTimeline(article: any): boolean {
  if (!article || typeof article !== 'object') return false;

  const hasUpdates =
    Array.isArray(article.liveUpdates) && article.liveUpdates.length > 0;

  return Boolean(article.isLiveBlog || hasUpdates);
}
