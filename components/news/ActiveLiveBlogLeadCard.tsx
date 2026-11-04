'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

import { useIsArticleLive } from '@/components/common/GlobalLiveBlogSyncProvider';
import {
  LiveBlogRealtimeProvider,
  useOptionalLiveBlogRealtime,
} from '@/components/news-detail/live-blog/LiveBlogRealtimeContext';
import LiveIndicatorDot from '@/components/news-detail/LiveIndicatorDot';
import { isLiveBlogActive } from '@/lib/utils/liveBlog';
import { buildArticleHref } from '@/Payload/lib/utilities/articleId';
import { getMediaUrl } from '@/Payload/lib/utilities/getMediaUrl';
import type { Media, News } from '@/payload-types';

import { type NewsCardData } from './NewsCard';
import NewsLeadCard from './NewsLeadCard';

type LiveBlogUpdateItem = NonNullable<News['liveUpdates']>[number];

type ActiveLiveBlogLeadCardProps = {
  news: NewsCardData;
  pinned?: boolean;
  className?: string;
};

function formatTimelineTimestamp(timestampStr?: string | null): {
  timePart: string;
  datePart: string;
} {
  if (!timestampStr) return { timePart: '', datePart: '' };
  const date = new Date(timestampStr);
  if (Number.isNaN(date.getTime())) return { timePart: '', datePart: '' };

  const datePart = date.toLocaleDateString('gu-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const timePart = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  return { timePart, datePart };
}

function ActiveLiveBlogLeadCardInner({
  news,
  pinned = false,
  className = '',
}: ActiveLiveBlogLeadCardProps) {
  const realtimeCtx = useOptionalLiveBlogRealtime();

  const fallbackIsLive = isLiveBlogActive(news);
  const globalIsLive = useIsArticleLive(news.id ?? news.slug, fallbackIsLive);
  const isLiveActive =
    realtimeCtx !== null && realtimeCtx !== undefined
      ? Boolean(realtimeCtx.isLiveBlog)
      : globalIsLive;

  if (!isLiveActive) {
    return (
      <NewsLeadCard
        news={news}
        pinned={pinned}
        className={className}
      />
    );
  }

  const heroUrl = getMediaUrl(news.heroImage as Media | string);
  const heroAlt =
    typeof news.heroImage === 'object'
      ? news.heroImage.alt || news.title
      : news.title;

  const categorySlug =
    typeof news.category === 'string'
      ? news.category
      : (news.category?.slug ?? '');

  const articleHref =
    buildArticleHref(categorySlug, news.slug, news.article_id) ?? '';

  const effectiveUpdates: LiveBlogUpdateItem[] =
    realtimeCtx?.updates ?? (news.liveUpdates as LiveBlogUpdateItem[]) ?? [];

  // Sort updates descending by time (most recent first)
  const sortedUpdates = [...effectiveUpdates].sort((a, b) => {
    const timeA = new Date(a.timestamp).getTime();
    const timeB = new Date(b.timestamp).getTime();
    return (
      (Number.isNaN(timeB) ? 0 : timeB) - (Number.isNaN(timeA) ? 0 : timeA)
    );
  });

  const displayedUpdates = sortedUpdates.slice(0, 3);
  const remainingCount = Math.max(
    0,
    sortedUpdates.length - displayedUpdates.length
  );

  return (
    <div
      className={`bg-surface group grid grid-cols-1 gap-5 md:grid-cols-2 md:items-stretch lg:gap-6 ${className}`}
    >
      {/* Left Column: Hero Image (aspect-video size preserved untouched) */}
      <Link
        href={articleHref}
        className='ring-career-stroke group/img relative block aspect-video w-full shrink-0 overflow-hidden rounded-[10px] ring'
      >
        {heroUrl ? (
          <Image
            src={heroUrl}
            alt={heroAlt}
            fill
            sizes='(max-width: 768px) 100vw, 50vw'
            className='object-cover duration-300 ease-in-out group-hover:scale-105'
            priority
          />
        ) : (
          <div className='bg-career-tint size-full' />
        )}
      </Link>

      {/* Right Column: Title + Mini Timeline (matches left image height exactly with bottom link pinned to bottom) */}
      <div className='flex min-w-0 flex-col justify-between md:h-full'>
        {/* Main Article Headline (live dot inline with text; text wraps naturally below dot) */}
        <Link
          href={articleHref}
          className='group/title block'
        >
          <h2 className='font-sans-guj text-career-dark group-hover/title:text-primary -mt-1 line-clamp-3 pt-1 pb-0.5 text-[20px] leading-[28px] font-bold tracking-normal transition-colors sm:text-[22px] md:text-[24px]'>
            {isLiveActive && (
              <LiveIndicatorDot
                size='sm'
                className='mr-2 ml-1 inline-flex align-middle'
              />
            )}
            <span>{news.title}</span>
          </h2>
        </Link>

        {/* Timeline updates list with real-time motion layout transitions (placed cleanly below headline without excess top gap) */}
        {displayedUpdates.length > 0 && (
          <div className='mt-2.5 flex min-w-0 flex-1 flex-col justify-start pt-1 pb-2 sm:mt-3 lg:pb-2.5'>
            <AnimatePresence initial={false}>
              {displayedUpdates.map((item, index) => {
                const isLatest = index === 0;
                const isLast = index === displayedUpdates.length - 1;
                const hasTail = isLast && remainingCount > 0;
                const isLiveNode = isLatest && isLiveActive;
                const { timePart, datePart } = formatTimelineTimestamp(
                  item.timestamp
                );

                return (
                  <motion.div
                    key={item.id || item.timestamp || `live-update-${index}`}
                    layout
                    initial={{ opacity: 0, y: -36, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{
                      opacity: 0,
                      y: -24,
                      scale: 0.96,
                      transition: { duration: 0.25, ease: 'easeInOut' },
                    }}
                    transition={{
                      layout: { type: 'spring', stiffness: 280, damping: 28 },
                      opacity: { duration: 0.35, ease: 'easeOut' },
                      y: { type: 'spring', stiffness: 280, damping: 28 },
                      scale: { duration: 0.3 },
                    }}
                    className='relative flex min-w-0 gap-3 transition-colors duration-200'
                  >
                    {/* Left node & connecting vertical line */}
                    <div className='relative flex w-4 shrink-0 flex-col items-center sm:w-4.5'>
                      {(!isLast || hasTail) && (
                        <div
                          className={`pointer-events-none absolute top-2.5 left-1/2 w-[2px] -translate-x-1/2 bg-[#DBDDFF] ${
                            hasTail ? 'bottom-0' : '-bottom-2'
                          }`}
                          aria-hidden='true'
                        />
                      )}

                      <div className='relative z-10 flex h-[19.2px] w-full items-center justify-center'>
                        {isLiveNode ? (
                          <div className='relative flex items-center justify-center'>
                            <span
                              className='animate-live-ripple-subtle pointer-events-none absolute inset-0 rounded-full bg-[#BD1C1C]/40'
                              aria-hidden='true'
                            />
                            <span
                              className='animate-live-ripple-subtle-delayed pointer-events-none absolute inset-0 rounded-full bg-[#BD1C1C]/25'
                              aria-hidden='true'
                            />
                            <span
                              className='relative z-10 h-3.5 w-3.5 shrink-0 rounded-full border-[3px] border-[#BD1C1C] bg-white ring-2 ring-white'
                              aria-label='Latest live update'
                            />
                          </div>
                        ) : (
                          <span
                            className='h-2.5 w-2.5 shrink-0 rounded-full bg-[#0C1175] ring-2 ring-white'
                            aria-label={
                              isLiveActive ? 'Live update' : 'News update'
                            }
                          />
                        )}
                      </div>
                    </div>

                    {/* Right text content */}
                    <div
                      className={`min-w-0 flex-1 ${isLast && !hasTail ? 'pb-0' : 'pb-2.5 lg:pb-3'}`}
                    >
                      {timePart && (
                        <p
                          className={`[font-family:var(--font-noto-sans),var(--font-noto-sans-guj),sans-serif] text-[12px] leading-[19.2px] tracking-normal ${
                            isLiveNode ? 'text-[#BD1C1C]' : 'text-[#313131]'
                          }`}
                        >
                          <span className='font-semibold'>{timePart}</span>
                          {datePart && (
                            <span className='font-normal'> · {datePart}</span>
                          )}
                        </p>
                      )}
                      <Link
                        href={`${articleHref}#live-update-${item.id || index}`}
                        className={`font-sans-guj mt-0.5 block truncate tracking-normal transition-colors ${
                          isLiveNode
                            ? 'text-[15px] leading-[21px] font-bold text-[#0B1AA8] hover:underline'
                            : 'text-[15px] leading-[18px] font-semibold text-[#313131] hover:text-[#0B1AA8]'
                        }`}
                      >
                        {item.headline}
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {displayedUpdates.length === 0 && news.summary && (
          <div className='mt-2.5 flex min-w-0 flex-1 flex-col justify-start pt-1 pb-2 sm:mt-3 lg:pb-2.5'>
            <p className='font-sans-guj text-career-dark line-clamp-4 text-sm leading-6 sm:text-base'>
              {news.summary}
            </p>
          </div>
        )}

        {/* More Update link shown ONLY when there are more than 3 updates */}
        {remainingCount > 0 && (
          <div className='mt-auto shrink-0'>
            <Link
              href={`${articleHref}#live-blog-timeline`}
              className='inline-block self-start text-xs font-semibold text-[#0C1175] underline transition-colors hover:text-[#0B1AA8] sm:text-sm'
            >
              <motion.span
                key={remainingCount}
                initial={{ opacity: 0, y: -2 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                {isLiveActive
                  ? `${remainingCount} More Live ${remainingCount === 1 ? 'Update' : 'Updates'}`
                  : `${remainingCount} More News ${remainingCount === 1 ? 'Update' : 'Updates'}`}
              </motion.span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ActiveLiveBlogLeadCard(
  props: ActiveLiveBlogLeadCardProps
) {
  const { news } = props;
  const initialIsLive = isLiveBlogActive(news);

  // Real-time SSE enabled without audio chime or popup notifications
  return (
    <LiveBlogRealtimeProvider
      articleId={String(news.id)}
      slug={news.slug ?? undefined}
      initialIsLiveBlog={initialIsLive}
      initialUpdates={(news.liveUpdates as LiveBlogUpdateItem[]) ?? []}
      initialStatus={initialIsLive ? 'active' : 'concluded'}
      disableChime
    >
      <ActiveLiveBlogLeadCardInner {...props} />
    </LiveBlogRealtimeProvider>
  );
}
