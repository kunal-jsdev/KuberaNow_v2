'use client';

import {
  Fragment,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { FaCaretDown } from 'react-icons/fa';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { useCanHover } from '@/hooks/useCanHover';
import { useOutsideClick } from '@/hooks/useOutsideClick';
import { DropdownItem, DropdownProps } from '@/Payload/types';

import {
  claimNavMenu,
  isLinkClick,
  releaseNavMenu,
} from './navbar/navMenuCoordinator';
import { NavPreviewPanel } from './navbar/NavPreviewPanel';

const slugFromHref = (href: string) => href.replace(/^\//, '');

const VIEWPORT_MARGIN = 16;
const PREVIEW_GAP = 8;
const MIN_PREVIEW_WIDTH = 320;

// const ITEM_ICONS: Record<string, typeof FaChartBar> = {
//   Market: FaChartBar,
//   Stocks: FaChartLine,
//   'Bullion Market': FaLandmark,
//   Cryptocurrency: FaBitcoin,
//   'Mutual Funds': FaSyncAlt,
//   Currencies: FaCoins,
//   IPO: FaChartPie,
//   Commodities: FaBoxes,
// };

export function Dropdown({
  label,
  items,
  className,
  previewNews,
  showNew,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<DropdownItem | null>(null);
  const [mobileDrillDownItem, setMobileDrillDownItem] =
    useState<DropdownItem | null>(null);
  const [panelPos, setPanelPos] = useState<{
    top: number;
    left: number;
    /** Desktop only: which side of the list the story preview opens on. */
    previewSide: 'left' | 'right';
    /** Desktop only: preview width that fits that side; null on mobile. */
    previewWidth: number | null;
  } | null>(null);
  const pathname = usePathname();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const canHover = useCanHover();

  const close = useCallback(() => {
    setOpen(false);
    setHoveredItem(null);
    setMobileDrillDownItem(null);
    // Forget the old position so a reopen never flashes at a stale spot.
    setPanelPos(null);
  }, []);
  const ref = useOutsideClick<HTMLDivElement>(close);

  const hovering = useRef(false);

  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelClose = useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);
  const scheduleClose = useCallback(() => {
    cancelClose();
    closeTimer.current = setTimeout(close, 200);
  }, [cancelClose, close]);
  useEffect(() => cancelClose, [cancelClose]);

  // Closes right away, skipping the hover grace period.
  const dismiss = useCallback(() => {
    cancelClose();
    close();
  }, [cancelClose, close]);

  // Opening this dropdown closes any other header menu before paint, so two
  // menus never show at once when moving quickly between them.
  useLayoutEffect(() => {
    if (!open) return undefined;
    claimNavMenu(dismiss);
    return () => releaseNavMenu(dismiss);
  }, [open, dismiss]);

  const activeItem = mobileDrillDownItem ?? hoveredItem ?? items[0] ?? null;
  const hoveredPreviewItems = activeItem
    ? (previewNews?.[slugFromHref(activeItem.href)] ?? [])
    : [];
  const showPreview =
    !!previewNews && !!activeItem && hoveredPreviewItems.length > 0;
  // Position the panel for the widest layout the group can show, so hiding the
  // preview (hovering a page without stories) doesn't shift the list.
  const groupHasPreview =
    !!previewNews &&
    items.some(
      (item) => (previewNews[slugFromHref(item.href)]?.length ?? 0) > 0
    );

  const hasPanel = panelPos !== null;

  // Layout effect: positions are computed before paint. It runs once with an
  // estimated list width, mounts the panel, then runs again (hasPanel flips)
  // with the measured width, all before the browser draws a frame.
  useLayoutEffect(() => {
    if (!open) return undefined;
    const update = () => {
      if (!buttonRef.current) return;
      const rect = buttonRef.current.getBoundingClientRect();
      const vw = typeof window !== 'undefined' ? window.innerWidth : 0;
      const isWideUp = vw >= 1280;
      const isSmUp = vw >= 640;
      const top = rect.bottom + 4;

      // The list always opens right under the group button (kept on screen).
      const listWidth = listRef.current?.offsetWidth || 160;
      const listLeft = Math.min(
        Math.max(rect.left, VIEWPORT_MARGIN),
        Math.max(VIEWPORT_MARGIN, vw - listWidth - VIEWPORT_MARGIN)
      );

      // Mobile: the list stays under the button; a drilled-down preview
      // replaces it full width.
      if (!isSmUp || !groupHasPreview) {
        setPanelPos({
          top,
          left: !isSmUp && mobileDrillDownItem ? VIEWPORT_MARGIN : listLeft,
          previewSide: 'right',
          previewWidth: null,
        });
        return;
      }

      // Desktop: open the preview on the right of the list when it fits,
      // otherwise on the left; if neither fits, use the roomier side and
      // shrink the preview to it.
      const desiredWidth = isWideUp ? 938 : 748;
      const spaceRight =
        vw - VIEWPORT_MARGIN - (listLeft + listWidth + PREVIEW_GAP);
      const spaceLeft = listLeft - PREVIEW_GAP - VIEWPORT_MARGIN;

      let previewSide: 'left' | 'right';
      if (spaceRight >= desiredWidth) previewSide = 'right';
      else if (spaceLeft >= desiredWidth) previewSide = 'left';
      else previewSide = spaceRight >= spaceLeft ? 'right' : 'left';

      const space = previewSide === 'right' ? spaceRight : spaceLeft;
      const previewWidth = Math.max(
        Math.min(desiredWidth, space),
        MIN_PREVIEW_WIDTH
      );
      // Narrow tablets only: when even the roomier side is below the minimum
      // preview width, nudge the list just enough to keep both on screen.
      const shift = Math.max(previewWidth - space, 0);
      const finalListLeft =
        previewSide === 'right' ? listLeft - shift : listLeft + shift;

      setPanelPos({ top, left: finalListLeft, previewSide, previewWidth });
    };
    update();
    window.addEventListener('resize', update);
    // The nav row scrolls horizontally, which moves the group button.
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [open, groupHasPreview, mobileDrillDownItem, hasPanel]);

  const handleOpen = () => {
    if (hovering.current) return;
    setOpen((v) => {
      const next = !v;
      if (!next) {
        setHoveredItem(null);
        setMobileDrillDownItem(null);
      }
      return next;
    });
  };

  const isActive = items.some(
    (item) =>
      pathname === item.href ||
      (item.href !== '/' && pathname.startsWith(`${item.href}/`))
  );

  return (
    <div
      ref={ref}
      className={`relative ${className}`}
      onPointerEnter={(e) => {
        if (e.pointerType !== 'mouse') return;
        hovering.current = true;
        cancelClose();
        setOpen(true);
      }}
      onPointerLeave={(e) => {
        if (e.pointerType !== 'mouse') return;
        hovering.current = false;
        scheduleClose();
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape') close();
      }}
    >
      <button
        ref={buttonRef}
        onClick={handleOpen}
        className={`flex h-full shrink-0 items-center gap-1 border-b-2 px-3.5 py-3 whitespace-nowrap transition-colors ${showNew ? 'relative' : ''} ${
          open || isActive
            ? 'text-cyan-blue border-cyan-blue bg-background-hover'
            : 'hover:text-cyan-blue hover:border-cyan-blue hover:bg-background-hover border-transparent'
        }`}
      >
        {label}
        {showNew && <span className='new-badge-sparkle'>New</span>}
        <FaCaretDown
          className={`h-3 w-3 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open &&
        panelPos &&
        (() => {
          const listPanel = (
            <div
              ref={listRef}
              className={`shadow-dropdown w-max min-w-36 shrink-0 rounded-lg border border-gray-100 bg-white py-1 text-gray-800 ${
                mobileDrillDownItem ? 'hidden sm:block' : 'block'
              }`}
            >
              {items.map((item, index) => {
                const isItemActive = pathname === item.href;
                const isItemSelected =
                  !!previewNews && activeItem?.href === item.href;
                const itemHasPreview =
                  (previewNews?.[slugFromHref(item.href)]?.length ?? 0) > 0;
                // const ItemIcon = ITEM_ICONS[item.label];
                return (
                  <Fragment key={item.label}>
                    <Link
                      href={item.href}
                      onClick={(e) => {
                        if (itemHasPreview) {
                          if (
                            !canHover ||
                            (typeof window !== 'undefined' &&
                              window.innerWidth < 640)
                          ) {
                            e.preventDefault();
                            setMobileDrillDownItem(item);
                            setHoveredItem(item);
                            return;
                          }
                        }
                        close();
                      }}
                      onPointerEnter={(e) => {
                        if (e.pointerType !== 'mouse') return;
                        // Track every item, not just previewable ones, so
                        // hovering a page without stories hides the previous
                        // item's preview instead of leaving it stuck open.
                        setHoveredItem(item);
                      }}
                      className={`flex items-center gap-2 border-l-2 px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors hover:bg-gray-50 ${
                        isItemActive || isItemSelected
                          ? 'text-primary-navy border-primary-navy bg-blue-50 font-semibold'
                          : 'text-text-disclaimer hover:text-primary-navy border-transparent'
                      }`}
                    >
                      {/* {ItemIcon && (
                        <ItemIcon className='h-4 w-4 shrink-0 opacity-80' />
                      )} */}
                      {item.label}
                    </Link>

                    {index < items.length - 1 && (
                      <hr className='border-gray-200' />
                    )}
                  </Fragment>
                );
              })}
            </div>
          );

          const previewPanel = showPreview && activeItem && (
            <div
              className={`min-w-0 flex-1 sm:flex-none ${
                mobileDrillDownItem ? 'block' : 'hidden sm:block'
              }`}
              onClick={(e) => {
                if (isLinkClick(e)) dismiss();
              }}
              // Desktop: pinned beside the list (which anchors the panel), so
              // showing/hiding the preview never moves the list.
              style={
                panelPos.previewWidth
                  ? {
                      position: 'absolute',
                      top: 0,
                      width: panelPos.previewWidth,
                      [panelPos.previewSide === 'right' ? 'left' : 'right']:
                        `calc(100% + ${PREVIEW_GAP}px)`,
                    }
                  : undefined
              }
            >
              <NavPreviewPanel
                label={activeItem.label}
                href={activeItem.href}
                items={hoveredPreviewItems}
                parentLabel={label}
                onBack={() => setMobileDrillDownItem(null)}
                widthClassName='w-[calc(100vw-2rem)] sm:w-full'
              />
            </div>
          );

          return (
            <div
              className='scrollbar-hide fixed z-50 flex max-h-[calc(100vh-5rem)] items-start gap-2 overflow-y-auto max-sm:flex-col sm:flex-row sm:overflow-visible'
              style={{
                top: panelPos.top,
                left: panelPos.left,
                maxWidth: 'calc(100vw - 2rem)',
              }}
            >
              {listPanel}
              {previewPanel}
            </div>
          );
        })()}
    </div>
  );
}
