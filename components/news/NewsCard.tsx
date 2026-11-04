'use client';

import Image from 'next/image';
import Link from 'next/link';

import { useIsArticleLive } from '@/components/common/GlobalLiveBlogSyncProvider';
import LiveIndicatorDot from '@/components/news-detail/LiveIndicatorDot';
import { isLiveBlogActive } from '@/lib/utils/liveBlog';
import { buildArticleHref } from '@/Payload/lib/utilities/articleId';
import { getMediaUrl } from '@/Payload/lib/utilities/getMediaUrl';
import type { Media, News } from '@/payload-types';

export type NewsCardData = Pick<
  News,
  'id' | 'slug' | 'title' | 'heroImage' | 'category' | 'article_id'
> &
  // Not rendered by NewsCard; lightweight feeds (nav previews) leave it out.
  Partial<Pick<News, 'summary'>> & {
    isLiveBlog?: boolean | null;
    liveBlogStatus?: ('active' | 'concluded') | null;
    liveUpdates?: News['liveUpdates'];
    _status?: string | null;
  };

type NewsCardProps = {
  news: NewsCardData;
  pinned?: boolean;
  orientation?: 'vertical' | 'horizontal';
  className?: string;
  titleTextSize?: string;
  bordered?: boolean;
  compact?: boolean;
  squareThumb?: boolean;
};

export default function NewsCard({
  news,
  pinned = false,
  orientation = 'vertical',
  className = '',
  titleTextSize = '',
  bordered = false,
  compact = false,
  squareThumb = false,
}: NewsCardProps) {
  const isHorizontal = orientation === 'horizontal';
  const heroUrl = getMediaUrl(news.heroImage as Media | string);
  const heroAlt =
    typeof news.heroImage === 'object'
      ? news.heroImage.alt || news.title
      : news.title;
  const categorySlug =
    typeof news.category === 'string'
      ? news.category
      : (news.category?.slug ?? '');

  const verticalOuterClassName = bordered
    ? 'flex-col border-career-stroke border'
    : 'flex-col';
  const verticalTextClassName = bordered ? 'px-3 pt-3 pb-3' : 'pt-3';
  let horizontalOuterClassName =
    'border-career-stroke items-center gap-3 border p-2.5 lg:p-3.75';
  if (compact) {
    horizontalOuterClassName =
      'border-career-stroke items-center gap-2 border p-2';
  } else if (squareThumb) {
    horizontalOuterClassName =
      'border-career-stroke items-center gap-3 border p-2.5 xl:gap-4 xl:p-3.75';
  }
  let horizontalThumbClassName = 'h-15.5 shrink-0 lg:h-22.5 w-40';
  if (compact) {
    horizontalThumbClassName = 'h-12 shrink-0 w-18';
  } else if (squareThumb) {
    horizontalThumbClassName = 'h-18 shrink-0 xl:h-23';
  }
  let titleTypographyClassName = 'text-sm leading-snug';
  let horizontalTextClassName = 'py-0.5';
  if (compact) {
    titleTypographyClassName = 'text-xs leading-snug';
  } else if (squareThumb) {
    titleTypographyClassName =
      'text-base leading-snug xl:text-[20px] xl:leading-[27px]';
    horizontalTextClassName = 'py-1';
  }

  const initialIsLive = isLiveBlogActive(news);
  const isLive = useIsArticleLive(String(news.id), initialIsLive);

  return (
    <Link
      href={buildArticleHref(categorySlug, news.slug, news.article_id) ?? ''}
      scroll
      className={`group bg-surface flex overflow-hidden rounded-md ${
        isHorizontal ? horizontalOuterClassName : verticalOuterClassName
      } ${className}`}
    >
      <div
        className={`ring-career-stroke relative aspect-video overflow-hidden rounded-sm ring lg:rounded-md ${
          isHorizontal ? horizontalThumbClassName : 'w-full'
        }`}
      >
        {heroUrl ? (
          <Image
            src={heroUrl}
            alt={heroAlt}
            fill
            sizes={
              isHorizontal
                ? '120px'
                : '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 220px'
            }
            className='object-cover transition-transform duration-300 ease-in-out group-hover:scale-110'
          />
        ) : (
          <div className='bg-career-tint size-full' />
        )}
      </div>

      <div
        className={`flex min-w-0 flex-1 flex-col items-start gap-2 ${
          isHorizontal ? horizontalTextClassName : verticalTextClassName
        }`}
      >
        <h6
          className={`text-career-dark group-hover:text-primary line-clamp-3 font-bold transition-colors ${titleTypographyClassName} ${titleTextSize}`}
        >
          {isLive && (
            <LiveIndicatorDot
              size='sm'
              className='mr-2 ml-1.5 inline-flex align-middle'
            />
          )}
          <span>{news.title}</span>
        </h6>
      </div>
    </Link>
  );
}
