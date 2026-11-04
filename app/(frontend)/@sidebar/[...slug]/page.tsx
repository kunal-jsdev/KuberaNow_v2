import StaticSidebar from '@/components/sidebar/StaticSidebar';
import { isArticleId } from '@/Payload/lib/utilities/articleId';
import { getCategoryOptions } from '@/Payload/lib/utilities/getCategoryOptions';

type Args = {
  params: Promise<{ slug: string[] }>;
};

export default async function Page({ params }: Args) {
  const { slug: rawSlug } = await params;
  // eslint-disable-next-line no-nested-ternary
  const slug = Array.isArray(rawSlug) ? rawSlug : rawSlug ? [rawSlug] : [];

  if (slug.length === 0) {
    return null;
  }

  const decodedSlug = decodeURIComponent(slug[0]);

  // Article page with single article-id or 2-segment slug (/category/article-slug)
  if (isArticleId(decodedSlug) || slug.length === 2) {
    return (
      <StaticSidebar
        context={{
          pageType: 'article',
          categorySlug: slug.length === 2 ? decodedSlug : undefined,
        }}
      />
    );
  }

  if (decodedSlug === 'market') {
    return (
      <StaticSidebar
        slug='market'
        context={{
          pageType: 'market',
        }}
      />
    );
  }

  const categories = await getCategoryOptions();
  const matchedCategory = categories.find(
    (category) => category.slug === decodedSlug
  );

  if (!matchedCategory) {
    return null;
  }

  return (
    <StaticSidebar
      slug={decodedSlug}
      context={{
        pageType: 'category',
        categorySlug: decodedSlug,
        categoryId: matchedCategory?.id,
      }}
    />
  );
}
