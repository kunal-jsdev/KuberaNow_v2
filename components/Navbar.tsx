'use client';

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { IoMdMenu } from 'react-icons/io';
import { IoHome } from 'react-icons/io5';

import clsx from 'clsx';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { MAIN_NAV_LINKS, NAV_PREVIEW_ENABLED } from '@/constants/navigation';
import { useCanHover } from '@/hooks/useCanHover';
import { useOutsideClick } from '@/hooks/useOutsideClick';
import type {
  NavCategoryLink,
  NavGroupLink,
  StaticHeaderDropdown,
} from '@/Payload/lib/utilities/getNavConfig';
import type { NewsCardItem } from '@/Payload/lib/utilities/getNewsByCategory';

import SocialLinks from './common/SocialLinks';
import { Dropdown } from './Dropdown';
import {
  claimNavMenu,
  dismissActiveNavMenu,
  isLinkClick,
  releaseNavMenu,
} from './navbar/navMenuCoordinator';
import { NavPreviewPanel } from './navbar/NavPreviewPanel';
import SideMenu from './SideMenu';

const AdvertiseWithUsModal = dynamic(
  () => import('./advertise/AdvertiseWithUsModal'),
  { ssr: false }
);

const HEADER_NAV_LIMIT = 8;

type NavbarProps = {
  navPreviewNews?: Record<string, NewsCardItem[]>;
  staticHeaderDropdown?: StaticHeaderDropdown | null;
  staticHamburgerDropdown?: StaticHeaderDropdown | null;
  headerCategories?: NavCategoryLink[];
  headerGroups?: NavGroupLink[];
  headerOrdered?: (NavCategoryLink | NavGroupLink)[];
  hamburgerCategories?: NavCategoryLink[];
  hamburgerGroups?: NavGroupLink[];
  hamburgerOrdered?: (NavCategoryLink | NavGroupLink)[];
};

type ActivePreview = {
  label: string;
  href: string;
  items: readonly NewsCardItem[];
  rect: DOMRect;
};

type NavPreviewLink = Omit<ActivePreview, 'rect'> & {
  key: string;
  isActive: boolean;
  showNew?: boolean;
  /** Shown only when the link has articles (categories); other pages show nothing. */
  hasPreview: boolean;
};

type NavEntry =
  | { type: 'link'; link: NavPreviewLink }
  | { type: 'group'; group: NavGroupLink };

function NewBadge() {
  return <span className='new-badge-sparkle'>New</span>;
}

function isGroupLink(
  item: NavCategoryLink | NavGroupLink
): item is NavGroupLink {
  return 'items' in item && Array.isArray((item as NavGroupLink).items);
}

const slugFromHref = (href: string) => href.replace(/^\//, '');

const PREVIEW_MARGIN = 16;

function getPreviewPosition(rect: DOMRect) {
  const vw = typeof window !== 'undefined' ? window.innerWidth : 0;
  const isSmUp = vw >= 640;
  const isWideUp = vw >= 1280;
  let panelWidth: number;
  if (!isSmUp) {
    panelWidth = Math.max(vw - PREVIEW_MARGIN * 2, 0);
  } else if (isWideUp) {
    panelWidth = 938;
  } else {
    panelWidth = 748;
  }

  const left = Math.min(
    Math.max(rect.left, PREVIEW_MARGIN),
    Math.max(vw - panelWidth - PREVIEW_MARGIN, PREVIEW_MARGIN)
  );

  return { left, top: rect.bottom + 4 };
}

export default function Navbar({
  navPreviewNews = {},
  staticHeaderDropdown,
  staticHamburgerDropdown,
  headerCategories = [],
  headerGroups = [],
  headerOrdered = [],
  hamburgerCategories = [],
  hamburgerGroups = [],
  hamburgerOrdered = [],
}: NavbarProps) {
  const pathname = usePathname();
  const [advertiseModalOpen, setAdvertiseModalOpen] = useState<boolean>(false);
  const [sideMenuOpen, setSideMenuOpen] = useState<boolean>(false);
  const [preview, setPreview] = useState<ActivePreview | null>(null);

  const canHover = useCanHover();
  const closePreview = useCallback(() => setPreview(null), []);
  const navRef = useOutsideClick<HTMLElement>(closePreview);

  const previewCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelPreviewClose = useCallback(() => {
    if (previewCloseTimer.current) {
      clearTimeout(previewCloseTimer.current);
      previewCloseTimer.current = null;
    }
  }, []);
  const schedulePreviewClose = useCallback(
    (label: string) => {
      cancelPreviewClose();
      previewCloseTimer.current = setTimeout(() => {
        setPreview((curr) => (curr?.label === label ? null : curr));
      }, 200);
    },
    [cancelPreviewClose]
  );
  useEffect(() => cancelPreviewClose, [cancelPreviewClose]);

  // Closes right away, skipping the hover grace period.
  const dismissPreview = useCallback(() => {
    cancelPreviewClose();
    closePreview();
  }, [cancelPreviewClose, closePreview]);

  // Showing a link preview closes any open group dropdown before paint.
  const isPreviewOpen = preview !== null;
  useLayoutEffect(() => {
    if (!isPreviewOpen) return undefined;
    claimNavMenu(dismissPreview);
    return () => releaseNavMenu(dismissPreview);
  }, [isPreviewOpen, dismissPreview]);

  // Any navigation (story click, back/forward) closes the open header menu,
  // whether it's this link preview or a group dropdown.
  useEffect(() => {
    dismissActiveNavMenu();
  }, [pathname]);

  // Header items come from the Payload nav-config global (static links only as
  // a fallback).
  const navEntries = useMemo<NavEntry[]>(() => {
    const cmsItems =
      headerOrdered.length > 0
        ? headerOrdered
        : [...headerCategories, ...headerGroups];
    const baseItems: (NavCategoryLink | NavGroupLink)[] =
      cmsItems.length > 0
        ? cmsItems.slice(0, HEADER_NAV_LIMIT)
        : MAIN_NAV_LINKS.map((link) => ({
            ...link,
            slug: slugFromHref(link.href),
          }));

    return baseItems.map((item): NavEntry => {
      if (isGroupLink(item)) return { type: 'group', group: item };

      const items = NAV_PREVIEW_ENABLED
        ? (navPreviewNews[slugFromHref(item.href)] ?? [])
        : [];

      return {
        type: 'link',
        link: {
          key: item.slug,
          label: item.label,
          href: item.href,
          showNew: item.showNew,
          isActive: pathname === item.href,
          hasPreview: items.length > 0,
          items,
        },
      };
    });
  }, [headerOrdered, headerCategories, headerGroups, pathname, navPreviewNews]);

  const headerStaticDropdown = staticHeaderDropdown ?? {
    label: 'Kubera Now',
    enabled: true,
  };

  const allHamburgerItems = useMemo(() => {
    const items =
      hamburgerOrdered.length > 0
        ? hamburgerOrdered
        : [...hamburgerCategories, ...hamburgerGroups];
    return items.length > 0 ? items : null;
  }, [hamburgerOrdered, hamburgerCategories, hamburgerGroups]);

  return (
    <>
      <SideMenu
        isOpen={sideMenuOpen}
        onClose={() => setSideMenuOpen(false)}
        onOpenAdvertiseModal={() => setAdvertiseModalOpen(true)}
        staticHamburgerDropdown={staticHamburgerDropdown}
        dynamicNavItems={allHamburgerItems}
      />
      <nav
        ref={navRef}
        className='from-dark-navy2 to-primary-navy relative w-full overflow-visible border-b border-[#00FFEE] bg-linear-to-r text-white'
      >
        <div className='mx-auto flex w-full items-stretch px-4 2xl:px-0'>
          <div className='flex w-full justify-center'>
            <div className='flex w-full max-w-316 min-w-0 justify-between gap-2 text-sm font-semibold tracking-normal'>
              <div className='flex min-w-0 flex-1 items-stretch'>
                <button
                  onClick={() => setSideMenuOpen(true)}
                  className='hover:text-cyan-blue flex shrink-0 items-center pl-1 transition-colors'
                  aria-label='Toggle Menu'
                >
                  <IoMdMenu className='h-5 w-5' />
                </button>

                <div className='scrollbar-hide flex min-w-0 flex-1 items-stretch overflow-x-auto'>
                  <Link
                    href='/'
                    aria-label='Home'
                    className={clsx(
                      'flex shrink-0 items-center border-b-2 px-3.5 py-3 transition-colors',
                      pathname === '/'
                        ? 'border-cyan-blue bg-background-hover text-cyan-blue'
                        : 'hover:border-cyan-blue hover:text-cyan-blue hover:bg-background-hover border-transparent'
                    )}
                  >
                    <IoHome className='h-4 w-4' />
                  </Link>
                  {navEntries.map((entry, index) => {
                    if (entry.type === 'group') {
                      const { group } = entry;
                      return (
                        <Dropdown
                          // eslint-disable-next-line react/no-array-index-key
                          key={`${group.slug}-${index}`}
                          label={group.label}
                          items={(group.items ?? []).map((sub) => ({
                            label: sub.label,
                            href: sub.href,
                          }))}
                          className='shrink-0 lg:text-sm!'
                          previewNews={
                            NAV_PREVIEW_ENABLED ? navPreviewNews : undefined
                          }
                          showNew={group.showNew}
                        />
                      );
                    }

                    const { key, isActive, showNew, hasPreview, ...link } =
                      entry.link;
                    return (
                      <Link
                        // eslint-disable-next-line react/no-array-index-key
                        key={`${key}-${index}`}
                        href={link.href}
                        data-nav-item
                        onPointerEnter={(e) => {
                          if (e.pointerType !== 'mouse') return;
                          if (!hasPreview) {
                            // Not a category: close any open preview, show none.
                            cancelPreviewClose();
                            closePreview();
                            return;
                          }
                          cancelPreviewClose();
                          setPreview({
                            ...link,
                            rect: e.currentTarget.getBoundingClientRect(),
                          });
                        }}
                        onPointerLeave={(e) => {
                          if (e.pointerType !== 'mouse' || !hasPreview) return;
                          schedulePreviewClose(link.label);
                        }}
                        onClick={(e) => {
                          // Touch: non-category links navigate straight away.
                          if (canHover || !hasPreview) return;
                          e.preventDefault();
                          const rect = e.currentTarget.getBoundingClientRect();
                          setPreview((curr) =>
                            curr?.label === link.label
                              ? null
                              : { ...link, rect }
                          );
                        }}
                        className={clsx(
                          'flex shrink-0 items-center border-b-2 px-3.5 py-3 whitespace-nowrap transition-colors',
                          showNew && 'relative',
                          isActive
                            ? 'border-cyan-blue text-cyan-blue bg-background-hover'
                            : 'hover:border-cyan-blue hover:text-cyan-blue hover:bg-background-hover border-transparent'
                        )}
                      >
                        {link.label}
                        {showNew && <NewBadge />}
                      </Link>
                    );
                  })}
                  {headerStaticDropdown.enabled &&
                    !!headerStaticDropdown.items?.length && (
                      <Dropdown
                        label={headerStaticDropdown.label}
                        items={headerStaticDropdown.items}
                        className='shrink-0 lg:text-sm!'
                        previewNews={
                          NAV_PREVIEW_ENABLED ? navPreviewNews : undefined
                        }
                      />
                    )}
                </div>
              </div>

              <SocialLinks collapseBelowLg />
            </div>
          </div>
        </div>
        {preview && (
          <div
            className='fixed z-50'
            style={getPreviewPosition(preview.rect)}
            onPointerEnter={cancelPreviewClose}
            onPointerLeave={() => schedulePreviewClose(preview.label)}
            onClick={(e) => {
              if (isLinkClick(e)) dismissPreview();
            }}
          >
            <NavPreviewPanel
              label={preview.label}
              href={preview.href}
              items={preview.items}
            />
          </div>
        )}
      </nav>
      {advertiseModalOpen && (
        <AdvertiseWithUsModal
          isOpen={advertiseModalOpen}
          onClose={() => setAdvertiseModalOpen(false)}
        />
      )}
    </>
  );
}
