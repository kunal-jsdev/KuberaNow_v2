'use client';

import { useEffect, useLayoutEffect } from 'react';

type ArticleScrollToTopProps = {
  articleId?: string | number;
  articleSlug?: string;
};

export default function ArticleScrollToTop({
  articleId,
  articleSlug,
}: ArticleScrollToTopProps) {
  const useIsomorphicEffect =
    typeof window !== 'undefined' ? useLayoutEffect : useEffect;

  useIsomorphicEffect(() => {
    if (window.location.hash) return;

    const scrollToTop = () => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      if (document.documentElement) {
        document.documentElement.scrollTop = 0;
      }
      if (document.body) {
        document.body.scrollTop = 0;
      }
    };

    scrollToTop();

    const rafId = requestAnimationFrame(() => {
      scrollToTop();
    });

    const timerId = setTimeout(() => {
      scrollToTop();
    }, 60);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timerId);
    };
  }, [articleId, articleSlug]);

  return (
    <span
      id='article-top'
      className='sr-only'
      aria-hidden='true'
    />
  );
}
