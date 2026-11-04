'use client';

import Image from 'next/image';
import Link from 'next/link';

import { useIsArticleLive } from '@/components/common/GlobalLiveBlogSyncProvider';
import LiveIndicatorDot from '@/components/news-detail/LiveIndicatorDot';

import { CategoryBadge } from './CategoryBadge';
import type { ContentImageProps } from './types';

export function SmallContentCard(props: ContentImageProps) {
  const image = props.image;
  const headline = props.headline;
  const category = props.category;
  const link = props.link;
  const isLive = useIsArticleLive(props.id, props.isLive);

  if (!image && !headline) return null;

  const content = (
    <article className='group flex flex-col gap-3'>
      <div className='border-career-stroke relative aspect-video w-full overflow-hidden rounded border sm:rounded-md'>
        {image && (
          <Image
            src={image}
            alt={headline || 'Featured article image'}
            fill
            className='object-cover transition-transform duration-300 ease-in-out group-hover:scale-110'
          />
        )}
      </div>
      <div className='flex flex-col gap-1'>
        <CategoryBadge
          category={category}
          categorySlug={props.categorySlug}
        />
        <h3 className='group-hover:text-primary line-clamp-3 text-sm leading-snug font-bold transition-colors sm:text-lg sm:leading-snug'>
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
