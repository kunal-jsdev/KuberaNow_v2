'use client';

import { useCallback, useRef, useState } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

import Link from 'next/link';
import type { Swiper as SwiperType } from 'swiper';
import { Autoplay, Keyboard, Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import { HeadLineCard } from './HeadLineCard';
import type { CarouselProps, CarouselSlide } from './types';

import 'swiper/css';
import 'swiper/css/navigation';

export type { CarouselProps, CarouselSlide };

export function Carousel({
  slides = [],
  autoPlayDelay = 5000,
  showNavigation = true,
  className = '',
}: CarouselProps) {
  const swiperRef = useRef<SwiperType | null>(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const isManualRef = useRef(false);

  const switchToManual = useCallback(() => {
    isManualRef.current = true;
    swiperRef.current?.autoplay?.stop();
  }, []);

  const handleVideoPlayingChange = useCallback((isPlaying: boolean) => {
    const swiper = swiperRef.current;
    if (!swiper) return;
    if (isPlaying) {
      swiper.autoplay?.stop();
    } else if (!isManualRef.current) {
      swiper.autoplay?.start();
    }
  }, []);

  if (!slides || slides.length === 0) return null;

  return (
    <div className='ring-career-stroke flex h-50 w-full max-w-86 justify-center gap-1 rounded bg-white p-2 ring-1 sm:h-72 sm:w-full sm:max-w-150 md:h-100 md:max-w-full md:gap-2.5 md:rounded-lg md:p-5 lg:h-138'>
      <div
        className={`group/carousel relative h-full w-full overflow-hidden rounded-sm ${className}`}
      >
        <Swiper
          modules={[Navigation, Autoplay, Keyboard]}
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
          }}
          onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
          onSliderMove={switchToManual}
          autoplay={{
            delay: autoPlayDelay,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          keyboard={{ enabled: true }}
          loop={slides.length > 1}
          grabCursor
          className='h-full w-full rounded-sm md:rounded-lg'
        >
          {slides.map((slide, index) => {
            const content = (
              <HeadLineCard
                src={slide.url || slide.image}
                mediaType={slide.type}
                headline={slide.headline}
                isLive={slide.isLive}
                isActive={index === activeIndex}
                onVideoPlayingChange={handleVideoPlayingChange}
              />
            );

            return (
              <SwiperSlide
                key={slide.id ?? index}
                className='w-full'
              >
                {slide.link ? (
                  <Link
                    href={slide.link}
                    className='block h-full w-full'
                  >
                    {content}
                  </Link>
                ) : (
                  content
                )}
              </SwiperSlide>
            );
          })}
        </Swiper>

        {showNavigation && slides.length > 1 && (
          <>
            <button
              type='button'
              onClick={() => {
                switchToManual();
                swiperRef.current?.slidePrev();
              }}
              aria-label='Previous slide'
              className='absolute top-1/2 left-3 z-20 flex h-4 w-4 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white text-black transition-all duration-200 hover:scale-110 hover:bg-gray-100 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black/40 focus-visible:outline-none active:scale-95 md:h-10.5 md:w-10.5'
            >
              <FaChevronLeft className='h-2.5 w-2.5 md:h-6 md:w-6' />
            </button>

            <button
              type='button'
              onClick={() => {
                switchToManual();
                swiperRef.current?.slideNext();
              }}
              aria-label='Next slide'
              className='absolute top-1/2 right-3 z-20 flex h-4 w-4 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white text-black transition-all duration-200 hover:scale-110 hover:bg-gray-100 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black/40 focus-visible:outline-none active:scale-95 md:h-10.5 md:w-10.5'
            >
              <FaChevronRight className='h-2.5 w-2.5 md:h-6 md:w-6' />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
