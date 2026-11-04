'use client';

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import { playLiveBlogChime } from './audioChime';
import type {
  LiveBlogConnectionState,
  LiveBlogRealtimeContextValue,
  LiveBlogUpdateItem,
} from './types';

const LiveBlogRealtimeContext =
  createContext<LiveBlogRealtimeContextValue | null>(null);

interface LiveBlogRealtimeProviderProps {
  articleId: string;
  slug?: string;
  initialIsLiveBlog?: boolean;
  initialUpdates: LiveBlogUpdateItem[];
  initialStatus?: 'active' | 'concluded';
  disableChime?: boolean;
  children: ReactNode;
}

function sortUpdates(items: LiveBlogUpdateItem[]): LiveBlogUpdateItem[] {
  return [...items].sort((a, b) => {
    const timeA = new Date(a.timestamp).getTime();
    const timeB = new Date(b.timestamp).getTime();
    return (
      (Number.isNaN(timeB) ? 0 : timeB) - (Number.isNaN(timeA) ? 0 : timeA)
    );
  });
}

function areUpdatesEqual(
  a: LiveBlogUpdateItem[],
  b: LiveBlogUpdateItem[]
): boolean {
  if (a === b) return true;
  if (!Array.isArray(a) || !Array.isArray(b)) return false;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (
      a[i].id !== b[i].id ||
      a[i].timestamp !== b[i].timestamp ||
      a[i].headline !== b[i].headline
    ) {
      return false;
    }
  }
  return true;
}

export function LiveBlogRealtimeProvider({
  articleId,
  slug,
  initialIsLiveBlog,
  initialUpdates,
  initialStatus,
  disableChime = false,
  children,
}: LiveBlogRealtimeProviderProps) {
  const [isLiveBlog, setIsLiveBlog] = useState<boolean>(() =>
    Boolean(initialIsLiveBlog)
  );
  const [updates, setUpdates] = useState<LiveBlogUpdateItem[]>(() =>
    sortUpdates(initialUpdates || [])
  );
  const [status, setStatus] = useState<'active' | 'concluded'>(() =>
    initialIsLiveBlog ? 'active' : initialStatus || 'concluded'
  );
  const [connectionState, setConnectionState] =
    useState<LiveBlogConnectionState>('connecting');
  const [newUpdatesCount, setNewUpdatesCount] = useState<number>(0);
  const [newestUpdateId, setNewestUpdateId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastUpdatedTime, setLastUpdatedTime] = useState<Date | null>(
    () => new Date()
  );

  const eventSourceRef = useRef<EventSource | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const highlightTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const updatesRef = useRef<LiveBlogUpdateItem[]>(
    sortUpdates(initialUpdates || [])
  );
  const disableChimeRef = useRef(disableChime);
  useEffect(() => {
    disableChimeRef.current = disableChime;
  }, [disableChime]);

  const clearNewUpdatesCount = useCallback(() => {
    setNewUpdatesCount(0);
  }, []);

  const scrollToLatest = useCallback(() => {
    setNewUpdatesCount(0);
    const target =
      document.getElementById('live-blog-timeline') ||
      document.getElementById('live-updates-carousel');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const queryId = encodeURIComponent(articleId || slug || '');
      const res = await fetch(`/api/realtime/live-blog/${queryId}/latest`, {
        cache: 'no-store',
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const fetchedUpdates = Array.isArray(json.data.liveUpdates)
            ? (json.data.liveUpdates as LiveBlogUpdateItem[])
            : [];
          setUpdates(sortUpdates(fetchedUpdates));
          if (typeof json.data.isLiveBlog === 'boolean') {
            setIsLiveBlog(json.data.isLiveBlog);
            setStatus(json.data.isLiveBlog ? 'active' : 'concluded');
          } else if (json.data.liveBlogStatus) {
            setStatus(json.data.liveBlogStatus);
            setIsLiveBlog(json.data.liveBlogStatus !== 'concluded');
          }
          setLastUpdatedTime(new Date());
          setNewUpdatesCount(0);
        }
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error refreshing live blog:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, [articleId, slug]);

  useEffect(() => {
    let isMounted = true;
    const targetIdentifier = articleId || slug || '';

    function connectSSE() {
      if (!isMounted || !targetIdentifier) return;

      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }

      setConnectionState('connecting');

      const url = `/api/realtime/live-blog/${encodeURIComponent(targetIdentifier)}`;
      const es = new EventSource(url);
      eventSourceRef.current = es;

      es.addEventListener('open', () => {
        if (!isMounted) return;
        setConnectionState('connected');
      });

      es.addEventListener('connected', (event: MessageEvent) => {
        if (!isMounted) return;
        setConnectionState('connected');
        try {
          const parsed = JSON.parse(event.data);
          if (parsed?.initialState?.liveUpdates) {
            const initialSorted = sortUpdates(parsed.initialState.liveUpdates);
            if (!areUpdatesEqual(updatesRef.current, initialSorted)) {
              updatesRef.current = initialSorted;
              setUpdates(initialSorted);
            }
            if (typeof parsed.initialState.isLiveBlog === 'boolean') {
              setIsLiveBlog((prev) =>
                prev === parsed.initialState.isLiveBlog
                  ? prev
                  : parsed.initialState.isLiveBlog
              );
              const nextStatus = parsed.initialState.isLiveBlog
                ? 'active'
                : 'concluded';
              setStatus((prev) => (prev === nextStatus ? prev : nextStatus));
            } else if (parsed.initialState.liveBlogStatus) {
              const nextStatus = parsed.initialState.liveBlogStatus;
              setStatus((prev) => (prev === nextStatus ? prev : nextStatus));
              const nextIsLive = nextStatus !== 'concluded';
              setIsLiveBlog((prev) =>
                prev === nextIsLive ? prev : nextIsLive
              );
            }
          }
        } catch {}
      });

      es.addEventListener('update', (event: MessageEvent) => {
        if (!isMounted) return;
        try {
          const payload = JSON.parse(event.data);

          if (typeof payload?.isLiveBlog === 'boolean') {
            setIsLiveBlog(payload.isLiveBlog);
            setStatus(payload.isLiveBlog ? 'active' : 'concluded');
          } else if (payload?.liveBlogStatus) {
            setStatus(payload.liveBlogStatus);
            setIsLiveBlog(payload.liveBlogStatus !== 'concluded');
          }

          if (Array.isArray(payload?.liveUpdates)) {
            const nextSorted = sortUpdates(payload.liveUpdates);
            const prevItems = updatesRef.current;
            const prevIds = new Set(prevItems.map((u) => u.id).filter(Boolean));

            const trulyNewItems = nextSorted.filter(
              (u) => u.id && !prevIds.has(u.id)
            );
            const diff =
              trulyNewItems.length > 0
                ? trulyNewItems.length
                : Math.max(0, nextSorted.length - prevItems.length);

            updatesRef.current = nextSorted;
            setUpdates(nextSorted);

            if (diff > 0) {
              const latestId = nextSorted[0]?.id || null;

              // Play real-time alert chime by default on new update unless disabled
              if (!disableChimeRef.current) {
                playLiveBlogChime();
              }

              if (!disableChimeRef.current) {
                setNewUpdatesCount((c) => c + diff);
              }

              if (latestId) {
                setNewestUpdateId(latestId);
                if (highlightTimeoutRef.current) {
                  clearTimeout(highlightTimeoutRef.current);
                }
                highlightTimeoutRef.current = setTimeout(() => {
                  if (isMounted) setNewestUpdateId(null);
                }, 8000);
              }
            }

            setLastUpdatedTime(new Date());
          }
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error('Error handling live blog update event:', err);
        }
      });

      es.onerror = () => {
        if (!isMounted) return;
        setConnectionState('reconnecting');
        es.close();
        eventSourceRef.current = null;

        if (retryTimeoutRef.current) {
          clearTimeout(retryTimeoutRef.current);
        }
        retryTimeoutRef.current = setTimeout(() => {
          if (isMounted) connectSSE();
        }, 3000);
      };
    }

    connectSSE();

    return () => {
      isMounted = false;
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current);
      }
    };
  }, [articleId, slug]);

  const value: LiveBlogRealtimeContextValue = {
    articleId,
    slug,
    isLiveBlog,
    status,
    updates,
    connectionState,
    newUpdatesCount,
    newestUpdateId,
    isRefreshing,
    lastUpdatedTime,
    refresh,
    clearNewUpdatesCount,
    scrollToLatest,
  };

  return (
    <LiveBlogRealtimeContext.Provider value={value}>
      {children}
    </LiveBlogRealtimeContext.Provider>
  );
}

export function useLiveBlogRealtime(): LiveBlogRealtimeContextValue {
  const context = useContext(LiveBlogRealtimeContext);
  if (!context) {
    throw new Error(
      'useLiveBlogRealtime must be used within a LiveBlogRealtimeProvider'
    );
  }
  return context;
}

export function useOptionalLiveBlogRealtime(): LiveBlogRealtimeContextValue | null {
  return useContext(LiveBlogRealtimeContext);
}
