'use client';

import { useLayoutEffect, useRef, useState } from 'react';

import Link from 'next/link';

export type VideoTag = {
  id: string;
  title: string;
  slug?: string | null;
};

type VideoDescriptionProps = {
  text?: string | null;
  tags?: VideoTag[];
};

/**
 * When on, tags are links to /tag/{slug} (same as article detail pages);
 * set to false to show them as plain chips again.
 */
const TAG_LINKS_ENABLED = true;

// Figma (Full Video → tags): Noto Sans H9 — 12px/16px, weight 600, #00219A,
// white pill with a light border. Gujarati tag names fall back to the
// site's Gujarati font.
const tagChipClassName =
  'border-divider rounded-full border bg-white px-2.5 py-1 font-[family-name:var(--font-noto-sans),var(--font-noto-sans-guj),sans-serif] text-xs leading-4 font-semibold text-[#00219A]';

/**
 * Collapsed (Figma): one line of 18px/24px text with a bold "...More" beside
 * it. Expanded: the full text, the "Tags :" row, then "Show Less" underneath.
 */
export default function VideoDescription({
  text,
  tags = [],
}: VideoDescriptionProps) {
  const textRef = useRef<HTMLParagraphElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(false);

  useLayoutEffect(() => {
    const el = textRef.current;
    if (!el || expanded) return undefined;

    const measure = () => setOverflows(el.scrollHeight > el.clientHeight + 1);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [text, expanded]);

  // Tags only appear once expanded, so offer "...More" whenever there are
  // tags, even if the description itself fits on one line.
  const canExpand = overflows || tags.length > 0;

  if (!text && tags.length === 0) return null;

  const toggle = (
    <button
      type='button'
      onClick={() => setExpanded((value) => !value)}
      aria-expanded={expanded}
      className='text-career-dark shrink-0 cursor-pointer font-sans text-lg leading-5.5 font-bold tracking-normal whitespace-nowrap'
    >
      {expanded ? 'Show Less' : '...More'}
    </button>
  );

  if (!expanded) {
    return (
      <div className='text-career-dark flex w-full items-start gap-2 text-lg'>
        {/* One 24px line, clipped with overflow rather than `line-clamp`:
            line-clamp adds its own "…", which doubled up with "...More".
            `overflow-wrap: anywhere` breaks long unspaced strings (pasted
            links, keyboard mash) instead of letting them spill out. */}
        <p
          ref={textRef}
          className='h-6 min-w-0 flex-1 overflow-hidden leading-6 font-normal wrap-anywhere whitespace-pre-line'
        >
          {text}
        </p>
        {canExpand && toggle}
      </div>
    );
  }

  return (
    <div className='text-career-dark flex w-full flex-col items-start gap-3'>
      {text && (
        <p
          ref={textRef}
          className='w-full text-lg leading-6 font-normal wrap-anywhere whitespace-pre-line'
        >
          {text}
        </p>
      )}

      {/* 8px between chips; 16px after the label (8px gap + 8px margin). */}
      {tags.length > 0 && (
        <div className='flex flex-wrap items-center gap-2'>
          <span className='text-career-dark mr-2 text-xs leading-4 font-semibold'>
            Tags :
          </span>
          {tags.map((tag) =>
            TAG_LINKS_ENABLED && tag.slug ? (
              <Link
                key={tag.id}
                href={`/tag/${tag.slug}`}
                className={`${tagChipClassName} hover:bg-career-stroke transition-colors`}
              >
                {tag.title}
              </Link>
            ) : (
              <span
                key={tag.id}
                className={tagChipClassName}
              >
                {tag.title}
              </span>
            )
          )}
        </div>
      )}

      {toggle}
    </div>
  );
}
