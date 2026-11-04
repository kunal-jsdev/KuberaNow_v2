'use client';

import { useEffect, useState, useTransition } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

export function NewsListTabs() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeCount, setActiveCount] = useState<number | null>(null);

  const tabParam = searchParams.get('tab');
  const isLiveBlogInUrl = tabParam === 'active-blogs';

  const urlTab: 'all' | 'active-blogs' = isLiveBlogInUrl
    ? 'active-blogs'
    : 'all';

  const [isPending, startTransition] = useTransition();
  const [pendingTarget, setPendingTarget] = useState<
    'all' | 'active-blogs' | null
  >(null);

  const [displayedTab, setDisplayedTab] = useState<'all' | 'active-blogs'>(
    urlTab
  );

  if (!isPending && displayedTab !== urlTab) {
    setDisplayedTab(urlTab);
  }

  const isActiveBlogsSelected = displayedTab === 'active-blogs';
  const isNavigatingToAll = isPending && pendingTarget === 'all';
  const isNavigatingToActiveBlogs =
    isPending && pendingTarget === 'active-blogs';

  useEffect(() => {
    let isMounted = true;
    const fetchActiveCount = async () => {
      try {
        const res = await fetch(
          '/api/news?where[or][0][isInActiveBlogs][equals]=true&where[or][1][isLiveBlog][equals]=true&where[or][2][publishedIsLiveBlog][equals]=true&draft=true&depth=0&limit=1'
        );
        if (!res.ok) return;
        const data = await res.json();
        if (isMounted) {
          setActiveCount(data.totalDocs ?? 0);
        }
      } catch {}
    };

    void fetchActiveCount();

    const interval = setInterval(() => {
      void fetchActiveCount();
    }, 30000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleSelectAllNews = () => {
    if (displayedTab === 'all' && !isPending) return;
    setPendingTarget('all');
    startTransition(() => {
      router.push('/d36985ec/collections/news?tab=all');
    });
  };

  const handleSelectActiveBlogs = () => {
    if (displayedTab === 'active-blogs' && !isPending) return;
    setPendingTarget('active-blogs');
    startTransition(() => {
      router.push('/d36985ec/collections/news?tab=active-blogs');
    });
  };

  const isSingleDigit =
    activeCount !== null && String(activeCount).length === 1;

  return (
    <div className='news-list-tabs-container'>
      <div className='news-list-tabs-nav'>
        <button
          type='button'
          role='tab'
          aria-selected={!isActiveBlogsSelected}
          onClick={handleSelectAllNews}
          className={`news-list-tab ${!isActiveBlogsSelected ? 'active' : ''} ${
            isNavigatingToAll ? 'loading' : ''
          }`}
        >
          <span className='news-list-tab-title'>
            <span>All News</span>
            {isNavigatingToAll && <span className='news-list-tab-spinner' />}
          </span>
          {!isActiveBlogsSelected && (
            <span className='news-list-tab-indicator' />
          )}
        </button>

        <button
          type='button'
          role='tab'
          aria-selected={isActiveBlogsSelected}
          onClick={handleSelectActiveBlogs}
          className={`news-list-tab ${isActiveBlogsSelected ? 'active' : ''} ${
            isNavigatingToActiveBlogs ? 'loading' : ''
          }`}
        >
          <span className='news-list-tab-title'>
            <span>Active Blogs</span>
            {isNavigatingToActiveBlogs && (
              <span className='news-list-tab-spinner' />
            )}
          </span>

          {activeCount !== null && activeCount > 0 && (
            <span
              className={`news-list-tab-count-badge ${isSingleDigit ? 'is-circle' : 'is-pill'}`}
            >
              {activeCount}
            </span>
          )}

          {isActiveBlogsSelected && (
            <span className='news-list-tab-indicator' />
          )}
        </button>
      </div>

      <style>{`
        .news-list-tabs-container {
          width: 100%;
          margin: 6px 0 16px 0;
        }

        .news-list-tabs-nav {
          display: flex;
          align-items: center;
          gap: 28px;
          width: 100%;
          border-bottom: 1px solid var(--theme-elevation-150, #27272a);
          padding: 0;
        }

        .news-list-tab {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 2px 12px 2px;
          background: transparent;
          border: none;
          outline: none;
          cursor: pointer;
          font-family: inherit;
          font-size: 14px;
          font-weight: 500;
          color: var(--theme-elevation-400, #8e8e93);
          transition: color 0.15s ease, opacity 0.15s ease;
          user-select: none;
          white-space: nowrap;
        }

        .news-list-tab:hover {
          color: var(--theme-elevation-700, #e4e4e7);
        }

        .news-list-tab.active {
          color: var(--theme-elevation-900, #ffffff);
          font-weight: 600;
        }

        .news-list-tab-indicator {
          position: absolute;
          bottom: -1px;
          left: 0;
          right: 0;
          height: 2px;
          background-color: var(--theme-elevation-900, #ffffff);
          border-radius: 1px;
        }

        .news-list-tab-title {
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .news-list-tab-count-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 18px;
          border-radius: 9999px;
          font-size: 11px;
          font-weight: 600;
          line-height: 1;
          text-align: center;
          background-color: rgba(16, 185, 129, 0.15);
          box-sizing: border-box;
          font-variant-numeric: tabular-nums;
          flex-shrink: 0;
          white-space: nowrap;
        }

        .news-list-tab-count-badge.is-circle {
          width: 18px;
          padding: 0;
          border-radius: 50%;
        }

        .news-list-tab-count-badge.is-pill {
          min-width: 22px;
          width: auto;
          padding: 0 6px;
        }

        .news-list-tab.loading {
          opacity: 0.85;
        }

        .news-list-tab-spinner {
          width: 10px;
          height: 10px;
          border: 1.5px solid rgba(255, 255, 255, 0.25);
          border-top-color: #ffffff;
          border-radius: 50%;
          animation: newsListTabSpinner 0.6s linear infinite;
          display: inline-block;
          flex-shrink: 0;
        }

        @keyframes newsListTabSpinner {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}

export default NewsListTabs;
