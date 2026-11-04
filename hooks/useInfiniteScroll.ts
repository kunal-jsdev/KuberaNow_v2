'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface UseInfiniteScrollOptions {
  initialVisibleCount: number;
  incrementBy: number;
  maxCount: number;
}

export function useInfiniteScroll({
  initialVisibleCount,
  incrementBy,
  maxCount,
}: UseInfiniteScrollOptions) {
  const [visibleCount, setVisibleCount] = useState(initialVisibleCount);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (target.isIntersecting && visibleCount < maxCount) {
        setVisibleCount((prev) => Math.min(prev + incrementBy, maxCount));
      }
    },
    [visibleCount, maxCount, incrementBy]
  );

  useEffect(() => {
    const option = {
      root: null,
      rootMargin: '200px',
      threshold: 0,
    };

    observerRef.current = new IntersectionObserver(handleObserver, option);

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleObserver]);

  return { visibleCount, loadMoreRef };
}
