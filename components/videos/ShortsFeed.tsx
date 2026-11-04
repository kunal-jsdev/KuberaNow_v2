'use client';

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import Image from 'next/image';

import { buildVideoSegment } from '@/Payload/lib/utilities/videoId';

import ShortsNavButtons from './ShortsNavButtons';
import ShortsPlayer, { ShortsCaption } from './ShortsPlayer';
import { buildShortsHref } from './utils';

export type ShortsFeedItem = {
  id: string;
  slug: string;
  videoId?: string | null;
  title: string;
  description?: string | null;
  categoryTitle: string | null;
  poster: string | null;
  src: string | null;
};

type ShortsFeedProps = {
  items: ShortsFeedItem[];
  startIndex: number;
  /** Absolute origin, for the share menu's links. */
  siteUrl: string;
};

/** Players kept mounted either side of the one in view (pre-rendered). */
const PRELOAD_DISTANCE = 1;

/** A short that's too far away to need a player: just its poster and caption. */
function ShortsPlaceholder({ item }: { item: ShortsFeedItem }) {
  return (
    <div className='relative h-full w-full bg-black'>
      {item.poster && (
        <Image
          src={item.poster}
          alt=''
          fill
          sizes='464px'
          className='object-cover'
        />
      )}
      <div
        className='absolute inset-0 bg-[linear-gradient(180deg,rgba(1,8,116,0)_79.457%,#010874_100%)]'
        aria-hidden
      />
      <div className='absolute inset-x-0 bottom-0'>
        <ShortsCaption
          title={item.title}
          categoryTitle={item.categoryTitle}
        />
      </div>
    </div>
  );
}

/**
 * YouTube Shorts-style feed: one short per screen, snapping on scroll, with
 * up/down buttons and arrow keys. The shorts either side of the current one
 * are mounted (and buffering) ahead of time; only the one in view plays.
 */
export default function ShortsFeed({
  items,
  startIndex,
  siteUrl,
}: ShortsFeedProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(startIndex);
  const mutedRef = useRef(false);

  // Open on the short from the URL, without animating through the others.
  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    if (scroller) scroller.scrollTop = startIndex * scroller.clientHeight;
  }, [startIndex]);

  // Whichever slide is mostly in view is the active one.
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(Number((entry.target as HTMLElement).dataset.index));
          }
        });
      },
      { root: scroller, threshold: 0.6 }
    );
    scroller
      .querySelectorAll('[data-index]')
      .forEach((slide) => observer.observe(slide));
    return () => observer.disconnect();
  }, [items.length]);

  // Keep the address bar (and tab title) on the short being watched, so a
  // refresh or a copied URL lands back on it.
  useEffect(() => {
    const item = items[active];
    if (!item) return;
    const href = buildShortsHref(item.slug, item.videoId);
    if (window.location.pathname !== href) {
      window.history.replaceState(window.history.state, '', href);
    }
    document.title = `${item.title} | KuberaNow`;
  }, [active, items]);

  const goTo = useCallback(
    (index: number) => {
      const scroller = scrollerRef.current;
      if (!scroller || index < 0 || index >= items.length) return;
      scroller.scrollTo({
        top: index * scroller.clientHeight,
        behavior: 'smooth',
      });
    },
    [items.length]
  );

  // Phones and tablets: the short fills the screen, so the page itself must
  // not scroll or bounce — only the feed moves. Desktop scrolls normally
  // (it has the footer and sidebar below/beside the feed).
  useEffect(() => {
    const query = window.matchMedia('(max-width: 1023.98px)');
    const root = document.documentElement;
    const { body } = document;
    const previous = {
      rootOverflow: root.style.overflow,
      bodyOverflow: body.style.overflow,
      overscroll: root.style.overscrollBehavior,
    };

    const apply = () => {
      if (query.matches) {
        window.scrollTo(0, 0);
        root.style.overflow = 'hidden';
        body.style.overflow = 'hidden';
        root.style.overscrollBehavior = 'none';
      } else {
        root.style.overflow = previous.rootOverflow;
        body.style.overflow = previous.bodyOverflow;
        root.style.overscrollBehavior = previous.overscroll;
      }
    };

    apply();
    query.addEventListener('change', apply);
    return () => {
      query.removeEventListener('change', apply);
      root.style.overflow = previous.rootOverflow;
      body.style.overflow = previous.bodyOverflow;
      root.style.overscrollBehavior = previous.overscroll;
    };
  }, []);

  // Wheel / trackpad: one gesture moves exactly one short, like YouTube.
  // Native snapping alone falls short here — a small wheel delta snaps back
  // to the same short, and trackpad momentum can skip several.
  const activeRef = useRef(active);
  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return undefined;

    let accumulated = 0;
    let locked = false;
    let lockedAt = 0;
    let quietTimer: ReturnType<typeof setTimeout> | null = null;

    // Stay locked until the gesture (and its momentum) has gone quiet.
    const scheduleUnlock = () => {
      if (quietTimer) clearTimeout(quietTimer);
      quietTimer = setTimeout(() => {
        const wait = 450 - (Date.now() - lockedAt);
        if (wait > 0) {
          quietTimer = setTimeout(scheduleUnlock, wait);
          return;
        }
        locked = false;
        accumulated = 0;
      }, 200);
    };

    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) < Math.abs(e.deltaX)) return; // sideways swipe
      const direction = Math.sign(e.deltaY);
      const current = activeRef.current;
      const atEdge =
        (direction < 0 && current === 0) ||
        (direction > 0 && current === items.length - 1);
      // Past the first/last short, let the page itself scroll.
      if (atEdge && !locked) return;

      e.preventDefault();
      if (locked) {
        scheduleUnlock();
        return;
      }
      accumulated += e.deltaY;
      if (Math.abs(accumulated) >= 40) {
        goTo(current + direction);
        locked = true;
        lockedAt = Date.now();
        scheduleUnlock();
      }
    };

    scroller.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      scroller.removeEventListener('wheel', onWheel);
      if (quietTimer) clearTimeout(quietTimer);
    };
  }, [goTo, items.length]);

  // Arrow keys / Page keys move through the feed — except inside the player,
  // where the arrows already seek and change the volume.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target?.closest('[aria-label="Video Player"], input, textarea, select')
      ) {
        return;
      }
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        goTo(active + 1);
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        goTo(active - 1);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [active, goTo]);

  const nav = (className: string) => (
    <ShortsNavButtons
      onPrev={() => goTo(active - 1)}
      onNext={() => goTo(active + 1)}
      hasPrev={active > 0}
      hasNext={active < items.length - 1}
      className={className}
    />
  );

  return (
    <div>
      <h1 className='sr-only'>{items[active]?.title}</h1>

      {/* A 9:16 frame sized to the screen:
          - phone: the card's width, but never taller than the screen (162px =
            98 header + 2×16 page padding + 2×16 card padding);
          - tablet: screen height (Figma: ≈465×828 at 768×1024);
          - desktop: screen height, max 824px (Figma: 463×824 at 1920×1080),
            centred in the panel with the up/down buttons to its right. */}
      <div className='relative mx-auto aspect-9/16 w-[min(100%,calc((100svh-162px)*9/16))] md:h-[calc(100svh-196px)] md:min-h-120 md:w-auto lg:h-[calc(100svh-228px)] lg:max-h-206'>
        <div
          ref={scrollerRef}
          className='scrollbar-hide h-full w-full snap-y snap-mandatory overflow-y-auto overscroll-y-contain rounded-lg lg:overscroll-y-auto'
        >
          {items.map((item, index) => (
            <div
              key={item.id}
              data-index={index}
              // snap-always: one short per scroll, never flinging past several.
              className='h-full w-full snap-start snap-always'
            >
              {Math.abs(index - active) <= PRELOAD_DISTANCE ? (
                <ShortsPlayer
                  src={item.src}
                  poster={item.poster}
                  title={item.title}
                  description={item.description}
                  categoryTitle={item.categoryTitle}
                  url={`${siteUrl}${buildShortsHref(item.slug, item.videoId)}`}
                  slug={buildVideoSegment(item.slug, item.videoId)}
                  active={index === active}
                  mutedRef={mutedRef}
                />
              ) : (
                <ShortsPlaceholder item={item} />
              )}
            </div>
          ))}
        </div>
        {/* Desktop only: tablet and phone designs have no buttons — there the
            feed is swiped (native snapping moves one short per swipe). */}
        {nav('absolute bottom-30 left-full ml-19 hidden flex-col lg:flex')}
      </div>
    </div>
  );
}
