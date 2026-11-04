'use client';
import { useEffect, useState } from 'react';

import { useSelection } from '@payloadcms/ui';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export const VideoListHeader: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  let ratio = '';
  const currentRatio = searchParams.get('where[ratio][equals]');
  if (currentRatio) {
    ratio = currentRatio as string;
  } else {
    const str = searchParams.toString();
    if (str.includes('16%3A9') || str.includes('16:9')) {
      ratio = '16:9';
    } else if (str.includes('9%3A16') || str.includes('9:16')) {
      ratio = '9:16';
    }
  }

  const selection = useSelection();
  const count = selection?.count ?? 0;

  const [totalVideos, setTotalVideos] = useState<number | null>(null);
  const [pinnedCount, setPinnedCount] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchTotalVideos = async () => {
      try {
        const queryUrl = ratio
          ? `/api/videos?limit=1&where[ratio][equals]=${encodeURIComponent(ratio)}`
          : '/api/videos?limit=1';
        const response = await fetch(queryUrl);
        if (response.ok && isMounted) {
          const data = await response.json();
          setTotalVideos(data.totalDocs ?? 0);
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error fetching total videos:', error);
      }
    };

    fetchTotalVideos();
    return () => {
      isMounted = false;
    };
  }, [ratio]);

  useEffect(() => {
    let isMounted = true;
    const fetchPinnedVideos = async () => {
      try {
        const response = await fetch('/api/globals/pinned-videos');
        if (response.ok && isMounted) {
          const data = await response.json();
          const horizontalCount = Array.isArray(data?.horizontalVideos)
            ? data.horizontalVideos.length
            : 0;
          const verticalCount = Array.isArray(data?.verticalVideos)
            ? data.verticalVideos.length
            : 0;

          if (ratio === '16:9') {
            setPinnedCount(horizontalCount);
          } else if (ratio === '9:16') {
            setPinnedCount(verticalCount);
          } else {
            setPinnedCount(horizontalCount + verticalCount);
          }
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error fetching pinned videos count:', error);
      }
    };

    fetchPinnedVideos();
    return () => {
      isMounted = false;
    };
  }, [ratio]);

  const [searchTerm, setSearchTerm] = useState(
    searchParams.get('search') || ''
  );

  useEffect(() => {
    const handler = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      const currentSearch = params.get('search') || '';

      if (searchTerm !== currentSearch) {
        if (searchTerm) {
          params.set('search', searchTerm);
        } else {
          params.delete('search');
        }
        params.delete('page');
        router.push(`${pathname}?${params.toString()}`);
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [searchTerm, pathname, router, searchParams]);

  useEffect(() => {
    // Hide default header when no items are selected; show selection bar when items are selected
    const listHeaders = document.querySelectorAll<HTMLElement>(
      '.collection-list__header, .list-header'
    );
    listHeaders.forEach((header) => {
      if (count > 0) {
        header.style.display = 'flex';
        header.style.justifyContent = 'flex-end';
        header.style.marginBottom = '16px';
        header.style.width = '100%';
      } else {
        header.style.display = 'none';
      }
    });

    // Hide default title and create button by targeting their container
    const h1s = document.querySelectorAll('h1');
    h1s.forEach((h1) => {
      if (h1.textContent?.trim() === 'Videos') {
        const titleAndActions =
          h1.closest('.list-header__title-and-actions') || h1;
        if (titleAndActions && titleAndActions.tagName !== 'MAIN') {
          (titleAndActions as HTMLElement).style.display = 'none';
        }
      }
    });
  }, [count]);

  useEffect(() => {
    const removeThumbnailSort = () => {
      const thumbHeader =
        document.getElementById('heading-videoThumbnail') ||
        document.querySelector('th[id*="videoThumbnail"]');
      if (thumbHeader) {
        const buttons = thumbHeader.querySelectorAll(
          '.sort-column__buttons, .sort-column__button'
        );
        buttons.forEach((btn) => btn.remove());
        const sortWrapper = thumbHeader.querySelector('.sort-column');
        if (sortWrapper) {
          (sortWrapper as HTMLElement).style.cursor = 'default';
          (sortWrapper as HTMLElement).style.pointerEvents = 'none';
        }
      }
    };

    removeThumbnailSort();
    const observer = new MutationObserver(removeThumbnailSort);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div style={{ marginBottom: '20px' }}>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        table th,
        table td {
          text-align: center !important;
          vertical-align: middle !important;
        }
        table th button,
        table th > div,
        table th .sort-column__button {
          justify-content: center !important;
        }
        /* Disable and remove sorting from Video Thumbnail column header */
        #heading-videoThumbnail .sort-column__buttons,
        th#heading-videoThumbnail .sort-column__buttons,
        th[id*="videoThumbnail"] .sort-column__buttons,
        #heading-videoThumbnail button,
        th#heading-videoThumbnail button,
        th[id*="videoThumbnail"] button {
          display: none !important;
          visibility: hidden !important;
          pointer-events: none !important;
        }
        #heading-videoThumbnail .sort-column,
        th#heading-videoThumbnail .sort-column,
        th[id*="videoThumbnail"] .sort-column {
          cursor: default !important;
          pointer-events: none !important;
        }
        #heading-videoThumbnail,
        th#heading-videoThumbnail {
          cursor: default !important;
          user-select: none !important;
        }
        /* Hide Payload's default title and create button, and default controls */
        .list-header__title-and-actions,
        .view-header,
        .list-controls {
          display: none !important;
        }

        /* Hide collection-list__header when there is no active selection */
        .collection-list__header:not(:has(.list-selection)) {
          display: none !important;
        }

        /* Show selection toolbar when items are selected */
        .collection-list__header:has(.list-selection) {
          display: flex !important;
          justify-content: flex-end !important;
          margin-bottom: 16px !important;
          width: 100% !important;
        }
        .collection-list__header:has(.list-selection) .list-header__content {
          display: flex !important;
          justify-content: flex-end !important;
          width: 100% !important;
        }
        .collection-list__header:has(.list-selection) .list-header__actions {
          display: flex !important;
          margin-bottom: 0 !important;
        }
      `,
        }}
      />
      {/* Top section */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '32px',
        }}
      >
        <div>
          <h2
            style={{
              margin: '0 0 4px 0',
              fontSize: '24px',
              fontWeight: 600,
              color: '#fff',
            }}
          >
            Video collection
          </h2>
          <p style={{ margin: 0, fontSize: '13px', color: '#999' }}>
            Add YouTube or Instagram videos, download and manage your
            collection.
          </p>
        </div>
        <Link href='/d36985ec/collections/videos/create'>
          <button
            style={{
              background: '#333',
              color: '#fff',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            Add Video
          </button>
        </Link>
      </div>

      {/* Bottom section */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        {/* Stats */}
        <div style={{ display: 'flex', gap: '24px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              color: '#ccc',
            }}
          >
            <span
              style={{
                background: '#333',
                color: '#fff',
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 500,
              }}
            >
              {totalVideos !== null ? totalVideos : '...'}
            </span>
            <span style={{ fontWeight: 500, color: '#fff' }}>Total video</span>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              color: '#ccc',
            }}
          >
            <span
              style={{
                background: '#333',
                color: '#fff',
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 500,
              }}
            >
              {pinnedCount !== null ? pinnedCount : '...'}
            </span>
            <span style={{ color: '#999' }}>Pin video</span>
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '12px' }}>
          {/* Search Input */}
          <div style={{ position: 'relative', height: '44px', width: '500px' }}>
            <svg
              style={{
                position: 'absolute',
                left: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '14px',
                height: '14px',
                fill: '#888',
              }}
              viewBox='0 0 24 24'
            >
              <path d='M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z' />
            </svg>
            <input
              type='text'
              placeholder='Search Title'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                background: '#202528',
                border: '1px solid #444444',
                color: '#fff',
                padding: '12px 10px 12px 32px',
                height: '44px',
                boxSizing: 'border-box',
                borderRadius: '4px',
                fontSize: '13px',
                outline: 'none',
                width: '100%',
              }}
            />
          </div>

          {/* Ratio Filter Select */}
          <select
            value={ratio}
            onChange={(e) => {
              const value = e.target.value;
              const params = new URLSearchParams(searchParams.toString());

              const keysToDelete: string[] = [];
              params.forEach((_, key) => {
                if (key.includes('[ratio]')) {
                  keysToDelete.push(key);
                }
              });
              keysToDelete.forEach((key) => params.delete(key));

              if (value) {
                params.set('where[ratio][equals]', value);
              }

              params.delete('page');
              router.push(`${pathname}?${params.toString()}`);
            }}
            style={{
              appearance: 'none',
              WebkitAppearance: 'none',
              MozAppearance: 'none',
              backgroundColor: '#202528',
              backgroundImage:
                "url(\"data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23ccc' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\")",
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 10px center',
              backgroundSize: '12px',
              border: '1px solid #444444',
              color: '#ccc',
              padding: '8px 30px 8px 10px',
              height: '44px',
              width: '171px',
              boxSizing: 'border-box',
              borderRadius: '4px',
              fontSize: '13px',
              outline: 'none',
              cursor: 'pointer',
              opacity: 1,
            }}
          >
            <option value=''>All Videos</option>
            <option value='16:9'>Horizontal (16:9)</option>
            <option value='9:16'>Vertical (9:16)</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default VideoListHeader;
