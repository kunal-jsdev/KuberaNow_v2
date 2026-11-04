import Image from 'next/image';
import Link from 'next/link';

import CardPreview from './CardPreview';
import type { VideoCardData } from './types';
import {
  buildShortsHref,
  getVideoCategorySlug,
  getVideoCategoryTitle,
  getVideoThumbnail,
} from './utils';
import VideoCategoryChip from './VideoCategoryChip';

type ShortsCardProps = {
  video: VideoCardData;
};

/**
 * Figma "Shorts" (290×516 on web): 1px #DADCFF border, 4px radius, navy fade
 * from 79.457%. Text block is 8px × 16px on desktop, 4px × 8px below lg.
 */
export default function ShortsCard({ video }: ShortsCardProps) {
  const thumbnail = getVideoThumbnail(video);
  const categoryTitle = getVideoCategoryTitle(video);
  const categorySlug = getVideoCategorySlug(video);

  return (
    <Link
      href={buildShortsHref(video.slug, video.video_id)}
      className='group border-career-stroke bg-career-tint relative flex aspect-290/516 w-full flex-col justify-end overflow-hidden rounded border'
    >
      {thumbnail && (
        <Image
          src={thumbnail}
          alt={video.title}
          fill
          sizes='(max-width: 768px) 50vw, 290px'
          className='object-cover'
        />
      )}
      <CardPreview
        id={video.id}
        src={video.videoSource === 'upload' ? video.hlsUrl : null}
        showPlayButton={false}
      />
      {/* Exact Figma stops; Tailwind's default oklab blend renders greyer. */}
      <div
        className='absolute inset-0 bg-[linear-gradient(180deg,rgba(1,8,116,0)_79.457%,#010874_100%)]'
        aria-hidden
      />

      <div className='relative flex w-full flex-col items-start gap-1 px-2.5 pt-2 pb-2.5 sm:px-3 sm:pt-2.5 sm:pb-3 lg:px-4 lg:pt-3 lg:pb-3.5'>
        {categoryTitle && (
          <VideoCategoryChip
            title={categoryTitle}
            slug={categorySlug}
          />
        )}
        <h3 className='font-sans-guj line-clamp-2 w-full pt-1 text-xs leading-normal font-semibold wrap-anywhere text-white sm:text-sm sm:leading-snug lg:text-base lg:leading-snug lg:font-bold'>
          {video.title}
        </h3>
      </div>
    </Link>
  );
}
