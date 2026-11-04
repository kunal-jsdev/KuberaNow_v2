import type { Media, NewsCategory } from '@/payload-types';

import { getMediaUrl } from './getMediaUrl';
import { TAG_PATH_PREFIX } from './getNavConfig';
import { getNewsByCategory, NewsCardItem } from './getNewsByCategory';
import { getNewsByTag } from './getNewsByTag';

const NAV_PREVIEW_LIMIT = 4;

function toPreviewItem(item: NewsCardItem): NewsCardItem {
  const heroImage =
    item.heroImage && typeof item.heroImage === 'object'
      ? ({
          id: item.heroImage.id,
          url: getMediaUrl(item.heroImage),
          alt: item.heroImage.alt,
        } as Media)
      : item.heroImage;
  const category =
    item.category && typeof item.category === 'object'
      ? ({
          id: item.category.id,
          slug: item.category.slug,
        } as NewsCategory)
      : item.category;

  return {
    id: item.id,
    title: item.title,
    slug: item.slug,
    article_id: item.article_id,
    heroImage,
    category,
  } as NewsCardItem;
}

const unique = (slugs: readonly string[]) =>
  Array.from(new Set(slugs.filter(Boolean)));

/**
 * Latest articles for each nav link, keyed by the link's path without the
 * leading "/" — category slugs as-is, tags as "tag/<tagSlug>".
 */
export async function getNavPreviewNews(
  categorySlugs: readonly string[],
  tagSlugs: readonly string[] = []
): Promise<Record<string, NewsCardItem[]>> {
  const uniqueCategorySlugs = unique(categorySlugs);
  const uniqueTagSlugs = unique(tagSlugs);

  const [categoryResults, tagResults] = await Promise.all([
    Promise.all(
      uniqueCategorySlugs.map((slug) =>
        getNewsByCategory(slug, NAV_PREVIEW_LIMIT)
      )
    ),
    Promise.all(
      uniqueTagSlugs.map((slug) => getNewsByTag(slug, NAV_PREVIEW_LIMIT))
    ),
  ]);

  const map: Record<string, NewsCardItem[]> = {};
  uniqueCategorySlugs.forEach((slug, index) => {
    map[slug] = categoryResults[index].map(toPreviewItem);
  });
  uniqueTagSlugs.forEach((slug, index) => {
    map[`${TAG_PATH_PREFIX}${slug}`] = tagResults[index].map(toPreviewItem);
  });

  return map;
}
