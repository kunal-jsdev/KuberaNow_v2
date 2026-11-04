'use client';

import { useState } from 'react';
import { FaPlay } from 'react-icons/fa';

import Image from 'next/image';

import ytIcon from '@/public/assets/yt.svg';

type YouTubeEmbedProps = {
  videoId: string;
  originalUrl?: string;
  className?: string;
};

export default function YouTubeEmbed({
  videoId,
  originalUrl,
  className = '',
}: YouTubeEmbedProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const watchUrl = originalUrl || `https://www.youtube.com/watch?v=${videoId}`;
  const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`;
  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

  return (
    <div className={`mx-auto my-6 max-w-2xl ${className}`}>
      <div className='group relative aspect-video w-full overflow-hidden rounded-xl border border-gray-200 bg-black shadow-md'>
        {isPlaying ? (
          <iframe
            src={embedUrl}
            title='YouTube video player'
            className='absolute inset-0 h-full w-full border-0'
            allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
            allowFullScreen
          />
        ) : (
          <div
            onClick={() => setIsPlaying(true)}
            className='group/overlay relative h-full w-full cursor-pointer'
          >
            {/* Background Thumbnail Image */}
            <Image
              src={thumbnailUrl}
              alt='YouTube Video Thumbnail'
              fill
              className='object-cover transition-transform duration-300 group-hover/overlay:scale-105'
              unoptimized
            />

            {/* Dark gradient overlays */}
            <div className='absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/40' />

            {/* Play Button Center Badge */}
            <div className='absolute inset-0 flex items-center justify-center'>
              <div className='flex h-16 w-20 items-center justify-center rounded-2xl bg-red-600/90 text-white shadow-xl backdrop-blur-xs transition-all duration-300 group-hover/overlay:scale-110 group-hover/overlay:bg-red-600'>
                <FaPlay className='ml-1 text-2xl' />
              </div>
            </div>

            {/* Bottom bar pill link */}
            <div className='absolute right-3 bottom-3 z-10'>
              <a
                href={watchUrl}
                target='_blank'
                rel='noopener noreferrer'
                onClick={(e) => e.stopPropagation()}
                className='flex items-center gap-2 rounded-full bg-black/70 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md transition-colors hover:bg-black/90'
              >
                <span>Watch on</span>
                <span className='flex items-center font-semibold text-white'>
                  <Image
                    src={ytIcon}
                    alt='YouTube'
                    width={16}
                    height={16}
                    className='mr-1 inline-block'
                  />
                  YouTube
                </span>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
