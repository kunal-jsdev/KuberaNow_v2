'use client';

import {
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import { useAuth } from '@payloadcms/ui';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface ActiveLiveBlogDoc {
  id: string;
  title: string;
  slug: string;
}

type SnappedEdge = 'top' | 'bottom' | 'left' | 'right';

interface SavedPosition {
  edge: SnappedEdge;
  ratio: number;
}

const BUTTON_SIZE = 40;
const MENU_WIDTH = 240;
const EDGE_PADDING = 16;
const STORAGE_KEY = 'kuberanow_live_blogs_badge_pos_v2';
const DEFAULT_CONFIG: SavedPosition = { edge: 'top', ratio: 0.5 };

function calculatePixelCoords(
  edge: SnappedEdge,
  ratio: number
): { x: number; y: number } {
  if (typeof window === 'undefined') return { x: 0, y: EDGE_PADDING };
  const maxX = Math.max(
    EDGE_PADDING,
    window.innerWidth - BUTTON_SIZE - EDGE_PADDING
  );
  const maxY = Math.max(
    EDGE_PADDING,
    window.innerHeight - BUTTON_SIZE - EDGE_PADDING
  );
  const availWidth = Math.max(0, maxX - EDGE_PADDING);
  const availHeight = Math.max(0, maxY - EDGE_PADDING);
  const clampedRatio = Math.max(0, Math.min(1, ratio));

  switch (edge) {
    case 'top':
      return {
        x: EDGE_PADDING + availWidth * clampedRatio,
        y: EDGE_PADDING,
      };
    case 'bottom':
      return {
        x: EDGE_PADDING + availWidth * clampedRatio,
        y: maxY,
      };
    case 'left':
      return {
        x: EDGE_PADDING,
        y: EDGE_PADDING + availHeight * clampedRatio,
      };
    case 'right':
      return {
        x: maxX,
        y: EDGE_PADDING + availHeight * clampedRatio,
      };
    default:
      return {
        x: Math.round((window.innerWidth - BUTTON_SIZE) / 2),
        y: EDGE_PADDING,
      };
  }
}

export function LiveBlogsDevToolsWidget() {
  const { user } = useAuth();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [blogs, setBlogs] = useState<ActiveLiveBlogDoc[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [hasLoaded, setHasLoaded] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const [hasCustomPosition, setHasCustomPosition] = useState(false);
  const [position, setPosition] = useState<{ x: number; y: number }>({
    x: 0,
    y: EDGE_PADDING,
  });

  const edgeConfigRef = useRef<SavedPosition>(DEFAULT_CONFIG);
  const currentPosRef = useRef<{ x: number; y: number }>(position);

  const [isDragging, setIsDragging] = useState(false);
  const isDraggingRef = useRef(false);
  const wasDraggingRef = useRef(false);
  const dragStartRef = useRef<{
    pointerX: number;
    pointerY: number;
    startX: number;
    startY: number;
  } | null>(null);

  useEffect(() => {
    currentPosRef.current = position;
  }, [position]);

  useEffect(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem('kuberanow_live_blogs_badge_pos');
    } catch {}
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (!hasCustomPosition) return;
      const resizedCoords = calculatePixelCoords(
        edgeConfigRef.current.edge,
        edgeConfigRef.current.ratio
      );
      currentPosRef.current = resizedCoords;
      setPosition(resizedCoords);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [hasCustomPosition]);

  const snapToEdge = useCallback(
    (currentX: number, currentY: number): { x: number; y: number } => {
      if (typeof window === 'undefined') return { x: currentX, y: currentY };
      const maxX = Math.max(
        EDGE_PADDING,
        window.innerWidth - BUTTON_SIZE - EDGE_PADDING
      );
      const maxY = Math.max(
        EDGE_PADDING,
        window.innerHeight - BUTTON_SIZE - EDGE_PADDING
      );
      const availWidth = Math.max(1, maxX - EDGE_PADDING);
      const availHeight = Math.max(1, maxY - EDGE_PADDING);

      const distTop = Math.abs(currentY - EDGE_PADDING);
      const distBottom = Math.abs(maxY - currentY);
      const distLeft = Math.abs(currentX - EDGE_PADDING);
      const distRight = Math.abs(maxX - currentX);

      const minDist = Math.min(distTop, distBottom, distLeft, distRight);

      let edge: SnappedEdge = 'top';
      let ratio = 0.5;

      if (minDist === distTop) {
        edge = 'top';
        ratio = Math.max(
          0,
          Math.min(1, (currentX - EDGE_PADDING) / availWidth)
        );
      } else if (minDist === distBottom) {
        edge = 'bottom';
        ratio = Math.max(
          0,
          Math.min(1, (currentX - EDGE_PADDING) / availWidth)
        );
      } else if (minDist === distLeft) {
        edge = 'left';
        ratio = Math.max(
          0,
          Math.min(1, (currentY - EDGE_PADDING) / availHeight)
        );
      } else {
        edge = 'right';
        ratio = Math.max(
          0,
          Math.min(1, (currentY - EDGE_PADDING) / availHeight)
        );
      }

      setHasCustomPosition(true);
      edgeConfigRef.current = { edge, ratio };
      return calculatePixelCoords(edge, ratio);
    },
    []
  );

  const loadActiveBlogs = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch(
        `/api/news?where[or][0][isInActiveBlogs][equals]=true&where[or][1][isLiveBlog][equals]=true&where[or][2][publishedIsLiveBlog][equals]=true&draft=true&depth=0&limit=15&sort=-updatedAt&_cb=${Date.now()}`,
        {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            Pragma: 'no-cache',
          },
        }
      );
      if (!res.ok) return;
      const data = await res.json();
      const docs: ActiveLiveBlogDoc[] = data.docs || [];
      const count = data.totalDocs ?? docs.length;
      setBlogs(docs);
      setTotalCount(count);
      setHasLoaded(true);
      if (count === 0) {
        setIsOpen(false);
      }
    } catch {
      setHasLoaded(true);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const initialTimer = setTimeout(() => {
      void loadActiveBlogs();
    }, 0);

    const interval = setInterval(() => {
      void loadActiveBlogs();
    }, 4000);

    const onFocusOrVisible = () => {
      if (document.visibilityState === 'visible') {
        void loadActiveBlogs();
      }
    };
    window.addEventListener('focus', onFocusOrVisible);
    document.addEventListener('visibilitychange', onFocusOrVisible);

    const onLiveBlogsUpdate = () => {
      void loadActiveBlogs();
      setTimeout(() => void loadActiveBlogs(), 500);
    };
    window.addEventListener('kuberanow:live-blogs-updated', onLiveBlogsUpdate);

    const onFormSubmit = () => {
      setTimeout(() => void loadActiveBlogs(), 500);
      setTimeout(() => void loadActiveBlogs(), 1500);
    };
    document.addEventListener('submit', onFormSubmit, true);

    const originalFetch = window.fetch;
    const interceptedFetch = async function (
      ...args: Parameters<typeof window.fetch>
    ) {
      const response = await originalFetch.apply(window, args);
      try {
        const rawUrl =
          typeof args[0] === 'string'
            ? args[0]
            : (args[0] as Request)?.url || '';
        const method = (args[1]?.method || 'GET').toUpperCase();
        if (
          rawUrl.includes('/api/news') &&
          ['POST', 'PATCH', 'PUT', 'DELETE'].includes(method)
        ) {
          void loadActiveBlogs();
          setTimeout(() => void loadActiveBlogs(), 500);
          setTimeout(() => void loadActiveBlogs(), 1500);
        }
      } catch {}
      return response;
    };
    window.fetch = interceptedFetch;

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
      window.removeEventListener('focus', onFocusOrVisible);
      document.removeEventListener('visibilitychange', onFocusOrVisible);
      window.removeEventListener(
        'kuberanow:live-blogs-updated',
        onLiveBlogsUpdate
      );
      document.removeEventListener('submit', onFormSubmit, true);
      if (window.fetch === interceptedFetch) {
        window.fetch = originalFetch;
      }
    };
  }, [user, pathname, loadActiveBlogs]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handlePointerDown = (e: ReactPointerEvent) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;

    const rect = containerRef.current?.getBoundingClientRect();
    const startX = rect ? rect.left : currentPosRef.current.x;
    const startY = rect ? rect.top : currentPosRef.current.y;

    dragStartRef.current = {
      pointerX: e.clientX,
      pointerY: e.clientY,
      startX,
      startY,
    };
    isDraggingRef.current = false;
  };

  useEffect(() => {
    const onPointerMove = (e: PointerEvent) => {
      if (!dragStartRef.current) return;

      const deltaX = e.clientX - dragStartRef.current.pointerX;
      const deltaY = e.clientY - dragStartRef.current.pointerY;

      if (!isDraggingRef.current) {
        if (Math.hypot(deltaX, deltaY) > 5) {
          isDraggingRef.current = true;
          setIsDragging(true);
          setHasCustomPosition(true);
          setIsOpen(false);
          document.body.style.cursor = 'grabbing';
          document.body.style.userSelect = 'none';
        } else {
          return;
        }
      }

      const maxX = Math.max(
        EDGE_PADDING,
        window.innerWidth - BUTTON_SIZE - EDGE_PADDING
      );
      const maxY = Math.max(
        EDGE_PADDING,
        window.innerHeight - BUTTON_SIZE - EDGE_PADDING
      );

      const rawX = dragStartRef.current.startX + deltaX;
      const rawY = dragStartRef.current.startY + deltaY;

      const freeX = Math.max(EDGE_PADDING, Math.min(maxX, rawX));
      const freeY = Math.max(EDGE_PADDING, Math.min(maxY, rawY));

      currentPosRef.current = { x: freeX, y: freeY };
      setPosition({ x: freeX, y: freeY });
    };

    const onPointerUp = () => {
      if (!dragStartRef.current) return;

      const didDrag = isDraggingRef.current;
      dragStartRef.current = null;
      isDraggingRef.current = false;
      setIsDragging(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';

      if (didDrag) {
        wasDraggingRef.current = true;
        setTimeout(() => {
          wasDraggingRef.current = false;
        }, 150);

        const targetPos = snapToEdge(
          currentPosRef.current.x,
          currentPosRef.current.y
        );
        currentPosRef.current = targetPos;
        setPosition(targetPos);
      }
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);

    return () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
    };
  }, [snapToEdge]);

  if (!user || !hasLoaded || totalCount === 0) return null;

  const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;

  const isNearTop = hasCustomPosition
    ? position.y <
      (typeof window !== 'undefined' ? window.innerHeight / 2 : 400)
    : true;

  const leftOverflowThreshold = MENU_WIDTH / 2 + EDGE_PADDING - BUTTON_SIZE / 2;
  const rightOverflowThreshold =
    screenWidth - (MENU_WIDTH / 2 + EDGE_PADDING + BUTTON_SIZE / 2);

  let horizontalPlacementStyle: CSSProperties;
  if (!hasCustomPosition) {
    horizontalPlacementStyle = {
      left: `${(BUTTON_SIZE - MENU_WIDTH) / 2}px`,
    };
  } else if (position.x < leftOverflowThreshold) {
    horizontalPlacementStyle = { left: 0 };
  } else if (position.x > rightOverflowThreshold) {
    horizontalPlacementStyle = { right: 0 };
  } else {
    horizontalPlacementStyle = {
      left: `${(BUTTON_SIZE - MENU_WIDTH) / 2}px`,
    };
  }

  return (
    <div
      ref={containerRef}
      className='live-blogs-devtools-root'
      style={{
        position: 'fixed',
        left: hasCustomPosition ? `${position.x}px` : '50%',
        top: hasCustomPosition ? `${position.y}px` : `${EDGE_PADDING}px`,
        transform: hasCustomPosition ? 'none' : 'translateX(-50%)',
        zIndex: 99999,
        opacity: 1,
        pointerEvents: 'auto',
        transition: isDragging
          ? 'none'
          : 'left 0.28s cubic-bezier(0.16, 1, 0.3, 1), top 0.28s cubic-bezier(0.16, 1, 0.3, 1), transform 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
        userSelect: 'none',
      }}
    >
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            ...horizontalPlacementStyle,
            ...(isNearTop
              ? { top: `${BUTTON_SIZE + 8}px` }
              : { bottom: `${BUTTON_SIZE + 8}px` }),
            zIndex: 100000,
          }}
        >
          <div
            className='live-blogs-devtools-menu'
            style={{
              width: `${MENU_WIDTH}px`,
              backgroundColor: '#0a0a0a',
              borderRadius: '6px',
              border: '1px solid #121212',
              overflow: 'hidden',
              boxShadow:
                '0 0 0 1px rgba(255, 255, 255, 0.08), 0 16px 36px -4px rgba(0, 0, 0, 0.85), 0 6px 16px -2px rgba(0, 0, 0, 0.6)',
              color: '#ededed',
              animation: isNearTop
                ? 'liveBlogsMenuInDown 0.12s cubic-bezier(0.16, 1, 0.3, 1)'
                : 'liveBlogsMenuInUp 0.12s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <div
              style={{
                backgroundColor: '#0a0a0a',
                padding: '4px',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
                maxHeight: '260px',
                overflowY: 'auto',
              }}
            >
              {blogs.length === 0 ? (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    color: '#71717a',
                    fontSize: '13px',
                    fontWeight: 500,
                  }}
                >
                  <span>No live blogs active</span>
                  <span style={{ fontSize: '12px', color: '#52525b' }}>0</span>
                </div>
              ) : (
                blogs.slice(0, 4).map((item) => (
                  <Link
                    key={item.id}
                    href={`/d36985ec/collections/news/${item.id}`}
                    onClick={() => setIsOpen(false)}
                    className='live-blogs-menu-item'
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      textDecoration: 'none',
                      color: '#ededed',
                      fontSize: '13px',
                      fontWeight: 500,
                      lineHeight: '1.4',
                      transition:
                        'background-color 0.12s ease, color 0.12s ease',
                    }}
                  >
                    <span
                      style={{
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        minWidth: 0,
                        flex: 1,
                        maxWidth: '185px',
                      }}
                    >
                      {item.title}
                    </span>

                    <svg
                      width='14'
                      height='14'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='#71717a'
                      strokeWidth='2'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      style={{ flexShrink: 0, transition: 'stroke 0.12s ease' }}
                    >
                      <polyline points='9 18 15 12 9 6' />
                    </svg>
                  </Link>
                ))
              )}
            </div>

            <div
              style={{
                height: '1px',
                backgroundColor: '#2e2e2e',
                width: '100%',
              }}
            />

            <div
              style={{
                backgroundColor: '#000000',
                padding: '4px',
              }}
            >
              <Link
                href='/d36985ec/collections/news?tab=active-blogs'
                onClick={() => setIsOpen(false)}
                className='live-blogs-menu-item'
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  color: '#ededed',
                  fontSize: '13px',
                  fontWeight: 500,
                  lineHeight: '1.4',
                  transition: 'background-color 0.12s ease, color 0.12s ease',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <span>All Live Blogs</span>
                </div>

                <svg
                  width='14'
                  height='14'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='#71717a'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  style={{ flexShrink: 0, transition: 'stroke 0.12s ease' }}
                >
                  <circle
                    cx='12'
                    cy='12'
                    r='3'
                  />
                  <path d='M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z' />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      )}

      <button
        type='button'
        onPointerDown={handlePointerDown}
        onClickCapture={(e) => {
          if (wasDraggingRef.current || isDraggingRef.current) {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
        onClick={(e) => {
          e.stopPropagation();
          if (wasDraggingRef.current || isDraggingRef.current) {
            return;
          }
          setIsOpen((prev) => !prev);
        }}
        onDoubleClick={(e) => {
          e.stopPropagation();
          setHasCustomPosition(false);
        }}
        aria-label={
          totalCount > 9
            ? 'Active Live Blogs (9+)'
            : `Active Live Blogs (${totalCount})`
        }
        style={{
          position: 'relative',
          width: `${BUTTON_SIZE}px`,
          height: `${BUTTON_SIZE}px`,
          borderRadius: '50%',
          backgroundColor: totalCount > 0 ? '#c8332f' : '#000000',
          color: '#ffffff',
          border:
            totalCount > 0
              ? '1px solid rgba(255, 255, 255, 0.3)'
              : '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow:
            totalCount > 0
              ? '0 4px 14px rgba(200, 51, 47, 0.5), 0 0 0 1px rgba(0, 0, 0, 0.6)'
              : '0 4px 14px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(0, 0, 0, 0.8)',
          cursor: isDragging ? 'grabbing' : 'pointer',
          touchAction: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 0,
          outline: 'none',
          transition: 'transform 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onMouseEnter={(e) => {
          if (!isDragging) {
            e.currentTarget.style.transform = 'scale(1.05)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isDragging) {
            e.currentTarget.style.transform = 'scale(1)';
          }
        }}
      >
        <svg
          width='20'
          height='20'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
          className={totalCount > 0 ? 'live-blogs-widget-icon-active' : ''}
          style={{
            color: '#ffffff',
            transition: 'color 0.15s ease',
            display: 'block',
            transformOrigin: 'center',
          }}
        >
          <path
            d='M4.9 19.1C1.2 15.4 1.2 9.5 4.9 5.8'
            opacity='0.9'
          />
          <path
            d='M19.1 5.8c3.7 3.7 3.7 9.6 0 13.3'
            opacity='0.9'
          />
          <path d='M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5' />
          <path d='M16.2 7.7c2.3 2.3 2.3 6.1 0 8.5' />
          <circle
            cx='12'
            cy='12'
            r='2'
            fill='#ffffff'
          />
        </svg>

        {totalCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-3px',
              right: '-3px',
              minWidth: totalCount > 9 ? '18px' : '16px',
              height: '16px',
              padding: totalCount > 9 ? '0 3px' : '0 4px',
              borderRadius: '9999px',
              backgroundColor: '#000000',
              color: '#ffffff',
              fontSize: totalCount > 9 ? '9px' : '10px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid #ffffff',
              boxShadow: '0 2px 5px rgba(0, 0, 0, 0.4)',
              lineHeight: 1,
              letterSpacing: totalCount > 9 ? '-0.5px' : 'normal',
            }}
          >
            {totalCount > 9 ? '9+' : totalCount}
          </span>
        )}
      </button>

      <style>{`
        @keyframes liveBlogsMenuInDown {
          from {
            opacity: 0;
            transform: translateY(-4px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes liveBlogsMenuInUp {
          from {
            opacity: 0;
            transform: translateY(4px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .live-blogs-menu-item:hover {
          background-color: rgba(255, 255, 255, 0.08) !important;
          color: #ffffff !important;
        }

        .live-blogs-menu-item:hover svg {
          stroke: #ffffff !important;
        }

        .live-blogs-widget-icon-active {
          transform-origin: center;
          animation: live-blogs-widget-heartbeat 1.5s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
        }

        @keyframes live-blogs-widget-heartbeat {
          0% {
            transform: scale(1);
          }
          14% {
            transform: scale(1.15);
          }
          28% {
            transform: scale(1);
          }
          42% {
            transform: scale(1.22);
          }
          70% {
            transform: scale(1);
          }
          100% {
            transform: scale(1);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .live-blogs-widget-icon-active {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}

export default function ActiveLiveBlogsBadge({
  children,
}: {
  children?: React.ReactNode;
}) {
  return (
    <>
      {children}
      {/* <LiveBlogsDevToolsWidget /> */}
    </>
  );
}
