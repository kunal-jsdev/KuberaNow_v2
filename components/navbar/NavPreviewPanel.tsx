import { FaChevronRight } from 'react-icons/fa';

import Link from 'next/link';

import type { VideoCardData } from '@/components/videos/types';
import VideoPreviewCard from '@/components/videos/VideoPreviewCard';
import { VideoPreviewProvider } from '@/components/videos/VideoPreviewContext';
import type { NewsCardItem } from '@/Payload/lib/utilities/getNewsByCategory';

import NewsCard from '../news/NewsCard';

type NavPreviewPanelProps = {
  label: string;
  href: string;
  items: readonly NewsCardItem[];
  /** When set, the panel previews these videos instead of `items`. */
  videos?: readonly VideoCardData[];
  className?: string;
  widthClassName?: string;
  parentLabel?: string;
  onBack?: () => void;
};

const DEFAULT_WIDTH_CLASSNAME =
  'w-[calc(100vw-2rem)] sm:w-[748px] xl:w-[938px]';
const PREVIEW_SLOT_COUNT = 4;
function BlankPreviewCard({
  compact = false,
  emptyLabel = 'No articles yet',
}: {
  compact?: boolean;
  emptyLabel?: string;
}) {
  const outerClassName = compact
    ? 'border-career-stroke items-center gap-2 border p-2'
    : 'border-career-stroke items-center gap-3 border p-2.5 xl:gap-4 xl:p-3.75';
  const thumbClassName = compact
    ? 'h-12 w-12 shrink-0'
    : 'h-18 w-18 shrink-0 xl:h-23 xl:w-23';
  const textClassName = compact ? 'text-xs' : 'text-[20px] leading-[27px]';

  return (
    <div
      className={`bg-surface flex overflow-hidden rounded-md ${outerClassName}`}
    >
      <div
        className={`ring-career-stroke relative overflow-hidden rounded-sm ring lg:rounded-md ${thumbClassName}`}
      >
        <div className='bg-career-tint size-full' />
      </div>
      <div
        className={`flex min-w-0 flex-1 items-center ${compact ? 'py-0.5' : 'py-1'}`}
      >
        <p className={`text-text-disclaimer font-medium ${textClassName}`}>
          {emptyLabel}
        </p>
      </div>
    </div>
  );
}

export function NavPreviewPanel({
  label,
  href,
  items,
  videos,
  className = '',
  widthClassName = DEFAULT_WIDTH_CLASSNAME,
  parentLabel,
  onBack,
}: NavPreviewPanelProps) {
  const emptyLabel = videos ? 'No videos yet' : undefined;

  const renderSlot = (index: number, compact: boolean) => {
    if (videos) {
      const video = videos[index];
      return video ? (
        <VideoPreviewCard
          video={video}
          compact={compact}
        />
      ) : (
        <BlankPreviewCard
          compact={compact}
          emptyLabel={emptyLabel}
        />
      );
    }

    const item = items[index];
    if (!item) return <BlankPreviewCard compact={compact} />;
    return compact ? (
      <NewsCard
        news={item}
        orientation='horizontal'
        compact
      />
    ) : (
      <NewsCard
        news={item}
        orientation='horizontal'
        squareThumb
      />
    );
  };

  const firstPlayableId =
    videos
      ?.slice(0, PREVIEW_SLOT_COUNT)
      .find((video) => video.videoSource === 'upload' && video.hlsUrl)?.id ??
    null;

  const grid = (
    <div className='grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-4'>
      {Array.from({ length: PREVIEW_SLOT_COUNT }, (_, index) => {
        const id = (videos ? videos[index] : items[index])?.id;
        return (
          <div key={id ?? `blank-${index}`}>
            <div className='sm:hidden'>{renderSlot(index, true)}</div>
            <div className='hidden sm:block'>{renderSlot(index, false)}</div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div
      className={`rounded-lg border border-gray-100 bg-white p-3 text-gray-800 shadow-2xl sm:p-4 ${widthClassName} ${className}`}
    >
      {parentLabel && onBack ? (
        <div className='text-primary-navy mb-3 flex w-fit items-center gap-1.5 text-sm font-bold sm:mb-4 sm:text-base'>
          <button
            type='button'
            onClick={onBack}
            className='hover:text-cyan-blue flex cursor-pointer items-center gap-1 text-gray-500 transition-colors hover:underline sm:hidden'
            aria-label={`Back to ${parentLabel}`}
          >
            <span>{parentLabel}</span>
          </button>
          <FaChevronRight className='h-2.5 w-2.5 shrink-0 text-gray-400 sm:hidden' />
          <Link
            href={href}
            className='group flex items-center gap-1'
          >
            <span className='group-hover:underline'>{label}</span>
            <span className='relative inline-block h-2.5 w-2.5'>
              <FaChevronRight className='absolute inset-0 h-2.5 w-2.5' />
              <FaChevronRight
                aria-hidden='true'
                className='nav-arrow-ghost pointer-events-none absolute inset-0 h-2.5 w-2.5'
              />
            </span>
          </Link>
        </div>
      ) : (
        <Link
          href={href}
          className='text-primary-navy group mb-3 flex w-fit items-center gap-1 text-sm font-bold sm:mb-4 sm:text-base'
        >
          <span className='group-hover:underline'>{label}</span>
          <span className='relative inline-block h-2.5 w-2.5'>
            <FaChevronRight className='absolute inset-0 h-2.5 w-2.5' />
            <FaChevronRight
              aria-hidden='true'
              className='nav-arrow-ghost pointer-events-none absolute inset-0 h-2.5 w-2.5'
            />
          </span>
        </Link>
      )}

      {videos ? (
        // Same hover previews as /videos: the first playable video previews
        // while the panel is open, a hovered one takes over.
        <VideoPreviewProvider initialActiveId={firstPlayableId}>
          {grid}
        </VideoPreviewProvider>
      ) : (
        grid
      )}
    </div>
  );
}
