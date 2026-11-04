import type { SidebarNewsSection } from '@/constants/sidebarNews';
import type { Sidebar } from '@/payload-types';

import { buildArticleHref } from './articleId';
import { getNewsByCategory, type NewsCardItem } from './getNewsByCategory';

const SIDEBAR_NEWS_LIMIT = 4;

const SIDEBAR_CATEGORIES = [
  { slug: 'market', title: 'Market' },
  { slug: 'economy', title: 'Economy' },
  { slug: 'personal-finance', title: 'Personal Finance' },
] as const;

export type SidebarCategorySlug = (typeof SIDEBAR_CATEGORIES)[number]['slug'];

export async function getSidebarNews(): Promise<
  Record<SidebarCategorySlug, SidebarNewsSection>
> {
  const results = await Promise.all(
    SIDEBAR_CATEGORIES.map(({ slug }) =>
      getNewsByCategory(slug, SIDEBAR_NEWS_LIMIT)
    )
  );

  const sections = {} as Record<SidebarCategorySlug, SidebarNewsSection>;

  SIDEBAR_CATEGORIES.forEach(({ slug, title }, index) => {
    sections[slug] = {
      title,
      seeMoreHref: `/${slug}`,
      items: results[index].map((article) => ({
        id: article.id,
        headline: article.title,
        href:
          buildArticleHref(
            typeof article.category === 'object'
              ? article.category.slug
              : article.category,
            article.slug,
            article.article_id
          ) ?? undefined,
      })),
    };
  });

  return sections;
}

type NewsArticle = Extract<
  NonNullable<
    Extract<
      NonNullable<Sidebar['widgets']>[number],
      { blockType: 'sidebarNews' }
    >['articles']
  >[number],
  { id: string }
>;

const toItem = (article: NewsArticle | NewsCardItem) => ({
  id: article.id,
  headline: article.title,
  href:
    buildArticleHref(
      typeof article.category === 'object'
        ? article.category?.slug
        : article.category,
      article.slug,
      article.article_id
    ) ?? undefined,
});

export async function toSidebarNewsSections(
  sidebar: Sidebar | null
): Promise<Record<SidebarCategorySlug, SidebarNewsSection>> {
  const sections = {} as Record<SidebarCategorySlug, SidebarNewsSection>;

  SIDEBAR_CATEGORIES.forEach(({ slug }) => {
    sections[slug] = { title: '', items: [] };
  });

  const widgets =
    sidebar?._status === 'published' ? (sidebar.widgets ?? []) : [];

  const newsWidgets = widgets.filter(
    (widget) => widget.blockType === 'sidebarNews'
  );

  await Promise.all(
    newsWidgets.map(async (widget) => {
      const { category, heading, articles, showSeeMore } = widget;

      if (!category || typeof category !== 'object') return;

      const slug = category.slug as SidebarCategorySlug;

      if (!(slug in sections)) return;

      const picked = (articles ?? []).filter(
        (article): article is NewsArticle =>
          article !== null && typeof article === 'object'
      );

      const items = picked.length
        ? picked.map(toItem)
        : (await getNewsByCategory(category.slug, SIDEBAR_NEWS_LIMIT)).map(
            toItem
          );

      sections[slug] = {
        title: heading || category.title,
        seeMoreHref: showSeeMore ? `/${category.slug}` : undefined,
        items,
      };
    })
  );

  return sections;
}
