import type { ReactNode } from 'react';
import { FaChevronRight } from 'react-icons/fa';

import { FEED_SECTION_SIZE } from '@/constants/newsFeed';
import type { NewsFeedStatus } from '@/hooks/useNewsFeed';

type FeedLoadMoreProps = {
  status: NewsFeedStatus;
  isLoading: boolean;
  onLoadMore: () => void;
  onRetry: () => void;
  /** Extra grid classes so the skeleton matches the feed's column layout. */
  skeletonGridClassName?: string;
};

const ERROR_COPY = {
  error: {
    title: "Couldn't load more",
    message: 'Something went wrong. Try again.',
  },
  offline: {
    title: "You're offline",
    message: 'Check your internet connection & try again.',
  },
} as const;

const iconTileClassName =
  'flex size-10 shrink-0 items-center justify-center rounded-md sm:size-11';

const primaryButtonClassName =
  'from-dark-navy2 to-primary-navy flex shrink-0 cursor-pointer items-center gap-1.5 rounded-md bg-linear-to-r px-4 py-2.5 font-sans text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 sm:px-5 sm:text-base';

function StatusBanner({
  icon,
  tone = 'info',
  children,
  action,
}: {
  icon: ReactNode;
  tone?: 'info' | 'error';
  children: ReactNode;
  action?: ReactNode;
}) {
  const isError = tone === 'error';

  return (
    <div
      role={isError ? 'alert' : 'status'}
      className={`flex w-full items-center gap-3 rounded-lg border px-3.5 py-3 sm:gap-4 sm:px-4 ${
        isError
          ? 'border-error-border bg-error-bg'
          : 'border-divider bg-career-tint'
      }`}
    >
      <span
        className={`${iconTileClassName} ${isError ? 'bg-error' : 'bg-dark-navy1'}`}
      >
        {icon}
      </span>
      <div className='min-w-0 flex-1 font-sans'>{children}</div>
      {action}
    </div>
  );
}

function FeedSkeleton({ gridClassName = '' }: { gridClassName?: string }) {
  return (
    <div
      aria-hidden='true'
      className='border-divider bg-surface w-full rounded-lg border p-3 sm:p-5'
    >
      <div
        className={`grid grid-cols-2 gap-x-3.75 gap-y-6 [mask-image:linear-gradient(to_bottom,black_55%,transparent)] sm:gap-x-5 sm:gap-y-8 lg:grid-cols-4 ${gridClassName}`}
      >
        {Array.from({ length: FEED_SECTION_SIZE }, (_, i) => (
          <div
            key={`feed-skeleton-${i}`}
            className='flex animate-pulse flex-col'
          >
            <div className='bg-skeleton aspect-video w-full rounded-md' />
            <div className='bg-skeleton mt-3 h-4 w-14 rounded-md' />
            <div className='mt-2.5 flex flex-col gap-2'>
              <div className='bg-skeleton h-3 w-full rounded-full' />
              <div className='bg-skeleton h-3 w-full rounded-full' />
              <div className='bg-skeleton h-3 w-[70%] rounded-full' />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SpinnerIcon() {
  return (
    <span
      aria-hidden='true'
      className='feed-spinner size-4 shrink-0 animate-spin rounded-full'
    />
  );
}

function CheckCircleIcon() {
  return (
    <svg
      aria-hidden='true'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth={1.5}
      strokeLinecap='round'
      strokeLinejoin='round'
      className='size-6 text-white'
    >
      <circle
        cx='12'
        cy='12'
        r='9'
      />
      <path d='m8.5 12.25 2.25 2.25 4.75-4.75' />
    </svg>
  );
}

function XCircleIcon() {
  return (
    <svg
      aria-hidden='true'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth={1.5}
      strokeLinecap='round'
      className='size-6 text-white'
    >
      <circle
        cx='12'
        cy='12'
        r='9'
      />
      <path d='m9.5 9.5 5 5m0-5-5 5' />
    </svg>
  );
}

/** Same gliding arrow as the header category links (see NavPreviewPanel). */
function GlideArrowIcon() {
  return (
    <span
      aria-hidden='true'
      className='relative inline-block h-2.5 w-2.5'
    >
      <FaChevronRight className='absolute inset-0 h-2.5 w-2.5' />
      <FaChevronRight className='nav-arrow-ghost pointer-events-none absolute inset-0 h-2.5 w-2.5' />
    </span>
  );
}

function RefreshIcon() {
  return (
    <svg
      aria-hidden='true'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth={2.25}
      strokeLinecap='round'
      strokeLinejoin='round'
      className='size-4'
    >
      <path d='M20 12a8 8 0 1 1-2.34-5.66' />
      <path d='M20 4v4.5h-4.5' />
    </svg>
  );
}

/** Bottom of a batched news feed: Load More button, loading skeleton, error + retry, end banner when done. */
export function FeedLoadMore({
  status,
  isLoading,
  onLoadMore,
  onRetry,
  skeletonGridClassName,
}: FeedLoadMoreProps) {
  if (status === 'more') {
    return (
      <div className='flex w-full justify-center'>
        <button
          type='button'
          onClick={onLoadMore}
          className='flex cursor-pointer items-center justify-center gap-1 rounded-md bg-linear-to-r from-[#170170] to-[#2c00c8] px-3 py-2.25 text-center align-middle font-sans text-sm leading-4.5 font-semibold tracking-normal text-white/90 transition-opacity hover:opacity-90'
        >
          Load More
          <GlideArrowIcon />
        </button>
      </div>
    );
  }

  if (status === 'loading') {
    return (
      <div className='flex w-full flex-col gap-5'>
        <div
          role='status'
          className='border-divider bg-career-tint flex w-full items-center justify-center gap-2.5 rounded-lg border px-4 py-3.5'
        >
          <SpinnerIcon />
          <p className='text-dark-navy1 font-sans text-sm font-semibold'>
            Loading More
          </p>
        </div>
        <FeedSkeleton gridClassName={skeletonGridClassName} />
      </div>
    );
  }

  if (status === 'error' || status === 'offline') {
    const { title, message } = ERROR_COPY[status];
    return (
      <div className='flex w-full flex-col gap-5'>
        <StatusBanner
          tone='error'
          icon={<XCircleIcon />}
          action={
            <button
              type='button'
              onClick={onRetry}
              disabled={isLoading}
              className={primaryButtonClassName}
            >
              <RefreshIcon />
              Retry
            </button>
          }
        >
          <p className='text-dark-navy1 text-base font-bold sm:text-lg'>
            {title}
          </p>
          <p className='text-error-text text-xs sm:text-sm'>{message}</p>
        </StatusBanner>
        <FeedSkeleton gridClassName={skeletonGridClassName} />
      </div>
    );
  }

  if (status === 'done') {
    return (
      <StatusBanner icon={<CheckCircleIcon />}>
        <p className='text-dark-navy1 text-sm font-semibold sm:text-base'>
          You&apos;re all caught up!
        </p>
      </StatusBanner>
    );
  }

  return null;
}
