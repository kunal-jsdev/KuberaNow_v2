import Image from 'next/image';
import Link from 'next/link';

import CardPreview from './CardPreview';
import type { VideoCardData } from './types';
import { buildVideoHref, getVideoThumbnail } from './utils';

type VideoPreviewCardProps = {
  video: VideoCardData;
  compact?: boolean;
};

/** Horizontal row used in the navbar preview panel, sized like NewsCard's. */
export default function VideoPreviewCard({
  video,
  compact = false,
}: VideoPreviewCardProps) {
  const thumbnail = getVideoThumbnail(video);

  return (
    <Link
      href={buildVideoHref(video.slug, video.video_id)}
      className={`group bg-surface border-career-stroke flex items-center overflow-hidden rounded-md border ${
        compact ? 'gap-2 p-2' : 'gap-3 p-2.5 xl:gap-4 xl:p-3.75'
      }`}
    >
      <div
        className={`ring-career-stroke bg-career-tint relative aspect-video shrink-0 overflow-hidden rounded-sm ring lg:rounded-md ${
          compact ? 'h-12' : 'h-18 xl:h-23'
        }`}
      >
        {thumbnail && (
          <Image
            src={thumbnail}
            alt={video.title}
            fill
            sizes='164px'
            className='object-cover transition-transform duration-300 ease-in-out group-hover:scale-110'
          />
        )}
        <CardPreview
          id={video.id}
          src={video.videoSource === 'upload' ? video.hlsUrl : null}
        />
      </div>

      <div
        className={`flex min-w-0 flex-1 flex-col items-start ${compact ? 'py-0.5' : 'py-1'}`}
      >
        <h6
          className={`text-career-dark group-hover:text-primary line-clamp-3 font-bold transition-colors ${
            compact ? 'text-xs leading-snug' : 'text-[20px] leading-6.75'
          }`}
        >
          {video.title}
        </h6>
      </div>
    </Link>
  );
}
