import { cache } from 'react';

import configPromise from '@payload-config';
import type { Metadata } from 'next';
import { unstable_cache } from 'next/cache';
import { draftMode } from 'next/headers';
import { notFound, permanentRedirect, redirect } from 'next/navigation';
import { getPayload } from 'payload';

import CategoryPageSection from '@/components/category/CategoryPage';
import LeaderboardAdBanner from '@/components/common/LeaderboardAdBanner';
import MobileInterleaveRoot from '@/components/layout/MobileInterleaveRoot';
import NewsDetailSection from '@/components/news-detail/NewsDetailSection';
import { buildShortsHref, buildVideoHref } from '@/components/videos/utils';
import {
  LEADERBOARD_AD_IMAGE_ANTALA,
  LEADERBOARD_AD_REDIRECT_URL_ANTALA,
} from '@/constants/advertise';
import {
  MARKET_DESCRIPTION,
  MARKET_H1,
  MARKET_KEYWORDS,
  MARKET_TITLE,
} from '@/constants/marketPage';
import { CATEGORY_PAGE_SEO } from '@/constants/pageSeo';
import {
  buildArticleUrl,
  buildCategoryPageJsonLd,
  buildNewsArticleJsonLd,
  formatShareDescription,
  getShareImageUrl,
  getVideoDimensions,
  getVideoShareImageUrl,
} from '@/lib/utils/jsonLd';
import LivePreviewListener from '@/Payload/components/LivePreviewListener';
import {
  buildStorySegment,
  isArticleId as isArticleIdSegment,
  splitStorySegment,
} from '@/Payload/lib/utilities/articleId';
import { getCategoryOptions } from '@/Payload/lib/utilities/getCategoryOptions';
import { getInterleavedMedia } from '@/Payload/lib/utilities/getInterleavedVideos';
import { getServerSideURL } from '@/Payload/lib/utilities/getURL';
import {
  getVideoBySlug,
  getVideoByVideoId,
} from '@/Payload/lib/utilities/getVideoBySlug';
import { isVideoId } from '@/Payload/lib/utilities/videoId';
import type { Media, News } from '@/payload-types';

const siteUrl = getServerSideURL().replace(/\/+$/, '');
const IPO_CATEGORY_SLUG = 'antala-ipo';

/** 10 minutes — shared by the route's ISR window and the news data cache. */
const NEWS_CACHE_SECONDS = 600;

export const revalidate = NEWS_CACHE_SECONDS;

export const dynamicParams = true;

type Args = {
  params: Promise<{ slug: string[] }>;
};

const newsCardSelect = {
  slug: true,
  title: true,
  summary: true,
  heroImage: true,
  category: true,
  article_id: true,
  isLiveBlog: true,
  liveUpdates: true,
  liveBlogStatus: true,
} as const;

function onlyPopulated(items: (string | News)[] | null | undefined): News[] {
  return (items ?? []).filter((item): item is News => typeof item === 'object');
}

const queryCategoryBySlug = cache(async (slug: string) => {
  const payload = await getPayload({ config: configPromise });

  const result = await payload.find({
    collection: 'news-categories',
    limit: 1,
    pagination: false,
    overrideAccess: false,
    depth: 2,
    where: {
      slug: {
        equals: slug,
      },
    },
  });

  return result.docs?.[0] || null;
});

const fetchNews = async (identifier: string, draft: boolean) => {
  try {
    const payload = await getPayload({ config: configPromise });

    const result = await payload.find({
      collection: 'news',
      draft,
      limit: 1,
      pagination: false,
      overrideAccess: draft,
      depth: 2,
      where: isArticleIdSegment(identifier)
        ? { article_id: { equals: identifier } }
        : { slug: { equals: identifier } },
    });

    return result.docs?.[0] || null;
  } catch {
    return null;
  }
};

const queryNews = cache(
  async (identifier: string, draft: boolean): Promise<News | null> => {
    if (draft) return fetchNews(identifier, true);

    return unstable_cache(
      () => fetchNews(identifier, false),
      ['news', identifier],
      { revalidate: NEWS_CACHE_SECONDS, tags: [`news-${identifier}`] }
    )();
  }
);

const fetchAlsoReadNews = async (
  categoryId: string | number,
  currentArticleId: string | number,
  draft: boolean,
  limit: number = 8
): Promise<News[]> => {
  try {
    if (!categoryId) return [];

    const payload = await getPayload({ config: configPromise });

    const result = await payload.find({
      collection: 'news',
      draft,
      limit,
      overrideAccess: draft,
      depth: 1,
      sort: '-publishedAt',
      select: newsCardSelect,
      where: {
        category: {
          equals: categoryId,
        },
        id: {
          not_equals: currentArticleId,
        },
        ...(!draft ? { _status: { equals: 'published' as const } } : {}),
      },
    });

    return (result.docs || []) as News[];
  } catch {
    return [];
  }
};

const queryAlsoReadNews = cache(
  async (
    categoryId: string | number,
    currentArticleId: string | number,
    draft: boolean
  ): Promise<News[]> => {
    if (draft) return fetchAlsoReadNews(categoryId, currentArticleId, true);

    return unstable_cache(
      () => fetchAlsoReadNews(categoryId, currentArticleId, false),
      ['also-read-news', String(categoryId), String(currentArticleId)],
      {
        revalidate: NEWS_CACHE_SECONDS,
        tags: [`news-category-${categoryId}`],
      }
    )();
  }
);

const UNSAFE_SLUG_CHARS = ['<', '>', ':', '"', '/', '\\', '|', '?', '*'];

function hasUnsafeSlugChars(slug: string): boolean {
  return Array.from(slug).some(
    (char) => char < ' ' || UNSAFE_SLUG_CHARS.includes(char)
  );
}

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise });
  const MAX_SAFE_SLUG_LENGTH = parseInt(
    process.env.NEXT_MAX_SAFE_SLUG_LENGTH || '90',
    10
  );

  try {
    const [categories, newsResponse] = await Promise.all([
      getCategoryOptions(),
      payload.find({
        collection: 'news',
        draft: false,
        limit: 1000,
        overrideAccess: false,
        pagination: false,
        depth: 1,
        sort: '-publishedAt',
        select: {
          slug: true,
          category: true,
          article_id: true,
        },
      }),
    ]);

    // 1. Map Categories -> e.g., /tech becomes { slug: ['tech'] }
    const categoryRoutes = categories
      .filter((cat) => cat && typeof cat.slug === 'string')
      .map((cat) => ({
        slug: [cat.slug],
      }));

    // 2. Map News -> e.g., /economy/market-dip becomes { slug: ['economy', 'market-dip'] }
    const newsRoutes = newsResponse.docs
      .filter((doc) => {
        if (
          !doc.slug ||
          typeof doc.slug !== 'string' ||
          doc.slug.length > MAX_SAFE_SLUG_LENGTH ||
          hasUnsafeSlugChars(doc.slug)
        ) {
          return false;
        }
        if (
          !doc.category ||
          typeof doc.category !== 'object' ||
          !doc.category.slug
        ) {
          return false;
        }
        return true;
      })
      .map((doc) => {
        const categorySlug = (doc.category as any).slug;
        return {
          slug: [categorySlug, buildStorySegment(doc.slug, doc.article_id)],
        };
      });

    return [...categoryRoutes, ...newsRoutes];
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return [];
  }
}

export default async function CategoryPage({ params }: Args) {
  const { isEnabled: draft } = await draftMode();
  const { slug: rawSlug } = await params;

  // eslint-disable-next-line no-nested-ternary
  const slug = Array.isArray(rawSlug) ? rawSlug : rawSlug ? [rawSlug] : [];

  if (!slug || slug.length === 0) {
    notFound();
  }

  const cleanSlugArray = slug?.map((segment) => decodeURIComponent(segment));
  const categorySegment = cleanSlugArray[0];

  // `/{videoId}` short link -> the video's canonical slug URL carrying its videoId.
  if (cleanSlugArray.length === 1 && isVideoId(categorySegment)) {
    const video = await getVideoByVideoId(categorySegment, draft);
    if (!video?.slug) notFound();

    redirect(
      video.ratio === '9:16'
        ? buildShortsHref(video.slug, video.video_id ?? categorySegment)
        : buildVideoHref(video.slug, video.video_id ?? categorySegment)
    );
  }

  const payload = await getPayload({ config: configPromise });

  const isArticleId =
    cleanSlugArray.length === 1 && isArticleIdSegment(categorySegment);

  if (cleanSlugArray.length === 2 || isArticleId) {
    const { slug: storySlug, articleId } = isArticleId
      ? { slug: null, articleId: categorySegment }
      : splitStorySegment(cleanSlugArray[1]);

    const identifier = articleId ?? storySlug ?? '';
    const news = await queryNews(identifier, draft);

    if (!news || (!draft && news._status !== 'published')) {
      notFound();
    }

    const newsCategory =
      typeof news.category === 'object' && news.category !== null
        ? news.category
        : null;

    if (!isArticleId && !articleId && newsCategory?.slug !== categorySegment) {
      notFound();
    }

    const canonicalPath =
      newsCategory?.slug && news.slug
        ? `/${encodeURIComponent(newsCategory.slug)}/${encodeURIComponent(
            buildStorySegment(news.slug, news.article_id)
          )}`
        : null;

    const requestedPath = isArticleId
      ? `/${encodeURIComponent(identifier)}`
      : `/${encodeURIComponent(categorySegment)}/${encodeURIComponent(
          cleanSlugArray[1]
        )}`;

    if (canonicalPath && canonicalPath !== requestedPath) {
      permanentRedirect(canonicalPath);
    }

    const sharePath = isArticleId
      ? `/${identifier}`
      : `/${categorySegment}/${buildStorySegment(news.slug, articleId)}`;

    const articleJsonLd = buildNewsArticleJsonLd({
      news,
      categorySlug: categorySegment,
      articleSlug: storySlug ?? news.slug,
    });

    const categoryId =
      newsCategory?.id ||
      (typeof news.category === 'string' || typeof news.category === 'number'
        ? news.category
        : null);

    let alsoReadArticles: News[] = [];
    if (categoryId) {
      alsoReadArticles = await queryAlsoReadNews(categoryId, news.id, draft);
    }

    return (
      <MobileInterleaveRoot
        as='article'
        className='w-full'
        preamble={
          <script
            type='application/ld+json'
            dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
          />
        }
      >
        {/* <LeaderboardAdBanner className='mb-5' /> */}
        <NewsDetailSection
          news={news}
          sharePath={sharePath}
          alsoRead={alsoReadArticles}
        />
        {draft && <LivePreviewListener />}
      </MobileInterleaveRoot>
    );
  }

  if (cleanSlugArray.length === 1) {
    const activeCategory = await queryCategoryBySlug(categorySegment);
    if (!activeCategory) {
      notFound();
    }

    const pinnedArticles = onlyPopulated(activeCategory.pinnedArticles);
    const pinnedIds = new Set(pinnedArticles.map((article) => article.id));

    const [{ docs: news, hasNextPage }, interleavedMedia] = await Promise.all([
      payload.find({
        collection: 'news',
        draft: false,
        limit: 40,
        overrideAccess: false,
        depth: 1,
        sort: '-publishedAt',
        select: newsCardSelect,
        where: {
          category: { equals: activeCategory.id },
          ...(pinnedIds.size > 0
            ? { id: { not_in: Array.from(pinnedIds) } }
            : {}),
        },
      }),
      getInterleavedMedia({
        categoryId: activeCategory.id,
        categorySlug: categorySegment,
      }),
    ]);

    const isMarket = categorySegment === 'market';
    const isIpoCategory = categorySegment === IPO_CATEGORY_SLUG;

    const marketJsonLd = isMarket
      ? {
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'CollectionPage',
              '@id': `${siteUrl}/market#webpage`,
              url: `${siteUrl}/market`,
              name: MARKET_TITLE,
              isPartOf: { '@id': `${siteUrl}/#website` },
              mainEntity: { '@id': `${siteUrl}/market#itemlist` },
              inLanguage: 'gu-IN',
            },
            {
              '@type': 'ItemList',
              '@id': `${siteUrl}/market#itemlist`,
              itemListElement: [...pinnedArticles, ...news]
                .filter((item) => item.slug && item.title)
                .slice(0, 8)
                .map((item, index) => ({
                  '@type': 'ListItem',
                  position: index + 1,
                  url: `${siteUrl}/market/${encodeURIComponent(
                    buildStorySegment(item.slug, item.article_id)
                  )}`,
                  name: item.title,
                })),
            },
            {
              '@type': 'BreadcrumbList',
              '@id': `${siteUrl}/market#breadcrumb`,
              itemListElement: [
                {
                  '@type': 'ListItem',
                  position: 1,
                  name: 'Home',
                  item: `${siteUrl}/`,
                },
                {
                  '@type': 'ListItem',
                  position: 2,
                  name: activeCategory.title,
                },
              ],
            },
          ],
        }
      : null;

    const pageSeo = CATEGORY_PAGE_SEO[categorySegment];

    const categoryJsonLd = buildCategoryPageJsonLd({
      categorySlug: categorySegment,
      categoryTitle: activeCategory.title,
      title: pageSeo?.title || `${activeCategory.title} News`,
      description: pageSeo?.description || activeCategory.description,
      articles: [...pinnedArticles, ...news],
    });

    return (
      <>
        {marketJsonLd && (
          <script
            type='application/ld+json'
            dangerouslySetInnerHTML={{ __html: JSON.stringify(marketJsonLd) }}
          />
        )}

        {isMarket && <h1 className='sr-only'>{MARKET_H1}</h1>}

        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{ __html: JSON.stringify(categoryJsonLd) }}
        />

        <CategoryPageSection
          leading={
            isIpoCategory ? (
              <LeaderboardAdBanner
                imageSrc={LEADERBOARD_AD_IMAGE_ANTALA}
                redirectUrl={LEADERBOARD_AD_REDIRECT_URL_ANTALA}
              />
            ) : (
              <LeaderboardAdBanner />
            )
          }
          categoryName={categorySegment}
          news={news}
          pinnedArticles={pinnedArticles}
          title={activeCategory.title}
          heading={pageSeo?.h1}
          categoryId={activeCategory.id}
          pinnedIds={Array.from(pinnedIds)}
          hasMore={hasNextPage}
          mobileInterleave
          interleavedMedia={interleavedMedia}
          afterPinnedSlot={
            isIpoCategory ? (
              <LeaderboardAdBanner
                priority={false}
                imageSrc={LEADERBOARD_AD_IMAGE_ANTALA}
                redirectUrl={LEADERBOARD_AD_REDIRECT_URL_ANTALA}
              />
            ) : undefined
          }
        />
      </>
    );
  }

  notFound();
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params;

  if (!slug || slug.length === 0) return { title: 'News | KuberaNow' };

  const targetCategorySlug = decodeURIComponent(slug[0]);

  // `/{videoId}` short links: populate full metadata for social sharing crawlers
  if (slug.length === 1 && isVideoId(targetCategorySlug)) {
    const { isEnabled: draft } = await draftMode();
    const video = await getVideoBySlug(targetCategorySlug, draft);

    if (!video) return { title: 'Video not found | KuberaNow' };

    const title = `${video.meta?.title || video.title} | KuberaNow`;
    const rawDescription = video.meta?.description || video.description || '';
    const description = formatShareDescription(
      rawDescription,
      video.ratio === '9:16'
        ? 'Watch short video on KuberaNow'
        : 'Watch full video on KuberaNow'
    );
    const isShort = video.ratio === '9:16';
    const videoPath = isShort
      ? buildShortsHref(video.slug, video.video_id ?? targetCategorySlug)
      : buildVideoHref(video.slug, video.video_id ?? targetCategorySlug);
    const url = `${siteUrl}${videoPath}`;
    const dimensions = getVideoDimensions(video.videoThumbnail, isShort);
    const imageUrl = getVideoShareImageUrl(
      video.videoThumbnail,
      video.thumbnailUrl,
      isShort
    );

    return {
      title,
      description,
      alternates: { canonical: url },
      openGraph: {
        type: 'video.other',
        title,
        description,
        url,
        siteName: 'KuberaNow',
        ...(imageUrl && {
          images: [
            {
              url: imageUrl,
              width: dimensions.width,
              height: dimensions.height,
              type: 'image/jpeg',
              alt: video.title,
            },
          ],
        }),
      },
      twitter: {
        card: isShort ? 'summary' : 'summary_large_image',
        title,
        description,
        ...(imageUrl && { images: [imageUrl] }),
      },
    };
  }

  const isArticleId =
    slug.length === 1 && isArticleIdSegment(targetCategorySlug);

  if (slug.length === 2 || isArticleId) {
    const { isEnabled: draft } = await draftMode();

    const { slug: storySlug, articleId } = isArticleId
      ? { slug: null, articleId: targetCategorySlug }
      : splitStorySegment(decodeURIComponent(slug[1]));

    const targetArticleSlug = articleId ?? storySlug ?? '';

    const newsItem = await queryNews(targetArticleSlug, draft);

    if (!newsItem) {
      return {
        title: 'News Not Found | KuberaNow',
        description:
          'The requested news article could not be found. Explore other top stories on KuberaNow.',
        robots: {
          index: false,
          follow: true,
        },
      };
    }

    const title = `${newsItem.title} | KuberaNow`;
    const description =
      newsItem.summary || 'Read full news details on KuberaNow.';

    // const heroUrl = getMediaUrl(newsItem?.heroImage as Media | string | null);
    const canonicalCategorySlug =
      typeof newsItem.category === 'object' && newsItem.category !== null
        ? (newsItem.category.slug ?? targetCategorySlug)
        : targetCategorySlug;
    const articleUrl = buildArticleUrl(
      canonicalCategorySlug,
      newsItem.slug || targetArticleSlug,
      newsItem.article_id
    );

    const ogImageUrl = getShareImageUrl(
      newsItem?.heroImage as Media | string | null
    );

    return {
      title,
      description,
      alternates: {
        canonical: articleUrl,
      },
      openGraph: {
        type: 'article',
        title,
        description,
        url: articleUrl,
        siteName: 'KuberaNow',
        ...(ogImageUrl && {
          images: [
            {
              url: ogImageUrl,
              width: 1200,
              height: 630,
              type: 'image/jpeg',
              alt: newsItem.title,
            },
          ],
        }),
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        ...(ogImageUrl && {
          images: [ogImageUrl],
        }),
      },
    };
  }

  if (targetCategorySlug === 'market') {
    return {
      title: MARKET_TITLE,
      description: MARKET_DESCRIPTION,
      keywords: MARKET_KEYWORDS,
    };
  }

  const category = await queryCategoryBySlug(targetCategorySlug);
  const pageSeo = CATEGORY_PAGE_SEO[targetCategorySlug];

  if (pageSeo) {
    return {
      title: pageSeo.title,
      description: pageSeo.description || category?.description,
    };
  }

  return {
    title: category ? `${category.title} News` : 'News | KuberaNow',
    description:
      category?.description ||
      `Latest ${category?.title ?? ''} news from KuberaNow.`.trim(),
  };
}
