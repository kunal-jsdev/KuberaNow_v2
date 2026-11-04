import Image from 'next/image';
import Link from 'next/link';

import LiveIndicatorDot from '@/components/news-detail/LiveIndicatorDot';

import { CategoryBadge } from './CategoryBadge';
import { MediumContentCard } from './MediumContentCard';
import type { Article, ContentImageSectionProps } from './types';

export type { Article, ContentImageSectionProps };

export function ContentImage({
  mainArticle,
  sideArticles = [],
}: ContentImageSectionProps) {
  if (!mainArticle || (!mainArticle.image && !mainArticle.headline))
    return null;

  const content = (
    <>
      <div className='ring-career-stroke relative aspect-video w-full overflow-hidden rounded-md ring'>
        {mainArticle.image && (
          <Image
            src={mainArticle.image}
            alt={mainArticle.headline || 'Featured article image'}
            fill
            sizes='(max-width: 1024px) 100vw, 460px'
            className='object-cover transition-transform duration-300 ease-in-out group-hover:scale-110'
            priority
          />
        )}
      </div>

      <div className='flex min-w-0 flex-col gap-2 lg:mb-1'>
        <CategoryBadge
          category={mainArticle.category}
          categorySlug={mainArticle.categorySlug}
        />

        <h3 className='group-hover:text-primary text-lg leading-5.5 font-bold tracking-normal transition-colors sm:text-2xl sm:leading-7'>
          {mainArticle.isLive && (
            <LiveIndicatorDot
              size='sm'
              className='mr-2 ml-1.5 inline-flex align-middle'
            />
          )}
          <span>{mainArticle.headline}</span>
        </h3>

        {mainArticle.description && (
          <p className='text-sm leading-4.5 font-normal tracking-normal sm:text-lg sm:leading-5.5'>
            {mainArticle.description}
          </p>
        )}
      </div>
    </>
  );

  return (
    <section className='bg-surface shadow-contact-card ring-career-stroke grid grid-cols-1 gap-4 rounded-lg p-3 ring-1 sm:gap-5 sm:p-5 lg:grid-cols-2'>
      {mainArticle.link ? (
        <Link
          href={mainArticle.link}
          className='group contents'
        >
          {content}
        </Link>
      ) : (
        content
      )}

      {sideArticles.map(
        ({ id, image, headline, category, categorySlug, link, isLive }) => (
          <MediumContentCard
            key={id}
            id={id}
            image={image}
            headline={headline}
            category={category}
            categorySlug={categorySlug}
            link={link}
            isLive={isLive}
          />
        )
      )}
    </section>
  );
}
