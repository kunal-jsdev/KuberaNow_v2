import Image from 'next/image';
import Link from 'next/link';

import CardPreview from './CardPreview';
import type { VideoCardData } from './types';
import {
  buildVideoHref,
  getVideoCategorySlug,
  getVideoCategoryTitle,
  getVideoThumbnail,
} from './utils';
import VideoCategoryChip from './VideoCategoryChip';

type VideoCardProps = {
  video: VideoCardData;
  priority?: boolean;
};

/**
 * Figma "Video Story" (290 wide): 290×164 thumbnail with a 1px #DADCFF border
 * and 6px radius, 8px gap, then chip + 4px gap + 18px/22px bold title.
 */
export default function VideoCard({ video, priority = false }: VideoCardProps) {
  const thumbnail = getVideoThumbnail(video);
  const categoryTitle = getVideoCategoryTitle(video);
  const categorySlug = getVideoCategorySlug(video);

  return (
    <Link
      href={buildVideoHref(video.slug, video.video_id)}
      className='group flex flex-col gap-2'
    >
      <div className='border-career-stroke bg-career-tint relative aspect-290/164 w-full overflow-hidden rounded-md border'>
        {thumbnail && (
          <Image
            src={thumbnail}
            alt={video.title}
            fill
            priority={priority}
            sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 290px'
            className='object-cover'
          />
        )}
        <CardPreview
          id={video.id}
          src={video.videoSource === 'upload' ? video.hlsUrl : null}
        />
      </div>

      <div className='flex w-full flex-col items-start gap-1'>
        {categoryTitle && (
          <VideoCategoryChip
            title={categoryTitle}
            slug={categorySlug}
          />
        )}
        <h3 className='text-career-dark group-hover:text-primary line-clamp-3 w-full text-sm leading-4.5 font-bold wrap-anywhere transition-colors lg:text-lg lg:leading-5.5'>
          {video.title}
        </h3>
      </div>
    </Link>
  );
}
