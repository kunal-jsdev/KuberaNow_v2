/* eslint-disable no-console */
import { cache } from 'react';

import configPromise from '@payload-config';
import type { Metadata } from 'next';
import { draftMode } from 'next/headers';
import { getPayload } from 'payload';

import ContentPanel from '@/components/common/ContentPanel';
import LeaderboardAdBanner from '@/components/common/LeaderboardAdBanner';
import MobileInterleaveRoot from '@/components/layout/MobileInterleaveRoot';
import { Carousel } from '@/components/main-page/Carousel';
import { ContentImage } from '@/components/main-page/ContentImage';
import { InfiniteScrollNews } from '@/components/main-page/InfiniteScrollNews';
import type { CarouselSlide } from '@/components/main-page/types';
import { MarketTickerTape } from '@/components/market/MarketWidgets';
import ActiveLiveBlogLeadCard from '@/components/news/ActiveLiveBlogLeadCard';
import NewsCard from '@/components/news/NewsCard';
import {
  HOME_DESCRIPTION,
  HOME_H1,
  HOME_KEYWORDS,
  HOME_SAME_AS,
  HOME_TITLE,
} from '@/constants/mainPage';
import { FEED_BATCH_SIZE } from '@/constants/newsFeed';
import { hasLiveBlogTimeline, isLiveBlogActive } from '@/lib/utils/liveBlog';
import { buildArticleHref } from '@/Payload/lib/utilities/articleId';
import { getInterleavedMedia } from '@/Payload/lib/utilities/getInterleavedVideos';
import { getServerSideURL } from '@/Payload/lib/utilities/getURL';
import type { News } from '@/payload-types';

const siteUrl = getServerSideURL().replace(/\/+$/, '');
export const dynamic = 'force-static';
export const revalidate = false;

const CHUNK_SIZE = 8;

export const metadata: Metadata = {
  title: HOME_TITLE,
  description: HOME_DESCRIPTION,
  keywords: HOME_KEYWORDS,
};

const queryCarousel = cache(async (draft: boolean) => {
  try {
    const payload = await getPayload({ config: configPromise });
    const result = await payload.findGlobal({
      slug: 'carousel',
      draft,
      depth: 2,
      overrideAccess: false,
    });
    return result;
  } catch (error) {
    console.error('Error fetching carousel:', error);
    return null;
  }
});

const queryPinnedArticles = cache(async (draft: boolean) => {
  try {
    const payload = await getPayload({ config: configPromise });
    const result = await payload.findGlobal({
      slug: 'pinned-articles',
      draft,
      depth: 2,
      overrideAccess: false,
    });
    return result;
  } catch (error) {
    console.error('Error fetching pinned articles:', error);
    return null;
  }
});

const queryNews = cache(
  async (
    draft: boolean,
    pinnedIds: (string | number)[] = [],
    limit = FEED_BATCH_SIZE
  ) => {
    try {
      const payload = await getPayload({ config: configPromise });
      const whereClause: any = {
        _status: {
          equals: 'published',
        },
      };

      if (pinnedIds.length > 0) {
        whereClause.id = { not_in: pinnedIds };
      }

      const result = await payload.find({
        collection: 'news',
        draft,
        where: whereClause,
        limit,
        sort: '-publishedAt',
        depth: 2,
      });
      return { docs: result.docs || [], hasNextPage: result.hasNextPage };
    } catch (error) {
      console.error('Error fetching news:', error);
      return { docs: [], hasNextPage: false };
    }
  }
);

export default async function HomePage() {
  const { isEnabled: draft } = await draftMode();
  const carouselData = await queryCarousel(draft);
  const pinnedData = await queryPinnedArticles(draft);

  const pinnedPublished = pinnedData?._status === 'published';

  const pinnedNews: News[] = (pinnedPublished ? pinnedData?.articles || [] : [])
    .map((item) =>
      item.article && typeof item.article === 'object'
        ? (item.article as News)
        : null
    )
    .filter((article): article is News => Boolean(article));

  const pinnedArticles =
    (pinnedPublished ? pinnedData?.articles || [] : [])?.map((item) => {
      const article =
        item.article && typeof item.article === 'object' ? item.article : null;
      const heroImage =
        article?.heroImage && typeof article.heroImage === 'object'
          ? article.heroImage
          : null;
      const category =
        article?.category && typeof article.category === 'object'
          ? article.category
          : null;

      return {
        id: article?.id || item.id || '',
        image: heroImage?.url || '',
        category: category?.title || '',
        categorySlug: category?.slug || undefined,
        headline: article?.title || '',
        description: article?.summary || '',
        link:
          buildArticleHref(
            category?.slug,
            article?.slug,
            article?.article_id
          ) ?? undefined,
        isLive: isLiveBlogActive(article),
      };
    }) || [];

  const pinnedIds = pinnedArticles.map((item) => item.id).filter(Boolean);

  const [newsData, interleavedMedia] = await Promise.all([
    queryNews(draft, pinnedIds),
    getInterleavedMedia(),
  ]);

  const carouselSlides: CarouselSlide[] = (carouselData?.slides ?? [])
    .filter((slide) => {
      if (slide.mediaType === 'youtube') return true;
      if (!slide.article) return true;
      return (
        typeof slide.article === 'object' &&
        slide.article._status === 'published'
      );
    })
    .map((slide, index) => {
      const isYouTube = slide.mediaType === 'youtube';

      const linked =
        !isYouTube && slide.article && typeof slide.article === 'object'
          ? slide.article
          : null;
      const article = linked?._status === 'published' ? linked : null;
      const category =
        article?.category && typeof article.category === 'object'
          ? article.category
          : null;

      let url: string | undefined;
      if (isYouTube && slide.youtubeUrl) {
        url = slide.youtubeUrl;
      } else if (slide.mediaType === 'image' && slide.resolvedImage) {
        url = slide.resolvedImage;
      }

      let link: string | undefined;
      if (category?.slug && article?.slug) {
        link =
          buildArticleHref(category.slug, article.slug, article.article_id) ??
          undefined;
      }

      return {
        id: slide.id || index.toString(),
        url,
        image: isYouTube ? undefined : slide.resolvedImage || undefined,
        type: slide.mediaType,
        headline: isYouTube ? '' : slide.title || article?.title || '',
        link,
        isLive: isLiveBlogActive(article),
      };
    });

  const rawNewsItems = newsData.docs.map((article: any) => {
    const heroImage =
      article?.heroImage && typeof article.heroImage === 'object'
        ? article.heroImage
        : null;
    const category =
      article?.category && typeof article.category === 'object'
        ? article.category
        : null;

    return {
      id: article.id,
      image: heroImage?.url || '',
      category: category?.title || '',
      categorySlug: category?.slug || undefined,
      headline: article.title || '',
      description: article.summary || '',
      link:
        buildArticleHref(category?.slug, article.slug, article.article_id) ??
        undefined,
      isLive: isLiveBlogActive(article),
    };
  });

  let finalPinnedSectionData;
  let remainingNews = rawNewsItems;

  if (pinnedArticles.length > 0) {
    finalPinnedSectionData = {
      mainArticle: pinnedArticles[0] as any,
      sideArticles: pinnedArticles.slice(1) as any[],
    };
    remainingNews = rawNewsItems;
  } else if (rawNewsItems.length >= 3) {
    finalPinnedSectionData = {
      mainArticle: rawNewsItems[0] as any,
      sideArticles: rawNewsItems.slice(1, 3) as any[],
    };
    remainingNews = rawNewsItems.slice(3);
  }

  const allExcludedPinnedIds = Array.from(
    new Set([
      ...pinnedIds,
      ...(finalPinnedSectionData
        ? [
            finalPinnedSectionData.mainArticle?.id,
            ...(finalPinnedSectionData.sideArticles?.map((a: any) => a?.id) ||
              []),
          ]
        : []),
    ])
  ).filter(Boolean);

  const fallbackLeadNews =
    pinnedArticles.length === 0 && rawNewsItems.length >= 3
      ? (newsData.docs.slice(0, 3) as News[])
      : [];
  const leadStories = pinnedArticles.length > 0 ? pinnedNews : fallbackLeadNews;
  const leadPinnedNews = leadStories[0] ?? null;
  const belowLeadPinnedNews = leadStories.slice(1, 3);
  const isLeadTimelineVisible = hasLiveBlogTimeline(leadPinnedNews);

  const orderedArticles = finalPinnedSectionData
    ? [
        finalPinnedSectionData.mainArticle,
        ...finalPinnedSectionData.sideArticles,
        ...remainingNews,
      ]
    : remainingNews;

  const homeJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'NewsMediaOrganization',
        '@id': `${siteUrl}/#organization`,
        name: 'KuberaNow',
        url: `${siteUrl}/`,
        logo: `${siteUrl}/assets/logo-no-badge.svg`,
        sameAs: HOME_SAME_AS,
      },
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        url: `${siteUrl}/`,
        name: 'KuberaNow',
        publisher: { '@id': `${siteUrl}/#organization` },
        inLanguage: 'gu-IN',
      },
      {
        '@type': 'WebPage',
        '@id': `${siteUrl}/#webpage`,
        url: `${siteUrl}/`,
        name: HOME_TITLE,
        isPartOf: { '@id': `${siteUrl}/#website` },
        mainEntity: { '@id': `${siteUrl}/#itemlist` },
        inLanguage: 'gu-IN',
      },
      {
        '@type': 'ItemList',
        '@id': `${siteUrl}/#itemlist`,
        itemListElement: orderedArticles
          .filter((item) => item.link && item.headline)
          .slice(0, 8)
          .map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            url: `${siteUrl}${item.link}`,
            name: item.headline,
          })),
      },
    ],
  };
  const MAX_GRID_CARDS = 24;
  const gridNews = remainingNews.slice(0, MAX_GRID_CARDS);

  const chunkedNews = [];
  for (let i = 0; i < gridNews.length; i += CHUNK_SIZE) {
    chunkedNews.push(gridNews.slice(i, i + CHUNK_SIZE));
  }

  return (
    <MobileInterleaveRoot
      as='main'
      className='flex w-full flex-col items-center gap-6'
      preamble={
        <>
          <script
            type='application/ld+json'
            dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd) }}
          />
          <h1 className='sr-only'>{HOME_H1}</h1>
        </>
      }
    >
      <LeaderboardAdBanner />
      {carouselData?.enabled && carouselSlides.length > 0 && (
        <Carousel slides={carouselSlides} />
      )}
      {isLeadTimelineVisible && leadPinnedNews ? (
        <ContentPanel className='flex flex-col gap-3'>
          <ActiveLiveBlogLeadCard
            news={leadPinnedNews}
            pinned
          />

          {belowLeadPinnedNews.length > 0 && (
            <div className='grid grid-cols-1 gap-5 sm:grid-cols-2'>
              {belowLeadPinnedNews.map((article) => (
                <NewsCard
                  key={article.id}
                  news={article}
                  pinned
                  orientation='horizontal'
                  titleTextSize='lg:text-xl'
                />
              ))}
            </div>
          )}
        </ContentPanel>
      ) : (
        finalPinnedSectionData && <ContentImage {...finalPinnedSectionData} />
      )}
      {MarketTickerTape && <MarketTickerTape />}
      <InfiniteScrollNews
        initialNews={remainingNews}
        initialHasMore={newsData.hasNextPage}
        // Only ids excluded from the initial query, so later pages line up with page 1.
        pinnedIds={allExcludedPinnedIds}
        // Home always links its Video / Shorts sections to the full listings.
        interleavedMedia={{
          ...interleavedMedia,
          moreVideosHref: '/videos',
          moreShortsHref: '/short-videos',
        }}
      />
    </MobileInterleaveRoot>
  );
}
