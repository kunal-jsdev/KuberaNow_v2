'use client';

import { useMemo } from 'react';

import { AnimatePresence, motion } from 'framer-motion';

import type { News } from '@/payload-types';

import { useOptionalLiveBlogRealtime } from './live-blog/LiveBlogRealtimeContext';
import LiveRichText from './live-blog/LiveRichText';
import LiveIndicatorDot from './LiveIndicatorDot';

type LiveBlogTimelineProps = {
  updates?: News['liveUpdates'];
  isLiveBlog?: boolean;
  status?: 'active' | 'concluded';
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

export default function LiveBlogTimeline({
  updates: propUpdates,
  isLiveBlog: propIsLiveBlog,
  status: propStatus,
  className = '',
}: LiveBlogTimelineProps) {
  const realtimeCtx = useOptionalLiveBlogRealtime();

  const effectiveUpdates = realtimeCtx?.updates ?? propUpdates;
  const effectiveIsLive =
    realtimeCtx !== null && realtimeCtx !== undefined
      ? realtimeCtx.isLiveBlog
      : (propIsLiveBlog ?? propStatus !== 'concluded');
  const isLiveActive = effectiveIsLive;
  const newestUpdateId = realtimeCtx?.newestUpdateId ?? null;

  const sortedUpdates = useMemo(() => {
    if (!Array.isArray(effectiveUpdates)) return [];
    return [...effectiveUpdates].sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return (
        (Number.isNaN(timeB) ? 0 : timeB) - (Number.isNaN(timeA) ? 0 : timeA)
      );
    });
  }, [effectiveUpdates]);

  if (sortedUpdates.length === 0) return null;

  return (
    <section
      id='live-blog-timeline'
      aria-label='Live Blog Timeline'
      className={`my-4 w-full scroll-mt-20 md:my-6 ${className}`}
    >
      <div className='mb-3.5 flex items-center justify-between sm:mb-4'>
        <h2 className='flex items-center gap-2 [font-family:var(--font-noto-sans),var(--font-noto-sans-guj),sans-serif] text-base leading-5 font-bold tracking-normal text-[#010874] sm:text-lg sm:leading-[22px]'>
          {isLiveActive && <LiveIndicatorDot size='sm' />}
          <span>Timeline</span>
        </h2>

        <span
          className='notranslate [font-family:var(--font-noto-sans),var(--font-noto-sans-guj),sans-serif] text-xs leading-4 font-semibold tracking-normal text-[#111827] sm:text-sm sm:leading-[22px] sm:font-medium'
          translate='no'
        >
          {sortedUpdates.length}{' '}
          {sortedUpdates.length === 1 ? 'Update' : 'Updates'}
        </span>
      </div>

      <div className='flex flex-col'>
        <AnimatePresence initial={false}>
          {sortedUpdates.map((item, index) => {
            const isLatest = index === 0;
            const isLast = index === sortedUpdates.length - 1;
            const isLiveNode = isLatest && isLiveActive;
            const isNewlyArrived =
              Boolean(item.id) && item.id === newestUpdateId;
            const { timePart, datePart } = formatTimelineTimestamp(
              item.timestamp
            );
            const targetId = item.id
              ? `live-update-${item.id}`
              : `live-update-${index}`;

            return (
              <motion.article
                key={item.id || item.timestamp || `timeline-item-${index}`}
                id={targetId}
                data-live-id={item.id || undefined}
                data-live-index={index}
                initial={{ opacity: 0, y: -28 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{
                  opacity: 0,
                  y: -20,
                  transition: { duration: 0.2, ease: 'easeInOut' },
                }}
                transition={{
                  opacity: { duration: 0.3, ease: 'easeOut' },
                  y: { type: 'spring', stiffness: 280, damping: 28 },
                }}
                className='group relative -mx-2 flex scroll-mt-24 gap-3 rounded-[10px] px-2 py-1 transition-colors duration-200 hover:bg-slate-50/60 sm:-mx-2.5 sm:scroll-mt-28 sm:gap-4 sm:px-2.5 sm:py-1'
              >
                <div className='relative flex w-4 shrink-0 flex-col items-center sm:w-4.5'>
                  {!isLast && (
                    <div
                      className='pointer-events-none absolute top-2.5 -bottom-2.5 left-1/2 w-[2px] -translate-x-1/2 bg-[#DBDDFF]'
                      aria-hidden='true'
                    />
                  )}

                  <div className='relative z-10 flex h-5 w-full items-center justify-center'>
                    {isLiveNode ? (
                      <div className='relative flex items-center justify-center'>
                        <span
                          className='animate-live-ripple pointer-events-none absolute inset-0 rounded-full bg-[#BD1C1C]/35'
                          aria-hidden='true'
                        />
                        <span
                          className='animate-live-ripple-delayed pointer-events-none absolute inset-0 rounded-full bg-[#BD1C1C]/25'
                          aria-hidden='true'
                        />
                        <div
                          className='relative z-10 h-4 w-4 rounded-full border-[3px] border-[#C8141B] bg-white shadow-xs transition-transform duration-200 group-hover:scale-110 sm:size-[18px] sm:border-4'
                          aria-label='Active Live Update'
                        />
                      </div>
                    ) : (
                      <div
                        className='h-3 w-3 rounded-full bg-[#0C1175] shadow-xs transition-transform duration-200 group-hover:scale-110'
                        aria-label='Past Milestone'
                      />
                    )}
                  </div>
                </div>

                <div className='min-w-0 flex-1 pt-0 pb-3 group-last:pb-0 sm:pb-3.5 sm:group-last:pb-0'>
                  <div className='flex items-center gap-2'>
                    <time
                      dateTime={item.timestamp}
                      translate='no'
                      className='notranslate flex h-5 items-center [font-family:var(--font-noto-sans),var(--font-noto-sans-guj),sans-serif] tracking-normal'
                    >
                      <span
                        className={`text-xs leading-normal font-semibold sm:text-[13px] md:text-sm md:leading-[18px] ${
                          isLiveNode ? 'text-[#313131]' : 'text-[#6E6E6E]'
                        }`}
                      >
                        {timePart}
                      </span>
                      {datePart && (
                        <>
                          <span className='mx-2 text-xs leading-4 font-normal text-[#6E6E6E]'>
                            ·
                          </span>
                          <span className='text-xs leading-4 font-normal text-[#6E6E6E]'>
                            {datePart}
                          </span>
                        </>
                      )}
                    </time>

                    {isNewlyArrived && (
                      <span className='inline-flex items-center rounded bg-red-600 px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-white uppercase shadow-2xs'>
                        New
                      </span>
                    )}
                  </div>

                  <h3 className='mt-1.5 [font-family:var(--font-noto-sans),var(--font-noto-sans-guj),sans-serif] text-base leading-snug font-bold tracking-normal text-[#313131] sm:text-lg md:text-[22px] md:leading-7'>
                    {item.headline}
                  </h3>

                  {item.content && (
                    <div
                      className={`news-detail-content [&_a]:text-content-link mt-2 [font-family:var(--font-noto-sans),var(--font-noto-sans-guj),sans-serif] text-sm leading-relaxed sm:text-base md:leading-[22px] [&_a]:font-semibold [&_a]:underline [&_a]:decoration-dotted [&_a]:underline-offset-[0.17em] [&_li]:my-0.5 [&_p]:my-1.5 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0 [&_ul]:my-1.5 ${
                        isLiveNode
                          ? 'text-[#313131] [&_li]:text-[#313131] [&_p]:text-[#313131]'
                          : 'text-[#6C7280] [&_li]:text-[#6C7280] [&_p]:text-[#6C7280]'
                      }`}
                    >
                      <LiveRichText
                        data={item.content}
                        enableGutter={false}
                        enableProse={false}
                      />
                    </div>
                  )}
                </div>
              </motion.article>
            );
          })}
        </AnimatePresence>
      </div>
    </section>
  );
}
