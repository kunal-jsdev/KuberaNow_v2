import Image from 'next/image';
import Link from 'next/link';

import RichText from '@/Payload/components/RichText';
import { getMediaUrl } from '@/Payload/lib/utilities/getMediaUrl';
import type { Media, News, NewsCategory, Tag } from '@/payload-types';

import ContentPanel from '../common/ContentPanel';
import PageSectionHeader from '../common/PageSectionHeader';
import SafeErrorBoundary from '../common/SafeErrorBoundary';

import AlsoReadSection from './AlsoReadSection';
import ArticleCopyWrapper from './ArticleCopyWrapper';
import ArticleScrollToTop from './ArticleScrollToTop';
import { LiveBlogRealtimeProvider } from './live-blog/LiveBlogRealtimeContext';
import LiveTopNotificationBadge from './live-blog/LiveTopNotificationBadge';
import LiveBlogTimeline from './LiveBlogTimeline';
import { LiveArticleTitle } from './LiveTitleIndicator';
import LiveUpdatesCarousel from './LiveUpdatesCarousel';
import NewsKeyPoints from './NewsKeyPoints';
import NewsShareLinks from './NewsShareLinks';
import NewsShareLinksExpanded from './NewsShareLinksExpanded';

type NewsDetailSectionProps = {
  news: News;
  sharePath: string;
  alsoRead?: News[];
};

function formatDateTime(value?: string | null): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function toValidDate(value?: string | null): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function isSameCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function getArticleTimestamp(
  news: News
): { label: string; value: string } | null {
  const published = toValidDate(news.publishedAt);
  const updated = toValidDate(news.updatedAt);

  if (!published) {
    return updated
      ? { label: 'Updated On', value: formatDateTime(news.updatedAt) }
      : null;
  }

  if (updated && !isSameCalendarDay(published, updated)) {
    return { label: 'Updated On', value: formatDateTime(news.updatedAt) };
  }

  return { label: 'Published On', value: formatDateTime(news.publishedAt) };
}

export default function NewsDetailSection({
  news,
  sharePath,
  alsoRead,
}: NewsDetailSectionProps) {
  const category =
    typeof news.category === 'object'
      ? (news.category as NewsCategory).title
      : null;

  const heroImage = news.heroImage as Media | string;
  const heroUrl = getMediaUrl(heroImage);
  const heroAlt =
    typeof heroImage === 'object' ? heroImage.alt || news.title : news.title;

  const author = news.newsBy?.trim() || 'desk@kuberanow';
  const timestamp = getArticleTimestamp(news);

  const keyPoints =
    news.showKeyPoints !== false
      ? (news.keyPoints ?? []).filter((kp) => kp.point?.trim())
      : [];

  const tags = (news.tags ?? []).filter(
    (tag): tag is Tag => typeof tag === 'object'
  );

  const showCaption = news.showImageCaption !== false;

  const bodyContent = (
    <>
      <ContentPanel>
        <ArticleScrollToTop
          articleId={news.id}
          articleSlug={news.slug}
        />
        {category && (
          <PageSectionHeader
            title={
              <nav aria-label='Breadcrumb'>
                <>
                  <span className='text-career-dark text-base leading-5 font-bold'>
                    {category}
                  </span>
                </>
              </nav>
            }
          />
        )}

        <div>
          <LiveArticleTitle
            className='font-sans-guj mt-3 mb-2 text-lg leading-6 font-bold md:mt-6 md:mb-4 md:text-[26px] md:leading-8'
            articleId={String(news.id)}
            fallbackIsLive={Boolean(news.isLiveBlog)}
            title={news.title}
          />
          <p className='text-career-dark font-sans-guj text-sm leading-5 md:text-lg md:leading-6'>
            {news.summary}
          </p>
        </div>

        <div className='mt-4 mb-6 flex flex-wrap items-center justify-between gap-4'>
          <div className='flex items-center gap-1.5 md:gap-2'>
            <div className='flex items-center gap-4'>
              <span className='text-career-dark text-xs leading-4.5 font-semibold md:text-sm'>
                {author}
              </span>
              {timestamp && (
                <span className='text-career-dark text-xs leading-4.5 md:text-sm'>
                  {timestamp.label} : {timestamp.value}
                </span>
              )}
            </div>
          </div>
          <NewsShareLinks
            path={sharePath}
            title={news.title}
          />
        </div>

        <SafeErrorBoundary>
          <LiveUpdatesCarousel
            updates={news.liveUpdates || []}
            isLiveBlog={Boolean(news.isLiveBlog)}
          />
        </SafeErrorBoundary>

        {Boolean(
          news.isLiveBlog || (news.liveUpdates && news.liveUpdates.length > 0)
        ) &&
        heroUrl &&
        keyPoints.length > 0 ? (
          <div className='my-4 grid grid-cols-1 gap-4 md:my-6 md:grid-cols-2 md:items-stretch md:gap-5'>
            <figure className='flex h-full flex-col justify-between gap-2'>
              <div className='border-career-stroke relative aspect-910/511 min-h-[190px] w-full flex-1 overflow-hidden rounded-md border'>
                <Image
                  src={heroUrl}
                  alt={heroAlt}
                  fill
                  sizes='(max-width: 768px) 100vw, 475px'
                  className='object-cover'
                  priority
                />
              </div>
              {(showCaption && news.imageCaption) || news.imageCredit ? (
                <figcaption className='flex shrink-0 items-start justify-between gap-3'>
                  {showCaption && news.imageCaption ? (
                    <span
                      className={`text-career-dark text-xs leading-4 md:text-sm md:leading-4.5 ${news.imageCredit ? 'basis-[70%]' : ''}`}
                    >
                      {news.imageCaption}
                    </span>
                  ) : (
                    <span />
                  )}
                  {news.imageCredit && (
                    <span className='text-career-dark ml-auto basis-[30%] text-right text-xs leading-4 md:text-sm md:leading-4.5'>
                      {news.imageCredit}
                    </span>
                  )}
                </figcaption>
              ) : null}
            </figure>

            <NewsKeyPoints
              points={keyPoints}
              maxPoints={4}
              className='my-0 h-full md:my-0'
            />
          </div>
        ) : (
          <>
            {heroUrl && (
              <figure className='flex flex-col gap-2'>
                <div className='border-career-stroke relative aspect-910/511 w-full overflow-hidden rounded-md border'>
                  <Image
                    src={heroUrl}
                    alt={heroAlt}
                    fill
                    sizes='(max-width: 950px) 100vw, 910px'
                    className='object-cover'
                    priority
                  />
                </div>
                {(showCaption && news.imageCaption) || news.imageCredit ? (
                  <figcaption className='flex items-start justify-between gap-3'>
                    {showCaption && news.imageCaption ? (
                      <span
                        className={`text-career-dark text-sm leading-4.5 ${news.imageCredit ? 'basis-[70%]' : ''}`}
                      >
                        {news.imageCaption}
                      </span>
                    ) : (
                      <span />
                    )}
                    {news.imageCredit && (
                      <span className='text-career-dark ml-auto basis-[30%] text-right text-sm leading-4.5'>
                        {news.imageCredit}
                      </span>
                    )}
                  </figcaption>
                ) : null}
              </figure>
            )}

            <NewsKeyPoints points={keyPoints} />
          </>
        )}

        <SafeErrorBoundary>
          <LiveBlogTimeline
            updates={news.liveUpdates || []}
            isLiveBlog={Boolean(news.isLiveBlog)}
          />
        </SafeErrorBoundary>

        <ArticleCopyWrapper
          sharePath={sharePath}
          className={`news-detail-content text-career-dark flex flex-col gap-4 text-base leading-6 ${!keyPoints?.length ? 'mt-6' : 'mt-0'}`}
        >
          <RichText
            data={news.content}
            enableGutter={false}
            enableProse={false}
          />

          {news?.showDisclaimer && (
            <p className='text-career-dark mt-6 text-sm leading-4.5'>
              <span className='italic'>Disclaimer - </span>
              {news?.disclaimer}
            </p>
          )}
        </ArticleCopyWrapper>

        {/* Tags */}
        {tags.length > 0 && (
          <div className='border-divider mt-3 flex flex-wrap items-center gap-4 border-b pb-3 md:mt-6 md:pb-4'>
            <span className='text-career-dark text-xs leading-4 font-semibold'>
              Tags :
            </span>
            {tags.map((tag) =>
              tag.slug ? (
                <Link
                  key={tag.id}
                  href={`/tag/${tag.slug}`}
                  className='border-divider text-background-hover rounded-full border bg-transparent px-2.5 py-1 text-[10px] leading-4 font-bold transition-colors md:text-xs md:font-semibold'
                >
                  {tag.title}
                </Link>
              ) : (
                <span
                  key={tag.id}
                  className='border-divider text-background-hover rounded-full border bg-transparent px-2.5 py-1 text-[10px] leading-4 font-bold md:text-xs md:font-semibold'
                >
                  {tag.title}
                </span>
              )
            )}
          </div>
        )}

        <div className='mt-3 flex flex-wrap items-center gap-4 md:mt-6'>
          <span className='text-career-dark text-xs leading-4 font-semibold'>
            Share Link
          </span>
          <NewsShareLinksExpanded
            path={sharePath}
            title={news.title}
          />
        </div>

        <LiveTopNotificationBadge categoryName={category || 'MARKET'} />
      </ContentPanel>

      {alsoRead && alsoRead.length > 0 && (
        <AlsoReadSection
          articles={alsoRead}
          className='mt-5'
        />
      )}
    </>
  );

  return (
    <LiveBlogRealtimeProvider
      articleId={String(news.id)}
      slug={news.slug || ''}
      initialIsLiveBlog={Boolean(news.isLiveBlog)}
      initialUpdates={news.liveUpdates || []}
      initialStatus={news.isLiveBlog ? 'active' : 'concluded'}
    >
      {bodyContent}
    </LiveBlogRealtimeProvider>
  );
}
