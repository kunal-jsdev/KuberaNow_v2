import configPromise from '@payload-config';
import type { MetadataRoute } from 'next';
import { getPayload } from 'payload';

import { buildStorySegment } from '@/Payload/lib/utilities/articleId';
import { getServerSideURL } from '@/Payload/lib/utilities/getURL';

export const revalidate = 600;

type SitemapPath = {
  path: string;
  lastModified?: Date | string;
  changeFrequency?: MetadataRoute.Sitemap[number]['changeFrequency'];
  priority?: number;
};

const staticRoutes: SitemapPath[] = [
  { path: '/', changeFrequency: 'daily', priority: 1 },
  { path: '/why-kubera', changeFrequency: 'yearly', priority: 0.5 },
  {
    path: '/about-us-kubera-now',
    changeFrequency: 'yearly',
    priority: 0.5,
  },
  { path: '/advertise-with-us', changeFrequency: 'yearly', priority: 0.4 },
  { path: '/careers', changeFrequency: 'monthly', priority: 0.4 },
  { path: '/leadership-team', changeFrequency: 'yearly', priority: 0.4 },
  { path: '/contact-us', changeFrequency: 'yearly', priority: 0.4 },
  { path: '/disclaimer', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/privacy-policy', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/terms-of-use', changeFrequency: 'yearly', priority: 0.3 },
];

const toSitemapEntry = (
  siteUrl: string,
  route: SitemapPath
): MetadataRoute.Sitemap[number] => ({
  url: `${siteUrl}${route.path}`,
  ...(route.lastModified ? { lastModified: route.lastModified } : {}),
  ...(route.changeFrequency ? { changeFrequency: route.changeFrequency } : {}),
  ...(route.priority !== undefined ? { priority: route.priority } : {}),
});

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getServerSideURL().replace(/\/+$/, '');
  const payload = await getPayload({ config: configPromise });

  const [categories, news, tags] = await Promise.all([
    payload.find({
      collection: 'news-categories',
      limit: 1000,
      pagination: false,
      overrideAccess: false,
      select: { slug: true, updatedAt: true },
    }),
    payload.find({
      collection: 'news',
      draft: false,
      limit: 1000,
      pagination: false,
      overrideAccess: false,
      depth: 1,
      where: { _status: { equals: 'published' } },
      select: {
        slug: true,
        category: true,
        publishedAt: true,
        updatedAt: true,
        article_id: true,
      },
    }),
    payload.find({
      collection: 'tags',
      limit: 1000,
      pagination: false,
      overrideAccess: false,
      select: { slug: true, updatedAt: true },
    }),
  ]);

  const categoryRoutes: SitemapPath[] = categories.docs
    .filter((category) => Boolean(category.slug))
    .map((category) => ({
      path: `/${encodeURIComponent(category.slug)}`,
      lastModified: category.updatedAt,
      changeFrequency: 'daily',
      priority: 0.8,
    }));

  const newsRoutes: SitemapPath[] = news.docs.flatMap((article) => {
    const category =
      typeof article.category === 'object' && article.category !== null
        ? article.category
        : null;

    if (!article.slug || !category?.slug) return [];

    return [
      {
        path: `/${encodeURIComponent(category.slug)}/${encodeURIComponent(buildStorySegment(article.slug, article.article_id))}`,
        lastModified: article.updatedAt || article.publishedAt || undefined,
        changeFrequency: 'never' as const,
        priority: 0.7,
      },
    ];
  });

  const tagRoutes: SitemapPath[] = tags.docs
    .filter((tag) => Boolean(tag.slug))
    .map((tag) => ({
      path: `/tag/${encodeURIComponent(tag.slug)}`,
      lastModified: tag.updatedAt,
      changeFrequency: 'daily',
      priority: 0.6,
    }));

  const uniqueRoutes = new Map<string, SitemapPath>();
  [...categoryRoutes, ...newsRoutes, ...tagRoutes, ...staticRoutes].forEach(
    (route) => uniqueRoutes.set(route.path, route)
  );

  return [...uniqueRoutes.values()].map((route) =>
    toSitemapEntry(siteUrl, route)
  );
}
