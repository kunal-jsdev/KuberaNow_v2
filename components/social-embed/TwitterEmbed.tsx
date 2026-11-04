'use client';

import { useEffect, useRef, useState } from 'react';
// import { FaXTwitter } from 'react-icons/fa6';

type TwitterEmbedProps = {
  username?: string;
  tweetId: string;
  originalUrl?: string;
  className?: string;
};

declare global {
  interface Window {
    twttr?: {
      widgets?: {
        createTweet?: (
          tweetId: string,
          targetEl: HTMLElement,
          options?: Record<string, unknown>
        ) => Promise<HTMLElement>;
      };
    };
  }
}

export default function TwitterEmbed({
  username = 'twitter',
  tweetId,
  originalUrl,
  className = '',
}: TwitterEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [useIframeFallback, setUseIframeFallback] = useState(false);
  // const tweetUrl = originalUrl || `https://x.com/${username}/status/${tweetId}`;
  const iframeSrc = `https://platform.twitter.com/embed/Tweet.html?id=${tweetId}&theme=light&dnt=true`;

  useEffect(() => {
    if (typeof window === 'undefined' || !tweetId) return;

    let isMounted = true;

    const renderTweet = () => {
      if (containerRef.current && window.twttr?.widgets?.createTweet) {
        containerRef.current.innerHTML = '';
        window.twttr.widgets
          .createTweet(tweetId, containerRef.current, {
            dnt: true,
            theme: 'light',
            align: 'center',
          })
          .then((el) => {
            if (isMounted && !el) {
              setUseIframeFallback(true);
            }
          })
          .catch(() => {
            if (isMounted) setUseIframeFallback(true);
          });
      } else {
        setUseIframeFallback(true);
      }
    };

    if (!document.getElementById('twitter-wjs')) {
      const script = document.createElement('script');
      script.id = 'twitter-wjs';
      script.src = 'https://platform.twitter.com/widgets.js';
      script.async = true;
      script.charset = 'utf-8';
      script.onload = () => {
        renderTweet();
      };
      script.onerror = () => {
        if (isMounted) setUseIframeFallback(true);
      };
      document.body.appendChild(script);
    } else {
      renderTweet();
    }

    return () => {
      isMounted = false;
    };
  }, [tweetId]);

  return (
    <div className={`mx-auto my-6 max-w-[550px] ${className}`}>
      <div className='relative flex min-h-[350px] w-full flex-col items-center justify-center overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900'>
        {/* Dynamic container populated by Twitter widgets.createTweet */}
        <div
          ref={containerRef}
          className='flex w-full justify-center'
        />

        {/* Fallback iframe with full height if script fails */}
        {useIframeFallback && (
          <iframe
            src={iframeSrc}
            title='Twitter Tweet'
            className='min-h-[580px] w-full rounded-2xl border-0 sm:min-h-[660px]'
            allowTransparency
            scrolling='no'
          />
        )}
      </div>

      {/* <div className='mt-2 flex items-center justify-between px-2 text-xs text-neutral-500 dark:text-neutral-400'>
        <span className='truncate'>View post status on X</span>
        <a
          href={tweetUrl}
          target='_blank'
          rel='noopener noreferrer'
          className='flex shrink-0 items-center gap-1.5 font-semibold text-sky-600 hover:underline dark:text-sky-400'
        >
          <FaXTwitter className='text-sm' />
          <span>Open on X</span>
        </a>
      </div> */}
    </div>
  );
}
