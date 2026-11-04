'use client';

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
import { VideoPreviewProvider } from './VideoPreviewContext';
import VideoSection from './VideoSection';
import VideoSectionHeader from './VideoSectionHeader';

interface InterleavedVideoSectionProps {
  videos: VideoCardData[];
  moreHref?: string;
  className?: string;
}

export default function InterleavedVideoSection({
  videos,
  moreHref,
  className = '',
}: InterleavedVideoSectionProps) {
  if (!videos || videos.length < 3) {
    return null;
  }

  return (
    <div className={`w-full ${className}`}>
      <VideoPreviewProvider initialActiveId={null}>
        <VideoSection layoutClassName='w-full rounded-lg p-3 sm:p-4 md:p-5'>
          <VideoSectionHeader
            title='Video'
            moreHref={moreHref}
          />

          <div className='grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 md:gap-4 lg:grid-cols-3 lg:gap-5'>
            {videos.map((video, index) => {
              const thumbnail = getVideoThumbnail(video);
              const categoryTitle = getVideoCategoryTitle(video);
              const categorySlug = getVideoCategorySlug(video);

              let visibilityClass = 'flex';
              if (index === 2) {
                visibilityClass = 'hidden md:flex';
              } else if (index === 3) {
                visibilityClass = 'hidden md:flex lg:hidden';
              } else if (index > 3) {
                visibilityClass = 'hidden';
              }

              return (
                <Link
                  key={video.id || video.slug}
                  href={buildVideoHref(video.slug, video.video_id)}
                  className={`group flex flex-col ${visibilityClass}`}
                >
                  <div className='border-career-stroke relative aspect-video w-full overflow-hidden rounded-md border bg-slate-900'>
                    {thumbnail && (
                      <Image
                        src={thumbnail}
                        alt={video.title}
                        fill
                        sizes='(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 33vw'
                        className='object-cover'
                      />
                    )}

                    <CardPreview
                      id={video.id}
                      src={video.videoSource === 'upload' ? video.hlsUrl : null}
                      showPlayButton
                    />
                  </div>

                  <div className='mt-2.5 flex w-full flex-col items-start gap-1 sm:mt-3'>
                    {categoryTitle && (
                      <VideoCategoryChip
                        title={categoryTitle}
                        slug={categorySlug}
                      />
                    )}
                    <h3 className='font-sans-guj text-career-dark group-hover:text-primary line-clamp-2 pt-0.5 text-xs leading-snug font-bold transition-colors duration-200 sm:text-sm md:text-base md:leading-snug'>
                      {video.title}
                    </h3>
                  </div>
                </Link>
              );
            })}
          </div>
        </VideoSection>
      </VideoPreviewProvider>
    </div>
  );
}
