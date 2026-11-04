'use client';

import Image from 'next/image';
import Link from 'next/link';

import { useIsArticleLive } from '@/components/common/GlobalLiveBlogSyncProvider';
import LiveIndicatorDot from '@/components/news-detail/LiveIndicatorDot';
import { isLiveBlogActive } from '@/lib/utils/liveBlog';
import { buildArticleHref } from '@/Payload/lib/utilities/articleId';
import { getMediaUrl } from '@/Payload/lib/utilities/getMediaUrl';
import type { Media } from '@/payload-types';

import { type NewsCardData } from './NewsCard';

type NewsLeadCardProps = {
  news: NewsCardData;
  pinned?: boolean;
  className?: string;
};

export default function NewsLeadCard({
  news,
  pinned = false,
  className = '',
}: NewsLeadCardProps) {
  const initialIsLive = isLiveBlogActive(news);
  const isLive = useIsArticleLive(String(news.id), initialIsLive);
  const heroUrl = getMediaUrl(news.heroImage as Media | string);
  const heroAlt =
    typeof news.heroImage === 'object'
      ? news.heroImage.alt || news.title
      : news.title;

  const categorySlug =
    typeof news.category === 'string'
      ? news.category
      : (news.category?.slug ?? '');

  return (
    <Link
      href={buildArticleHref(categorySlug, news.slug, news.article_id) ?? ''}
      scroll
      className={`bg-surface group flex flex-col gap-3 overflow-hidden rounded-md transition-shadow sm:flex-row ${className}`}
    >
      <div className='ring-career-stroke relative aspect-video w-full overflow-hidden rounded-md ring sm:w-1/2 sm:max-w-111.25 sm:min-w-64 lg:w-3/5'>
        {heroUrl ? (
          <Image
            src={heroUrl}
            alt={heroAlt}
            fill
            sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 445px'
            className='object-cover duration-300 ease-in-out group-hover:scale-110'
            priority
          />
        ) : (
          <div className='bg-career-tint size-full' />
        )}
      </div>

      <div className='min-w-0 flex-1 py-3 sm:py-1 sm:pr-1'>
        <h3 className='text-career-dark group-hover:text-primary line-clamp-3 text-lg leading-snug font-bold transition-colors sm:leading-8 lg:text-2xl'>
          {isLive && (
            <LiveIndicatorDot
              size='sm'
              className='mr-2 ml-1 inline-flex align-middle'
            />
          )}
          <span>{news.title}</span>
        </h3>
        {news.summary && (
          <p className='text-text-soft mt-2 line-clamp-3 text-sm leading-6 sm:line-clamp-4 lg:line-clamp-6 lg:text-lg'>
            {news.summary}
          </p>
        )}
      </div>
    </Link>
  );
}
