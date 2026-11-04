'use client';

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
import { VideoPreviewProvider } from './VideoPreviewContext';
import VideoSection from './VideoSection';
import VideoSectionHeader from './VideoSectionHeader';

interface InterleavedShortsSectionProps {
  shorts: VideoCardData[];
  moreHref?: string;
  className?: string;
}

export default function InterleavedShortsSection({
  shorts,
  moreHref,
  className = '',
}: InterleavedShortsSectionProps) {
  if (!shorts || shorts.length < 3) {
    return null;
  }

  return (
    <div className={`w-full ${className}`}>
      <VideoPreviewProvider initialActiveId={null}>
        <VideoSection layoutClassName='w-full rounded-lg p-3 sm:p-4 md:p-5'>
          <VideoSectionHeader
            title='Shorts'
            moreHref={moreHref}
          />

          <div className='grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-4 lg:grid-cols-3 lg:gap-x-5 lg:gap-y-6'>
            {shorts.map((short, index) => {
              const thumbnail = getVideoThumbnail(short);
              const categoryTitle = getVideoCategoryTitle(short);
              const categorySlug = getVideoCategorySlug(short);

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
                  key={short.id || short.slug}
                  href={buildShortsHref(short.slug, short.video_id)}
                  className={`group border-career-stroke bg-career-tint relative aspect-290/516 w-full flex-col justify-end overflow-hidden rounded border ${visibilityClass}`}
                >
                  {thumbnail && (
                    <Image
                      src={thumbnail}
                      alt={short.title}
                      fill
                      sizes='(max-width: 768px) 50vw, 290px'
                      className='object-cover'
                    />
                  )}

                  <CardPreview
                    id={short.id}
                    src={short.videoSource === 'upload' ? short.hlsUrl : null}
                    showPlayButton={false}
                  />

                  <div
                    className='absolute inset-0 bg-[linear-gradient(180deg,rgba(1,8,116,0)_79.457%,#010874_100%)]'
                    aria-hidden
                  />

                  <div className='relative z-10 mt-auto flex w-full flex-col items-start gap-1 px-2.5 pt-2 pb-2.5 sm:px-3 sm:pt-2.5 sm:pb-3 lg:px-4 lg:pt-3 lg:pb-3.5'>
                    {categoryTitle && (
                      <VideoCategoryChip
                        title={categoryTitle}
                        slug={categorySlug}
                      />
                    )}
                    <h2 className='line-clamp-2 pt-1 text-xs leading-4 font-semibold tracking-normal wrap-anywhere text-white max-md:[font-family:var(--font-noto-sans),var(--font-noto-sans-guj),sans-serif] md:line-clamp-3 md:text-lg md:leading-5.5 md:font-bold'>
                      {short.title}
                    </h2>
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
