import type { CardSkeletonProps } from './types';

export function CardSkeleton({ count = 4, className }: CardSkeletonProps) {
  return (
    <div
      className={`sm:border-career-stroke ring-career-stroke grid grid-cols-2 gap-3.75 rounded-md p-3 ring sm:gap-5 sm:border sm:p-5 lg:grid-cols-4 ${className ?? ''}`}
    >
      {Array.from({ length: count }, (_, i) => `skeleton-${i}`).map((id) => (
        <div
          key={id}
          className='flex flex-col gap-3'
        >
          <div className='border-career-stroke relative aspect-video w-full overflow-hidden rounded border sm:rounded-[5px]'>
            <div className='absolute inset-0 animate-pulse bg-linear-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] dark:from-gray-700 dark:via-gray-600 dark:to-gray-700' />
          </div>
          <div className='flex flex-col gap-2'>
            <div className='h-4 w-16 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700' />
            <div className='h-3.5 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700' />
            <div className='h-3.5 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700' />
          </div>
        </div>
      ))}
    </div>
  );
}
