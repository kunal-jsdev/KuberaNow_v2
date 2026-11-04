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

interface GlobalLiveBlogSyncContextValue {
  liveMap: Record<string, boolean>;
  isArticleLive: (
    identifier?: string | number | null,
    fallback?: boolean
  ) => boolean;
}

const GlobalLiveBlogSyncContext =
  createContext<GlobalLiveBlogSyncContextValue | null>(null);

export function GlobalLiveBlogSyncProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [liveMap, setLiveMap] = useState<Record<string, boolean>>({});
  const esRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef<number>(0);

  useEffect(() => {
    let isMounted = true;

    function connect() {
      if (!isMounted) return;

      if (esRef.current) {
        esRef.current.close();
        esRef.current = null;
      }

      try {
        const es = new EventSource('/api/realtime/live-blog/global');
        esRef.current = es;

        es.addEventListener('open', () => {
          retryCountRef.current = 0;
        });

        es.addEventListener('status_change', (event: MessageEvent) => {
          if (!isMounted) return;
          try {
            const data = JSON.parse(event.data);
            if (data && typeof data.isLiveBlog === 'boolean') {
              const active =
                Boolean(data.isLiveBlog) && data.liveBlogStatus !== 'concluded';
              setLiveMap((prev) => {
                const next = { ...prev };
                if (data.articleId) {
                  next[String(data.articleId).toLowerCase()] = active;
                }
                if (data.article_id) {
                  next[String(data.article_id).toLowerCase()] = active;
                }
                if (data.slug) {
                  next[String(data.slug).toLowerCase()] = active;
                }
                return next;
              });
            }
          } catch {}
        });

        es.addEventListener('error', () => {
          if (esRef.current) {
            esRef.current.close();
            esRef.current = null;
          }
          if (!isMounted) return;

          // Reconnect with exponential backoff up to 10 seconds
          const delay = Math.min(
            10000,
            1500 * Math.pow(1.5, retryCountRef.current++)
          );
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
          }
          reconnectTimeoutRef.current = setTimeout(connect, delay);
        });
      } catch {
        const delay = Math.min(
          10000,
          2000 * Math.pow(1.5, retryCountRef.current++)
        );
        reconnectTimeoutRef.current = setTimeout(connect, delay);
      }
    }

    connect();

    return () => {
      isMounted = false;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (esRef.current) {
        esRef.current.close();
        esRef.current = null;
      }
    };
  }, []);

  const isArticleLive = useCallback(
    (identifier?: string | number | null, fallback = false): boolean => {
      if (!identifier) return fallback;
      const key = String(identifier).trim().toLowerCase();
      if (key in liveMap) {
        return liveMap[key];
      }
      return fallback;
    },
    [liveMap]
  );

  return (
    <GlobalLiveBlogSyncContext.Provider value={{ liveMap, isArticleLive }}>
      {children}
    </GlobalLiveBlogSyncContext.Provider>
  );
}

export function useIsArticleLive(
  identifier?: string | number | null,
  fallback = false
): boolean {
  const ctx = useContext(GlobalLiveBlogSyncContext);
  if (!ctx) return fallback;
  return ctx.isArticleLive(identifier, fallback);
}
