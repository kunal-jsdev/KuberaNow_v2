/* eslint-disable no-console */
import { cache } from 'react';

import configPromise from '@payload-config';
import type { Metadata } from 'next';
import { draftMode } from 'next/headers';
import { getPayload } from 'payload';

import { CardWrapper } from '@/components/main-page/CardWrapper';
import { Carousel } from '@/components/main-page/Carousel';
import { ContentImage } from '@/components/main-page/ContentImage';
import type { CarouselSlide } from '@/components/main-page/types';
import {
  featuredSectionData,
  heroSlides,
  smallCardData,
} from '@/constants/sampleData';
import { isLiveBlogActive } from '@/lib/utils/liveBlog';
import { robotsMetadata } from '@/utils';

export const metadata: Metadata = {
  title: 'Home Page | KuberaNow',
  description:
    'Know everything about the market ,economy and global financial news with KuberaNow',
  robots: robotsMetadata,
};

const queryCarousel = cache(async (draft: boolean) => {
  try {
    const payload = await getPayload({ config: configPromise });
    const result = await payload.findGlobal({
      slug: 'carousel',
      draft,
      depth: 2,
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
    });
    return result;
  } catch (error) {
    console.error('Error fetching pinned articles:', error);
    return null;
  }
});

const queryNews = cache(async (draft: boolean) => {
  try {
    const payload = await getPayload({ config: configPromise });
    const result = await payload.find({
      collection: 'news',
      draft,
      limit: 24,
      sort: '-publishedAt',
      depth: 2,
    });
    return result.docs || [];
  } catch (error) {
    console.error('Error fetching news:', error);
    return [];
  }
});

export default async function HomePage() {
  const { isEnabled: draft } = await draftMode();
  const carouselData = await queryCarousel(draft);
  const pinnedData = await queryPinnedArticles(draft);
  const newsData = await queryNews(draft);

  const carouselSlides: CarouselSlide[] =
    carouselData?.slides?.map((slide, index) => {
      const article =
        slide.article && typeof slide.article === 'object'
          ? slide.article
          : null;

      let url: string | undefined;
      if (slide.mediaType === 'youtube' && slide.youtubeUrl) {
        url = slide.youtubeUrl;
      } else if (slide.mediaType === 'image' && slide.resolvedImage) {
        url = slide.resolvedImage;
      }

      let link: string | undefined;
      if (article?.slug) {
        const categorySlug =
          article.category && typeof article.category === 'object'
            ? article.category.slug
            : undefined;

        if (categorySlug) {
          link = `/${categorySlug}/${article.slug}`;
        }
      }

      return {
        id: slide.id || index.toString(),
        url,
        image: slide.resolvedImage || undefined,
        type: slide.mediaType,
        headline: slide.title || article?.title || '',
        link,
        isLive: isLiveBlogActive(article),
      };
    }) || [];

  const pinnedArticles =
    pinnedData?.articles?.map((item) => {
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
        link: article?.slug ? `/${category?.slug}/${article.slug}` : undefined,
        isLive: isLiveBlogActive(article),
      };
    }) || [];

  const rawNewsItems = newsData.map((article: any) => {
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
      link: article.slug ? `/${category?.slug}/${article.slug}` : undefined,
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
  } else if (rawNewsItems.length >= 3) {
    finalPinnedSectionData = {
      mainArticle: rawNewsItems[0] as any,
      sideArticles: rawNewsItems.slice(1, 3) as any[],
    };
    remainingNews = rawNewsItems.slice(3);
  } else {
    finalPinnedSectionData = featuredSectionData;
  }

  const chunkedNews = [];
  for (let i = 0; i < remainingNews.length; i += 8) {
    chunkedNews.push(remainingNews.slice(i, i + 8));
  }

  return (
    <main className='flex w-full flex-col items-center gap-6'>
      {/* <LeaderboardAdBanner /> */}
      <Carousel
        slides={carouselSlides.length > 0 ? carouselSlides : heroSlides}
      />
      <ContentImage {...finalPinnedSectionData} />
      {chunkedNews.length > 0
        ? chunkedNews.map((chunk, i) => (
            <CardWrapper
              key={chunk.map((card) => card.id).join('-') || i}
              cards={chunk}
            />
          ))
        : [0, 1, 2].map((i) => (
            <CardWrapper
              key={i}
              cards={smallCardData}
            />
          ))}
    </main>
  );
}
