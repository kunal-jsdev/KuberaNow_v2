import Image from 'next/image';
import Link from 'next/link';

import chevronLg from '@/public/assets/videos/more-chevron-lg.svg';
import chevronSm from '@/public/assets/videos/more-chevron-sm.svg';

type VideoSectionHeaderProps = {
  title: string;
  as?: 'h1' | 'h2';
  moreHref?: string;
};

/**
 * Figma "HorizontalBorder": 26px heading row, then the 2px #DEDEDE rule drawn
 * inside the 34px box — so 6px (not 8px) of padding sits above the border.
 */
export default function VideoSectionHeader({
  title,
  as = 'h2',
  moreHref,
}: VideoSectionHeaderProps) {
  const Heading = as;

  return (
    <div className='border-border-gray flex items-start gap-2 border-b-2 pb-1.5'>
      <div className='flex min-w-0 flex-1 items-center'>
        <Heading className='text-career-dark flex items-center gap-3 py-0.5 text-base leading-5 font-bold'>
          <span
            className='bg-primary h-5.5 w-1 shrink-0 rounded-xs shadow-[2px_0px_0px_0px_var(--color-career-accent)]'
            aria-hidden
          />
          {title}
        </Heading>
      </div>

      {/* Figma sets "More" in Noto Sans with the arrows bottom-aligned. The
          body font (Noto Sans Gujarati) sets Latin text ~2px higher, which
          left the arrows looking low — so this link uses font-sans. */}
      {moreHref && (
        <Link
          href={moreHref}
          className='text-primary flex shrink-0 items-end gap-1 font-sans text-sm leading-4.5 font-semibold'
        >
          <span className='underline decoration-from-font [text-underline-position:from-font]'>
            More
          </span>
          <span
            className='flex items-center'
            aria-hidden
          >
            {/* The exported glyphs point down; Figma rotates them -90°. This
                box hugs the rotated 4.59×8 glyph, so the link's 4px gap is
                exactly the space between "More" and the first arrow. */}
            <span className='relative h-3.5 w-[4.59px]'>
              <Image
                src={chevronLg}
                alt=''
                unoptimized
                className='absolute top-[4.7px] left-[-1.705px] h-[4.59px] w-2 max-w-none -rotate-90'
              />
            </span>
            {/* Second chevron also glides, like the navbar category arrows.
                4.41px + its 4px inset keeps Figma's 8.41px between arrows. */}
            <span className='relative ml-[4.41px] size-3'>
              <Image
                src={chevronSm}
                alt=''
                unoptimized
                className='absolute top-1 left-[2.5px] h-1 w-1.75 max-w-none -rotate-90'
              />
              <span className='nav-arrow-ghost absolute inset-0'>
                <Image
                  src={chevronSm}
                  alt=''
                  unoptimized
                  className='absolute top-1 left-[2.5px] h-1 w-1.75 max-w-none -rotate-90'
                />
              </span>
            </span>
          </span>
        </Link>
      )}
    </div>
  );
}
