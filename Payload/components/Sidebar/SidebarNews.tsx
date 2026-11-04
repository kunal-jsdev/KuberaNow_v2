import SidebarNewsCard, {
  type SidebarNewsItem,
} from '@/components/sidebar/SidebarNewsCard';
import { buildArticleHref } from '@/Payload/lib/utilities/articleId';
import { getNewsByCategory } from '@/Payload/lib/utilities/getNewsByCategory';
import type { SidebarNewsBlock } from '@/payload-types';

const SIDEBAR_NEWS_LIMIT = 4;

export async function SidebarNews({
  category,
  heading,
  articles,
  showSeeMore,
}: SidebarNewsBlock) {
  if (!category || typeof category !== 'object') return null;

  const picked = (articles ?? []).filter(
    (article) => typeof article === 'object'
  );

  const source = picked.length
    ? picked
    : await getNewsByCategory(category.slug, SIDEBAR_NEWS_LIMIT);

  const items: SidebarNewsItem[] = source.map((article) => ({
    id: article.id,
    headline: article.title,
    href:
      buildArticleHref(
        typeof article.category === 'object' ? article.category?.slug : null,
        article.slug,
        article.article_id
      ) ?? '',
  }));

  if (items.length === 0) return null;

  return (
    <SidebarNewsCard
      title={heading || category.title}
      items={items}
      seeMoreHref={showSeeMore ? `/${category.slug}` : undefined}
    />
  );
}

export default SidebarNews;
