'use client';

import Image from 'next/image';
import Link from 'next/link';

import { useIsArticleLive } from '@/components/common/GlobalLiveBlogSyncProvider';
import LiveIndicatorDot from '@/components/news-detail/LiveIndicatorDot';

import { CategoryBadge } from './CategoryBadge';
import type { ContentImageProps } from './types';

export function MediumContentCard(props: ContentImageProps) {
  const image = props.image;
  const headline = props.headline;
  const category = props.category;
  const link = props.link;
  const isLive = useIsArticleLive(props.id, props.isLive);

  if (!image && !headline) return null;

  const content = (
    <article className='group sm:border-career-stroke ring-career-stroke flex items-start gap-2 rounded-sm p-2.5 ring-1 sm:gap-4 sm:border sm:p-4 sm:pb-5 sm:ring-0 md:min-h-35.75'>
      <div className='ring-career-stroke relative aspect-video shrink-0 basis-2/5 overflow-hidden rounded ring sm:basis-2/5'>
        {image && (
          <Image
            src={image}
            alt={headline || 'Featured article image'}
            fill
            sizes='(max-width: 1024px) 40vw, 200px'
            className='object-cover transition-transform duration-300 ease-in-out group-hover:scale-110'
          />
        )}
      </div>

      <div className='flex basis-3/5 flex-col items-start gap-1 sm:basis-3/5'>
        <CategoryBadge
          category={category}
          categorySlug={props.categorySlug}
        />
        <h3 className='group-hover:text-primary line-clamp-2 text-sm leading-snug font-bold transition-colors sm:line-clamp-3 sm:text-xl sm:leading-snug'>
          {isLive && (
            <LiveIndicatorDot
              size='sm'
              className='mr-2 ml-1.5 inline-flex align-middle'
            />
          )}
          <span>{headline}</span>
        </h3>
      </div>
    </article>
  );

  if (link) {
    return (
      <Link
        href={link}
        className='block w-full'
      >
        {content}
      </Link>
    );
  }

  return content;
}
