'use client';

import { useEffect, useRef, useState } from 'react';
import { FaArrowUpRightFromSquare, FaFacebook } from 'react-icons/fa6';

import { loadFacebookSdk } from './facebookSdk';

type FacebookEmbedProps = {
  embedType: 'video' | 'post';
  originalUrl: string;
  className?: string;
};

const MIN_WIDTH = 280;
const MAX_WIDTH = 500;
const WIDTH_STEP = 20;
const RESIZE_DEBOUNCE_MS = 250;
const PARSE_TIMEOUT_MS = 12000;

function snapWidth(raw: number) {
  const clamped = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, raw));
  return Math.round(clamped / WIDTH_STEP) * WIDTH_STEP;
}

export default function FacebookEmbed({
  embedType,
  originalUrl,
  className = '',
}: FacebookEmbedProps) {
  const outerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(MAX_WIDTH);

  useEffect(() => {
    const outer = outerRef.current;
    if (!outer) return undefined;

    let debounceId: number | undefined;

    const updateWidth = () => {
      const rect = outer.getBoundingClientRect();
      if (rect.width <= 0) return;
      const next = snapWidth(rect.width);
      setWidth((prev) => (prev === next ? prev : next));
    };

    updateWidth();

    const resizeObserver = new ResizeObserver(() => {
      window.clearTimeout(debounceId);
      debounceId = window.setTimeout(updateWidth, RESIZE_DEBOUNCE_MS);
    });
    resizeObserver.observe(outer);

    return () => {
      window.clearTimeout(debounceId);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div className={`mx-auto my-6 flex w-full justify-center ${className}`}>
      <div className='border-career-stroke bg-surface shadow-content-panel w-full max-w-125 overflow-hidden rounded-lg border'>
        {/* Header */}
        <div className='border-divider flex items-center gap-2 border-b px-4 py-2.5'>
          <FaFacebook className='text-lg text-[#1877F2]' />
          <span className='text-career-dark text-sm font-semibold'>
            Facebook
          </span>
        </div>

        {/* Body */}
        <div
          ref={outerRef}
          className='flex w-full justify-center p-3 md:p-4'
        >
          {/* Remounted whenever the post or measured width changes, so it always starts a clean parse. */}
          <FacebookEmbedBody
            key={`${embedType}:${originalUrl}:${width}`}
            embedType={embedType}
            originalUrl={originalUrl}
            width={width}
          />
        </div>
      </div>
    </div>
  );
}

type Status = 'loading' | 'ready' | 'error';

function FacebookEmbedBody({
  embedType,
  originalUrl,
  width,
}: {
  embedType: 'video' | 'post';
  originalUrl: string;
  width: number;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<Status>('loading');

  useEffect(() => {
    let cancelled = false;

    const timeoutId = window.setTimeout(() => {
      if (!cancelled) setStatus('error');
    }, PARSE_TIMEOUT_MS);

    loadFacebookSdk()
      .then(() => {
        const node = contentRef.current;
        if (cancelled || !node || !window.FB) return;

        window.FB.XFBML.parse(node, () => {
          if (!cancelled) {
            window.clearTimeout(timeoutId);
            setStatus('ready');
          }
        });
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [embedType, originalUrl, width]);

  if (status === 'error') {
    return (
      <FacebookFallback
        embedType={embedType}
        originalUrl={originalUrl}
      />
    );
  }

  return (
    <div
      className='relative'
      style={{ width, minHeight: status === 'loading' ? 320 : undefined }}
    >
      {status === 'loading' && <FacebookSkeleton />}
      <div
        ref={contentRef}
        style={{ visibility: status === 'ready' ? 'visible' : 'hidden' }}
      >
        {embedType === 'video' ? (
          <div
            className='fb-video'
            data-href={originalUrl}
            data-width={width}
            data-show-text='false'
          />
        ) : (
          <div
            className='fb-post'
            data-href={originalUrl}
            data-width={width}
            data-show-text='true'
          />
        )}
      </div>
      {embedType === 'video' && status === 'ready' && (
        <div
          aria-hidden
          className='pointer-events-auto absolute top-0 right-0 z-10 h-12 w-16 rounded-bl-md bg-gradient-to-bl from-black/55 via-black/20 to-transparent'
        />
      )}
    </div>
  );
}

function FacebookSkeleton() {
  return (
    <div className='border-career-stroke bg-career-tint/40 absolute inset-0 flex flex-col items-center justify-center gap-3 overflow-hidden rounded-md border'>
      <div className='from-career-tint via-career-stroke to-career-tint absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite] bg-linear-to-r bg-size-[200%_100%]' />
      <FaFacebook className='relative z-10 text-2xl text-[#1877F2]/70' />
      <span className='text-career-dark/70 relative z-10 text-xs font-medium'>
        Loading Facebook content…
      </span>
      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}

function FacebookFallback({
  embedType,
  originalUrl,
}: {
  embedType: 'video' | 'post';
  originalUrl: string;
}) {
  return (
    <div className='border-career-stroke bg-career-tint/40 flex w-full max-w-90 flex-col items-center gap-3 rounded-md border px-6 py-8 text-center'>
      <FaFacebook className='text-3xl text-[#1877F2]' />
      <p className='text-career-dark text-sm leading-5'>
        This Facebook {embedType === 'video' ? 'video' : 'post'} couldn&apos;t
        be displayed here.
      </p>
      <a
        href={originalUrl}
        target='_blank'
        rel='noopener noreferrer'
        className='bg-career-tint border-divider text-career-dark hover:bg-career-stroke inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors'
      >
        Open on Facebook
        <FaArrowUpRightFromSquare className='text-[10px]' />
      </a>
    </div>
  );
}
