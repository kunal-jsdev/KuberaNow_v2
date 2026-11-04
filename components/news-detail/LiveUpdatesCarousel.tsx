'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { AnimatePresence, motion } from 'framer-motion';

import type { News } from '@/payload-types';

import { useOptionalLiveBlogRealtime } from './live-blog/LiveBlogRealtimeContext';

type LiveUpdateItem = NonNullable<News['liveUpdates']>[number];

interface LiveUpdatesCarouselProps {
  updates: LiveUpdateItem[];
  isLiveBlog?: boolean;
  status?: 'active' | 'concluded';
}

function formatLiveUpdateTimestamp(timestampStr?: string | null): {
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

export default function LiveUpdatesCarousel({
  updates,
  isLiveBlog: propIsLiveBlog,
  status = 'active',
}: LiveUpdatesCarouselProps) {
  const realtimeCtx = useOptionalLiveBlogRealtime();

  const effectiveUpdates = realtimeCtx?.updates ?? updates;
  const effectiveIsLive =
    realtimeCtx !== null && realtimeCtx !== undefined
      ? realtimeCtx.isLiveBlog
      : (propIsLiveBlog ?? status !== 'concluded');
  const effectiveStatus = effectiveIsLive ? 'active' : 'concluded';
  const newestUpdateId = realtimeCtx?.newestUpdateId ?? null;

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const prevCountRef = useRef<number>(0);
  const isInitialMountRef = useRef<boolean>(true);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const isPointerDownRef = useRef(false);
  const hasDraggedRef = useRef(false);
  const startXRef = useRef(0);
  const startScrollLeftRef = useRef(0);
  const lastXRef = useRef(0);
  const lastTimeRef = useRef(0);
  const velocityRef = useRef(0);
  const rafIdRef = useRef<number | null>(null);

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

  const checkScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollPrev(scrollLeft > 6);
    setCanScrollNext(scrollLeft < scrollWidth - clientWidth - 6);
  }, []);

  useEffect(() => {
    checkScroll();
    const el = scrollContainerRef.current;
    if (!el) return;

    window.addEventListener('resize', checkScroll);
    return () => {
      window.removeEventListener('resize', checkScroll);
    };
  }, [checkScroll, sortedUpdates]);

  useEffect(() => {
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      prevCountRef.current = sortedUpdates.length;
      return;
    }

    if (sortedUpdates.length > prevCountRef.current || newestUpdateId) {
      const el = scrollContainerRef.current;
      if (el) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      }
    }
    prevCountRef.current = sortedUpdates.length;
  }, [sortedUpdates.length, newestUpdateId]);

  const momentumScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    let currentVelocity = velocityRef.current * 16;
    currentVelocity = Math.max(Math.min(currentVelocity, 32), -32);

    const step = () => {
      if (!scrollContainerRef.current || Math.abs(currentVelocity) < 0.25) {
        rafIdRef.current = null;
        return;
      }

      scrollContainerRef.current.scrollLeft -= currentVelocity;
      currentVelocity *= 0.94;

      rafIdRef.current = requestAnimationFrame(step);
    };

    rafIdRef.current = requestAnimationFrame(step);
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'touch') return;
    if (e.button !== 0) return;

    const el = scrollContainerRef.current;
    if (!el) return;

    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }

    isPointerDownRef.current = true;
    hasDraggedRef.current = false;
    startXRef.current = e.clientX;
    startScrollLeftRef.current = el.scrollLeft;
    lastXRef.current = e.clientX;
    lastTimeRef.current = performance.now();
    velocityRef.current = 0;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPointerDownRef.current) return;
    const el = scrollContainerRef.current;
    if (!el) return;

    const dx = e.clientX - startXRef.current;
    if (!hasDraggedRef.current && Math.abs(dx) > 6) {
      hasDraggedRef.current = true;
      setIsDragging(true);
    }

    if (hasDraggedRef.current) {
      el.scrollLeft = startScrollLeftRef.current - dx;

      const now = performance.now();
      const dt = now - lastTimeRef.current;
      if (dt > 8) {
        velocityRef.current = (e.clientX - lastXRef.current) / dt;
        lastXRef.current = e.clientX;
        lastTimeRef.current = now;
      }
    }
  };

  const handlePointerUp = () => {
    if (!isPointerDownRef.current) return;
    isPointerDownRef.current = false;
    setIsDragging(false);

    if (hasDraggedRef.current) {
      setTimeout(() => {
        hasDraggedRef.current = false;
      }, 100);

      momentumScroll();
    }
  };

  useEffect(() => {
    const onWindowPointerUp = () => {
      if (isPointerDownRef.current) {
        isPointerDownRef.current = false;
        setIsDragging(false);

        if (hasDraggedRef.current) {
          setTimeout(() => {
            hasDraggedRef.current = false;
          }, 100);

          momentumScroll();
        }
      }
    };

    const onWindowPointerMove = (e: PointerEvent) => {
      if (!isPointerDownRef.current || !hasDraggedRef.current) return;
      const el = scrollContainerRef.current;
      if (!el) return;

      const dx = e.clientX - startXRef.current;
      el.scrollLeft = startScrollLeftRef.current - dx;

      const now = performance.now();
      const dt = now - lastTimeRef.current;
      if (dt > 8) {
        velocityRef.current = (e.clientX - lastXRef.current) / dt;
        lastXRef.current = e.clientX;
        lastTimeRef.current = now;
      }
    };

    window.addEventListener('pointerup', onWindowPointerUp);
    window.addEventListener('pointermove', onWindowPointerMove);

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
      window.removeEventListener('pointerup', onWindowPointerUp);
      window.removeEventListener('pointermove', onWindowPointerMove);
    };
  }, [momentumScroll]);

  const handleScroll = (direction: 'prev' | 'next') => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const scrollAmount = Math.max(el.clientWidth * 0.75, 260);
    el.scrollBy({
      left: direction === 'next' ? scrollAmount : -scrollAmount,
      behavior: 'smooth',
    });
  };

  const handleUpdateClick = (id?: string | null, index?: number) => {
    if (hasDraggedRef.current) return;

    let targetEl = id ? document.getElementById(`live-update-${id}`) : null;
    if (!targetEl && typeof index === 'number') {
      targetEl = document.getElementById(`live-update-${index}`);
    }
    if (!targetEl && id) {
      targetEl = document.querySelector(`[data-live-id="${id}"]`);
    }
    if (!targetEl && typeof index === 'number') {
      targetEl = document.querySelector(`[data-live-index="${index}"]`);
    }
    if (!targetEl) return;

    document.querySelectorAll('.timeline-item-highlight').forEach((el) => {
      el.classList.remove('timeline-item-highlight');
    });

    const header = document.querySelector('header');
    const headerHeight = header ? header.getBoundingClientRect().height : 80;

    const targetRect = targetEl.getBoundingClientRect();
    const elementCenter =
      targetRect.top + window.scrollY + targetRect.height / 2;
    const visibleViewportHeight = window.innerHeight - headerHeight;
    const targetScrollY =
      elementCenter - headerHeight - visibleViewportHeight / 2;

    window.scrollTo({
      top: Math.max(0, targetScrollY),
      behavior: 'smooth',
    });

    void targetEl.offsetWidth;
    targetEl.classList.add('timeline-item-highlight');
    setTimeout(() => {
      targetEl.classList.remove('timeline-item-highlight');
    }, 2400);
  };

  if (sortedUpdates.length === 0) return null;

  return (
    <section
      id='live-updates-carousel'
      aria-label='Live Updates Timeline'
      className='mt-3 mb-6 flex w-full flex-col gap-4 rounded-[10px] border border-[#DADCFF] bg-[#EFEFFF] p-[15px] md:mt-4 md:mb-8'
    >
      <div className='flex h-5 items-center justify-between gap-4'>
        <h2 className='[font-family:var(--font-noto-sans),var(--font-noto-sans-guj),sans-serif] text-base leading-5 font-bold tracking-normal text-[#010874]'>
          {effectiveIsLive ? 'Live Updates' : 'News Updates'}
        </h2>

        <div className='flex items-center gap-2'>
          <button
            type='button'
            onClick={() => handleScroll('prev')}
            disabled={!canScrollPrev}
            aria-label='Previous updates'
            className='flex size-5 items-center justify-center rounded-full bg-white text-black shadow-[0px_0px_3px_0px_rgba(153,153,153,0.8)] transition-[transform,opacity,background-color] hover:bg-[linear-gradient(90deg,#1A20C3_45%,#0E1382_100%)] hover:text-white active:scale-95 disabled:pointer-events-none disabled:opacity-35 md:size-6 md:shadow-[0px_0px_6px_0px_rgba(153,153,153,0.8)]'
          >
            <svg
              className='size-3.5 md:size-4'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2.6'
              strokeLinecap='round'
              strokeLinejoin='round'
            >
              <polyline points='15 18 9 12 15 6' />
            </svg>
          </button>

          <button
            type='button'
            onClick={() => handleScroll('next')}
            disabled={!canScrollNext}
            aria-label='Next updates'
            className='flex size-5 items-center justify-center rounded-full bg-white text-black shadow-[0px_0px_3px_0px_rgba(153,153,153,0.8)] transition-[transform,opacity,background-color] hover:bg-[linear-gradient(90deg,#1A20C3_45%,#0E1382_100%)] hover:text-white active:scale-95 disabled:pointer-events-none disabled:opacity-35 md:size-6 md:shadow-[0px_0px_6px_0px_rgba(153,153,153,0.8)]'
          >
            <svg
              className='size-3.5 md:size-4'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2.6'
              strokeLinecap='round'
              strokeLinejoin='round'
            >
              <polyline points='9 18 15 12 9 6' />
            </svg>
          </button>
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        onScroll={checkScroll}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={`-mx-[15px] -mt-[13px] flex touch-pan-x [scrollbar-width:none] gap-6 overflow-x-auto px-[15px] pt-[13px] sm:gap-7 md:gap-8 [&::-webkit-scrollbar]:hidden ${
          isDragging ? 'cursor-grabbing select-none' : ''
        }`}
      >
        <AnimatePresence initial={false}>
          {sortedUpdates.map((item, index) => {
            const isLatest = index === 0;
            const isLast = index === sortedUpdates.length - 1;
            const isLiveActive = isLatest && effectiveStatus !== 'concluded';
            const isNewlyArrived =
              Boolean(item.id) && item.id === newestUpdateId;
            let timeColor = 'text-[#6E6E6E]';
            if (isLiveActive) timeColor = 'text-[#C8141B] md:text-[#BD1C1C]';
            else if (effectiveIsLive) timeColor = 'text-[#313131]';
            const { timePart, datePart } = formatLiveUpdateTimestamp(
              item.timestamp
            );

            return (
              <motion.div
                key={item.id || item.timestamp || `carousel-item-${index}`}
                layout
                initial={{ opacity: 0, x: -50, scale: 0.94 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{
                  opacity: 0,
                  x: 40,
                  scale: 0.9,
                  transition: { duration: 0.25, ease: 'easeInOut' },
                }}
                transition={{
                  layout: { type: 'spring', stiffness: 280, damping: 28 },
                  opacity: { duration: 0.35, ease: 'easeOut' },
                  x: { type: 'spring', stiffness: 280, damping: 28 },
                  scale: { duration: 0.3 },
                }}
                onClick={() => handleUpdateClick(item.id, index)}
                className='group relative flex w-[130px] shrink-0 cursor-pointer flex-col select-none sm:w-[250px] md:w-[270px] lg:w-[calc(25%-20px)]'
              >
                <div className='relative mb-2 flex h-6 items-center'>
                  {!isLast && (
                    <div className='pointer-events-none absolute top-1/2 right-[-24px] left-[10px] -translate-y-1/2 border-t-2 border-dotted border-[#8FAEF5] sm:right-[-28px] md:right-[-32px]' />
                  )}

                  <div className='relative z-10 flex h-5 w-5 shrink-0 items-center justify-center'>
                    {isLiveActive && (
                      <>
                        <span
                          className='animate-live-ripple pointer-events-none absolute inset-0 rounded-full bg-[#BD1C1C]/35'
                          aria-hidden='true'
                        />
                        <span
                          className='animate-live-ripple-delayed pointer-events-none absolute inset-0 rounded-full bg-[#BD1C1C]/25'
                          aria-hidden='true'
                        />
                      </>
                    )}

                    <div
                      className={`relative z-10 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white transition-transform duration-200 group-hover:scale-110 ${
                        isLiveActive
                          ? 'border-2 border-[#BD1C1C]'
                          : 'border-2 border-[#0B1AA8]'
                      }`}
                    >
                      <div
                        className={`h-2 w-2 rounded-full transition-transform duration-200 ${
                          isLiveActive ? 'bg-[#BD1C1C]' : 'bg-[#0B1AA8]'
                        }`}
                      />
                    </div>
                  </div>

                  {isNewlyArrived && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className='relative z-10 ml-2.5 inline-flex items-center gap-1 rounded bg-red-600 px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-white uppercase shadow-2xs'
                    >
                      New
                    </motion.span>
                  )}
                </div>

                <time
                  dateTime={item.timestamp}
                  className='block [font-family:var(--font-noto-sans),var(--font-noto-sans-guj),sans-serif] text-[10px] leading-[14px] tracking-normal md:text-[12px] md:leading-[19.2px]'
                >
                  <span className={`font-bold md:font-semibold ${timeColor}`}>
                    {timePart}
                    {datePart && ' · '}
                  </span>
                  {datePart && (
                    <span className={`font-normal ${timeColor}`}>
                      {datePart}
                    </span>
                  )}
                </time>

                <h3
                  className={`font-sans-guj mt-1 truncate text-[12px] leading-4 font-semibold tracking-normal transition-colors md:text-[14px] md:leading-[21px] md:font-bold ${
                    isLiveActive
                      ? 'text-[#0B1AA8] group-hover:text-[#081580]'
                      : 'text-[#111827] group-hover:text-[#0B1AA8] md:text-[#313131]'
                  }`}
                >
                  {item.headline}
                </h3>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </section>
  );
}
