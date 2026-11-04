'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { FEED_BATCH_SIZE, FEED_SECTION_SIZE } from '@/constants/newsFeed';

type FeedItem = { id: string | number };

/**
 * - `loading`: the sections the user asked for are being fetched
 * - `error`: the last fetch failed on the server side
 * - `offline`: the last fetch failed because the browser has no connection
 * - `more`: more articles exist; a "Load More" button is shown
 * - `done`: every article has been loaded
 */
export type NewsFeedStatus =
  'idle' | 'loading' | 'error' | 'offline' | 'more' | 'done';

type FetchPage<T> = (
  page: number
) => Promise<{ docs: T[]; hasNextPage?: boolean | null }>;

interface UseNewsFeedOptions<T extends FeedItem> {
  initialItems: T[];
  /** Whether the server has another page after the initial batch. */
  initialHasMore: boolean;
  fetchPage: FetchPage<T>;
}

/** Sections revealed per batch: the initial load and every "Load More" click. */
const SECTIONS_PER_BATCH = FEED_BATCH_SIZE / FEED_SECTION_SIZE;

function isOffline() {
  return typeof navigator !== 'undefined' && navigator.onLine === false;
}

function chunk<T>(items: T[], size: number): T[][] {
  const groups: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    groups.push(items.slice(i, i + size));
  }
  return groups;
}

/**
 * Batched feed driven by a "Load More" button:
 * 1. {@link SECTIONS_PER_BATCH} sections are shown initially, followed by the button
 * 2. each click fetches the next batch and reveals its sections above the footer, which
 *    moves down as more sections load
 *
 * A skeleton shows while the requested batch is loading. On a failed fetch it stops until
 * `retry` is called; offline failures retry once the connection is back.
 */
export function useNewsFeed<T extends FeedItem>({
  initialItems,
  initialHasMore,
  fetchPage,
}: UseNewsFeedOptions<T>) {
  const [items, setItems] = useState<T[]>(initialItems);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [error, setError] = useState<'offline' | 'failed' | null>(null);
  // How many sections the user has asked for so far.
  const [sectionLimit, setSectionLimit] = useState(SECTIONS_PER_BATCH);
  // Kept in state (not a ref) so a fetch that adds no new items still re-runs the fetch effect.
  const [page, setPage] = useState(2);

  const inFlightRef = useRef(false);
  const fetchPageRef = useRef(fetchPage);
  useEffect(() => {
    fetchPageRef.current = fetchPage;
  }, [fetchPage]);

  const sections = useMemo(() => chunk(items, FEED_SECTION_SIZE), [items]);
  const isBatchReady = sections.length >= sectionLimit || !hasMore;
  const visibleSections = sections.slice(
    0,
    isBatchReady
      ? sectionLimit
      : Math.max(
          sectionLimit - SECTIONS_PER_BATCH,
          sections.length > 0 && sectionLimit === SECTIONS_PER_BATCH
            ? sections.length
            : 0
        )
  );

  const moreExists = sections.length > visibleSections.length || hasMore;
  // Derived rather than stored, so the fetch effect never has to set state synchronously.
  const isLoading = sections.length < sectionLimit && hasMore && !error;

  // "Load More" click: ask for the next batch of sections; the effect below fetches what's missing.
  const showMore = useCallback(() => {
    setSectionLimit((limit) => limit + SECTIONS_PER_BATCH);
  }, []);

  useEffect(() => {
    if (!isLoading || inFlightRef.current) return;
    inFlightRef.current = true;

    // All state updates happen after the fetch settles; an offline fetch rejects and lands in `catch`.
    fetchPageRef
      .current(page)
      .then((res) => {
        const docs = res.docs ?? [];
        setItems((prev) => {
          const existingIds = new Set(prev.map((item) => item.id));
          return [...prev, ...docs.filter((item) => !existingIds.has(item.id))];
        });
        setPage((p) => p + 1);
        setHasMore(docs.length > 0 && Boolean(res.hasNextPage));
      })
      .catch(() => {
        setError(isOffline() ? 'offline' : 'failed');
      })
      .finally(() => {
        inFlightRef.current = false;
      });
  }, [isLoading, page]);

  // Clearing the error re-enables `isLoading`, and the effect above fetches again.
  const retry = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    if (error !== 'offline') return;
    window.addEventListener('online', retry);
    return () => window.removeEventListener('online', retry);
  }, [error, retry]);

  let status: NewsFeedStatus = 'idle';
  if (error && hasMore) status = error === 'offline' ? 'offline' : 'error';
  else if (!isBatchReady) status = 'loading';
  else if (moreExists) status = 'more';
  else if (sections.length > 0) status = 'done';

  return {
    sections: visibleSections,
    isLoading,
    status,
    showMore,
    retry,
  };
}
