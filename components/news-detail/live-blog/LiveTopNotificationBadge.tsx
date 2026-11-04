'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { createPortal } from 'react-dom';

import { AnimatePresence, motion } from 'framer-motion';

import { useOptionalLiveBlogRealtime } from './LiveBlogRealtimeContext';

const emptySubscribe = () => () => {};
const AUTO_CLOSE_SECONDS = 10;
const RING_RADIUS = 11.5;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

interface NotificationCardProps {
  newUpdatesCount: number;
  categoryName?: string;
  latestHeadline: string;
  scrollToLatest?: () => void;
  onDismiss?: () => void;
}

function NotificationCard({
  categoryName = 'MARKET',
  latestHeadline,
  scrollToLatest,
  onDismiss,
}: NotificationCardProps) {
  const [timeLeft, setTimeLeft] = useState(AUTO_CLOSE_SECONDS);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-close countdown timer with reverse progress ring
  useEffect(() => {
    if (isPaused) return;

    if (timeLeft <= 0) {
      onDismiss?.();
      return;
    }

    const intervalMs = 100;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const next = Math.max(0, +(prev - intervalMs / 1000).toFixed(2));
        if (next <= 0) {
          clearInterval(timer);
          onDismiss?.();
          return 0;
        }
        return next;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPaused, timeLeft, onDismiss]);

  const progressPercent = Math.max(
    0,
    Math.min(100, (timeLeft / AUTO_CLOSE_SECONDS) * 100)
  );

  const strokeDashoffset = RING_CIRCUMFERENCE * (1 - progressPercent / 100);

  return (
    <motion.aside
      role='alert'
      aria-live='polite'
      translate='no'
      initial={{ opacity: 0, y: -24, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -16, scale: 0.94, transition: { duration: 0.2 } }}
      transition={{ type: 'spring', stiffness: 380, damping: 28 }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className='notranslate fixed top-20 right-4 z-[9999] w-[calc(100vw-32px)] max-w-[315px] select-none sm:right-6 sm:w-[325px] md:top-24'
    >
      <div
        onClick={scrollToLatest}
        className='group cursor-pointer overflow-hidden rounded-2xl bg-white shadow-[0_10px_30px_-4px_rgba(20,28,100,0.18),0_3px_12px_rgba(0,0,0,0.06)] transition-all duration-200 hover:shadow-[0_14px_34px_-4px_rgba(20,28,100,0.24)] sm:rounded-[18px]'
      >
        {/* Top Header Row */}
        <div className='flex items-center justify-between bg-white px-3.5 py-2.5 sm:px-4 sm:py-3'>
          {/* Left: Status Checkmark Icon & Title */}
          <div className='flex min-w-0 items-center gap-2.5 sm:gap-3'>
            <div className='flex h-7.5 w-7.5 shrink-0 items-center justify-center rounded-full bg-[#ECEEFE] sm:h-8 sm:w-8'>
              <svg
                className='h-4 w-4 text-[#0A1352]'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth={3}
                strokeLinecap='round'
                strokeLinejoin='round'
              >
                <polyline points='20 6 9 17 4 12' />
              </svg>
            </div>

            <h4 className='truncate text-[14px] font-bold tracking-tight text-[#1E293B] sm:text-[15px]'>
              New live update
            </h4>
          </div>

          {/* Right: Close Button with Turquoise Circular Progress Countdown Ring */}
          <div className='flex shrink-0 items-center pl-2'>
            <button
              type='button'
              onClick={(e) => {
                e.stopPropagation();
                onDismiss?.();
              }}
              aria-label='Close notification'
              className='group/btn relative flex h-6.5 w-6.5 shrink-0 items-center justify-center rounded-full transition-transform hover:scale-105 active:scale-95 sm:h-7 sm:w-7'
            >
              {/* Circular Progress SVG */}
              <svg
                className='absolute inset-0 h-full w-full -rotate-90'
                viewBox='0 0 28 28'
                fill='none'
              >
                {/* Background Ring */}
                <circle
                  cx='14'
                  cy='14'
                  r={RING_RADIUS}
                  stroke='#00F5D4'
                  strokeWidth={2.4}
                />
                {/* Animated Depleting Foreground Ring */}
                <circle
                  cx='14'
                  cy='14'
                  r={RING_RADIUS}
                  stroke='#0A1352'
                  strokeWidth={2.4}
                  strokeLinecap='round'
                  strokeDasharray={RING_CIRCUMFERENCE}
                  strokeDashoffset={strokeDashoffset}
                  className='transition-[stroke-dashoffset] duration-100 ease-linear'
                />
              </svg>

              {/* Centered Close "X" Icon */}
              <svg
                className='relative z-10 h-2.5 w-2.5 text-[#1E293B] transition-transform duration-150 group-hover/btn:scale-110 sm:h-3 sm:w-3'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
                strokeWidth={2.4}
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M6 18L18 6M6 6l12 12'
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Bottom Body Row: Category Tag + Headline */}
        <div className='bg-[#EEF1FD] px-3.5 pt-2.5 pb-3 transition-colors group-hover:bg-[#E8EDFD] sm:px-4 sm:pt-3 sm:pb-3.5'>
          {categoryName && (
            <div className='mb-0.5 text-[10px] font-extrabold tracking-wider text-[#0A1768] uppercase sm:text-[10.5px]'>
              {categoryName}
            </div>
          )}

          <p className='font-sans-guj line-clamp-2 text-[13px] leading-snug font-bold text-[#1E293B] sm:text-[13.5px]'>
            {latestHeadline}
          </p>
        </div>
      </div>
    </motion.aside>
  );
}

interface LiveTopNotificationBadgeProps {
  categoryName?: string;
}

export default function LiveTopNotificationBadge({
  categoryName = 'MARKET',
}: LiveTopNotificationBadgeProps) {
  const realtimeCtx = useOptionalLiveBlogRealtime();
  const originalTitleRef = useRef<string | null>(null);
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const newUpdatesCount = realtimeCtx?.newUpdatesCount ?? 0;
  const updates = realtimeCtx?.updates ?? [];
  const scrollToLatest = realtimeCtx?.scrollToLatest;
  const clearNewUpdatesCount = realtimeCtx?.clearNewUpdatesCount;

  const latestUpdate = updates.length > 0 ? updates[0] : null;
  const latestHeadline = latestUpdate?.headline || '';
  const currentUpdateId = latestUpdate?.id || '';

  const [dismissedUpdateId, setDismissedUpdateId] = useState<string | null>(
    null
  );

  const isDismissed =
    Boolean(dismissedUpdateId) && dismissedUpdateId === currentUpdateId;

  const handleDismiss = useCallback(() => {
    if (currentUpdateId) {
      setDismissedUpdateId(currentUpdateId);
    }
    clearNewUpdatesCount?.();
  }, [currentUpdateId, clearNewUpdatesCount]);

  const handleCardClick = useCallback(() => {
    scrollToLatest?.();
    if (currentUpdateId) {
      setDismissedUpdateId(currentUpdateId);
    }
    clearNewUpdatesCount?.();
  }, [scrollToLatest, currentUpdateId, clearNewUpdatesCount]);

  // Synchronize document title with notification count
  useEffect(() => {
    if (typeof document === 'undefined') return;

    if (!originalTitleRef.current) {
      originalTitleRef.current = document.title;
    }

    if (newUpdatesCount > 0) {
      const cleanOriginal = originalTitleRef.current.replace(
        /^\(\d+\)\s*🔴\s*/,
        ''
      );
      document.title = `(${newUpdatesCount}) 🔴 ${cleanOriginal}`;
    } else if (originalTitleRef.current) {
      document.title = originalTitleRef.current.replace(/^\(\d+\)\s*🔴\s*/, '');
    }

    return () => {
      if (originalTitleRef.current && typeof document !== 'undefined') {
        document.title = originalTitleRef.current.replace(
          /^\(\d+\)\s*🔴\s*/,
          ''
        );
      }
    };
  }, [newUpdatesCount]);

  const shouldShow =
    Boolean(latestUpdate) &&
    !isDismissed &&
    newUpdatesCount > 0 &&
    Boolean(currentUpdateId);

  // Gracefully dismiss on scroll only after the user has had at least 3 seconds to observe the toast
  useEffect(() => {
    if (!shouldShow) return;

    let allowScrollDismiss = false;
    const timer = setTimeout(() => {
      allowScrollDismiss = true;
    }, 3000);

    const onScroll = () => {
      if (!allowScrollDismiss) return;
      const timelineEl = document.getElementById('live-blog-timeline');
      if (timelineEl) {
        const rect = timelineEl.getBoundingClientRect();
        if (rect.top <= 140) {
          handleDismiss();
        }
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', onScroll);
    };
  }, [shouldShow, handleDismiss]);

  if (!realtimeCtx || !realtimeCtx.isLiveBlog || updates.length === 0) {
    return null;
  }

  if (!mounted || typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {shouldShow && (
        <NotificationCard
          key={`notification-card-${currentUpdateId}`}
          newUpdatesCount={newUpdatesCount}
          categoryName={categoryName}
          latestHeadline={latestHeadline}
          scrollToLatest={handleCardClick}
          onDismiss={handleDismiss}
        />
      )}
    </AnimatePresence>,
    document.body
  );
}
