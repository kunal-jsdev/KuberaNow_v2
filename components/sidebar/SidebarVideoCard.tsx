'use client';

import { useState } from 'react';
import { FaPlay } from 'react-icons/fa';

import Image from 'next/image';

import ytIcon from '@/public/assets/yt.svg';

type SidebarVideoCardProps = {
  videoId: string;
  heading?: string | null;
  autoplay?: boolean | null;
  originalUrl?: string;
  className?: string;
};

export default function SidebarVideoCard({
  videoId,
  heading,
  autoplay = false,
  originalUrl,
  className = '',
}: SidebarVideoCardProps) {
  const [isPlaying, setIsPlaying] = useState(Boolean(autoplay));

  const watchUrl = originalUrl || `https://www.youtube.com/watch?v=${videoId}`;
  const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=${autoplay || isPlaying ? '1' : '0'}&mute=${autoplay ? '1' : '0'}&rel=0`;
  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

  return (
    <section
      aria-label={heading || 'Featured Video'}
      className={`border-divider bg-surface w-85.75 max-w-full overflow-hidden rounded-[5px] border p-4 md:w-76 ${className}`}
    >
      {heading && (
        <header className='border-dark-blue mb-3 flex h-7.5 items-center justify-between border-b px-2.5 py-2'>
          <h2 className='text-career-dark text-heading-small min-w-0 truncate leading-5.5 font-bold'>
            {heading}
          </h2>
        </header>
      )}

      <div className='group relative aspect-video w-full overflow-hidden rounded-[4px] border border-gray-200 bg-black shadow-xs'>
        {isPlaying ? (
          <iframe
            src={embedUrl}
            title={heading || 'YouTube video player'}
            className='absolute inset-0 h-full w-full border-0'
            allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
            allowFullScreen
          />
        ) : (
          <button
            type='button'
            onClick={() => setIsPlaying(true)}
            className='group/overlay relative block h-full w-full cursor-pointer text-left'
            aria-label={`Play ${heading || 'video'}`}
          >
            <Image
              src={thumbnailUrl}
              alt={heading || 'YouTube Video Thumbnail'}
              fill
              className='object-cover transition-transform duration-300 group-hover/overlay:scale-105'
              unoptimized
            />
            <div className='absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30' />
            <div className='absolute inset-0 flex items-center justify-center'>
              <div className='flex h-12 w-16 items-center justify-center rounded-xl bg-red-600/90 text-white shadow-lg backdrop-blur-xs transition-all duration-300 group-hover/overlay:scale-110 group-hover/overlay:bg-red-600'>
                <FaPlay className='ml-0.5 text-xl' />
              </div>
            </div>
            <div className='absolute right-2 bottom-2 z-10'>
              <a
                href={watchUrl}
                target='_blank'
                rel='noopener noreferrer'
                onClick={(e) => e.stopPropagation()}
                className='flex items-center gap-1.5 rounded-full bg-black/75 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-md transition-colors hover:bg-black/90'
              >
                <span>Watch on</span>
                <span className='flex items-center font-semibold text-white'>
                  <Image
                    src={ytIcon}
                    alt='YouTube'
                    width={14}
                    height={14}
                    className='mr-1 inline-block'
                  />
                  YouTube
                </span>
              </a>
            </div>
          </button>
        )}
      </div>
    </section>
  );
}
