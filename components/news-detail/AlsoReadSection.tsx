import Image from 'next/image';
import Link from 'next/link';

import ContentPanel from '@/components/common/ContentPanel';
import { isLiveBlogActive } from '@/lib/utils/liveBlog';
import { buildArticleHref } from '@/Payload/lib/utilities/articleId';
import { getMediaUrl } from '@/Payload/lib/utilities/getMediaUrl';
import type { Media, News } from '@/payload-types';

import AlsoReadTitle from './AlsoReadTitle';

type AlsoReadSectionProps = {
  articles: News[];
  className?: string;
};

export default function AlsoReadSection({
  articles,
  className = '',
}: AlsoReadSectionProps) {
  if (!articles || articles.length === 0) {
    return null;
  }

  return (
    <ContentPanel className={className}>
      <div className='border-career-stroke border-b pb-2'>
        <div className='relative flex h-5 items-center'>
          <span
            className='bg-primary absolute left-0 h-5 w-1 rounded-xs shadow-[2px_0px_0px_0px_var(--color-career-accent)]'
            aria-hidden
          />
          <h3 className='text-career-dark pl-3 font-sans text-base leading-5 font-bold tracking-[0px]'>
            Also Read
          </h3>
        </div>
      </div>
      <div className='mt-4 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 md:gap-4.5'>
        {articles.map((article) => {
          const heroImage = article.heroImage as Media | string | undefined;
          const imageUrl = getMediaUrl(heroImage);
          const heroAlt =
            typeof heroImage === 'object' && heroImage?.alt
              ? heroImage.alt
              : article.title;

          let categorySlug = '';
          if (
            typeof article.category === 'object' &&
            article.category !== null
          ) {
            categorySlug = article.category.slug;
          } else if (typeof article.category === 'string') {
            categorySlug = article.category;
          }

          const href =
            buildArticleHref(categorySlug, article.slug, article.article_id) ??
            '#';

          return (
            <Link
              key={article.id}
              href={href}
              scroll
              className='group flex flex-col'
            >
              <div className='border-career-stroke relative aspect-video w-full overflow-hidden rounded-md border bg-slate-100'>
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={heroAlt}
                    fill
                    sizes='(max-width: 768px) 50vw, 25vw'
                    className='object-cover transition-transform duration-300 ease-in-out group-hover:scale-105'
                  />
                ) : (
                  <div className='bg-career-tint size-full' />
                )}
              </div>
              <div className='flex min-w-0 flex-1 flex-col items-start gap-2 pt-3'>
                <h4 className='text-career-dark group-hover:text-primary line-clamp-3 text-sm leading-snug font-bold transition-colors lg:text-lg!'>
                  <AlsoReadTitle
                    articleId={article.id}
                    title={article.title}
                    fallbackIsLive={isLiveBlogActive(article)}
                  />
                </h4>
              </div>
            </Link>
          );
        })}
      </div>
    </ContentPanel>
  );
}
