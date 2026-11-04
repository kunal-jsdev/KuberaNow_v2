'use client';

import { useEffect, useRef, useState } from 'react';
import { CiCalendar, CiSearch } from 'react-icons/ci';

import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import Link from 'next/link';

import type {
  NavCategoryLink,
  NavGroupLink,
  StaticHeaderDropdown,
} from '@/Payload/lib/utilities/getNavConfig';
import type { NewsCardItem } from '@/Payload/lib/utilities/getNewsByCategory';

import AnimatedLogoRotate from './AnimatedLogoRotate';
import Navbar from './Navbar';
import RecentSearchWrapper from './RecentSearchingWrapper';

dayjs.extend(utc);
dayjs.extend(timezone);

const PLACEHOLDER_TEXT = 'Search news';
const TYPE_SPEED = 150;
const PAUSE_TIME = 1000;

type HeaderProps = {
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

export default function Header({
  navPreviewNews,
  staticHeaderDropdown,
  staticHamburgerDropdown,
  headerCategories,
  headerGroups,
  headerOrdered,
  hamburgerCategories,
  hamburgerGroups,
  hamburgerOrdered,
}: HeaderProps) {
  const currentDate = dayjs().tz('Asia/Kolkata').format('dddd, DD/MM/YYYY');

  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopFocused, setDesktopFocused] = useState(false);
  const [query, setQuery] = useState('');

  const mobileInputRef = useRef<HTMLInputElement>(null);
  const desktopInputRef = useRef<HTMLInputElement>(null);
  const [placeholder, setPlaceholder] = useState('');

  useEffect(() => {
    if (query.length > 0) return;

    let i = 0;
    let timeoutId: NodeJS.Timeout;

    const tick = () => {
      if (i <= PLACEHOLDER_TEXT.length) {
        setPlaceholder(PLACEHOLDER_TEXT.slice(0, i));
        i++;
        timeoutId = setTimeout(tick, TYPE_SPEED);
      } else {
        timeoutId = setTimeout(() => {
          i = 0;
          setPlaceholder('');
          timeoutId = setTimeout(tick, TYPE_SPEED);
        }, PAUSE_TIME);
      }
    };

    tick();

    return () => clearTimeout(timeoutId);
  }, [query]);
  const openMobileSearch = () => {
    setMobileOpen(true);
    setTimeout(() => mobileInputRef.current?.focus(), 30);
  };

  const closeMobileSearch = () => setMobileOpen(false);

  const handleResultSelect = () => {
    mobileInputRef.current?.blur();
    desktopInputRef.current?.blur();
    setQuery('');
    setMobileOpen(false);
    setDesktopFocused(false);
  };

  return (
    <header className='sticky top-0 z-40 w-full bg-white font-sans shadow-sm'>
      <div className='mx-auto w-full max-w-316 min-w-fit px-4 py-2.5 sm:px-3 sm:py-1.5 xl:px-0'>
        <div className='flex w-full items-center justify-between gap-2'>
          {/* Logo */}
          <Link
            href='/'
            className={mobileOpen ? 'hidden sm:block sm:flex-1' : 'flex-1'}
          >
            <AnimatedLogoRotate className='aspect-148/50 w-22.5 sm:w-37' />
          </Link>

          {/* Right-side controls */}
          <div
            className={`flex min-w-0 items-center justify-end gap-2 sm:flex-1 sm:pl-0 ${mobileOpen ? 'flex-1' : ''} sm:gap-1.5`}
          >
            {/* Mobile search — hidden on sm+ */}
            <div
              className={`relative flex items-center sm:hidden ${mobileOpen ? 'min-w-0 flex-1' : 'shrink-0'}`}
            >
              {mobileOpen ? (
                <>
                  <div className='relative flex w-full items-center'>
                    <CiSearch
                      size={16}
                      style={{ strokeWidth: 1.3 }}
                      className='pointer-events-none absolute top-1/2 left-2 -translate-y-1/2 text-gray-400'
                    />
                    <input
                      ref={mobileInputRef}
                      type='text'
                      placeholder={placeholder}
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onBlur={closeMobileSearch}
                      className='border-divider h-7.5 w-full rounded-md border py-0 pr-2 pl-6 text-[10px] leading-3.5 outline-none placeholder:font-bold'
                    />
                  </div>
                  <div
                    className='border-divider absolute top-full left-0 z-50 mt-1 w-full overflow-hidden rounded-sm border bg-white'
                    onPointerDown={(e) => e.preventDefault()}
                  >
                    <RecentSearchWrapper
                      query={query}
                      onSelect={handleResultSelect}
                    />
                  </div>
                </>
              ) : (
                <button
                  type='button'
                  aria-label='Open search'
                  onClick={openMobileSearch}
                  className='border-divider flex h-7.5 w-8 items-center justify-center rounded-md border text-gray-400'
                >
                  <CiSearch
                    style={{ strokeWidth: 1.3 }}
                    size={16}
                  />
                </button>
              )}
            </div>

            <div className='relative hidden min-w-0 flex-1 self-stretch sm:flex sm:max-w-93.5 sm:items-center'>
              <CiSearch
                size={16}
                className='absolute top-1/2 left-2.5 -translate-y-1/2 text-gray-400'
              />
              <input
                ref={desktopInputRef}
                type='text'
                placeholder={placeholder}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setDesktopFocused(true)}
                onBlur={() => setDesktopFocused(false)}
                className='border-divider h-full w-full rounded-md border pr-3 pl-8 text-[14px] leading-4.5 outline-none'
              />
              {desktopFocused && (
                <div
                  className='border-divider shadow-dropdown absolute top-full left-0 z-50 mt-1 w-full overflow-hidden rounded-md border bg-white'
                  onPointerDown={(e) => e.preventDefault()}
                >
                  <RecentSearchWrapper
                    query={query}
                    onSelect={handleResultSelect}
                  />
                </div>
              )}
            </div>

            {/* Date badge */}
            <div
              className={`sm:text-content-small ring-divider sm:border-divider flex w-fit max-w-33.75 shrink-0 items-center justify-center rounded-md px-2.5 py-2 text-[10px] whitespace-nowrap ring sm:min-w-fit sm:border sm:py-2.75 sm:ring-0 ${mobileOpen ? 'gap-0' : 'gap-1.5'}`}
            >
              <CiCalendar className='h-3 w-3 shrink-0 text-black sm:h-3.75 sm:w-3.75' />
              <span
                className={`text-career-dark sm:inline ${mobileOpen ? 'hidden' : 'inline'}`}
              >
                {currentDate || 'Loading...'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <Navbar
        navPreviewNews={navPreviewNews}
        staticHeaderDropdown={staticHeaderDropdown}
        staticHamburgerDropdown={staticHamburgerDropdown}
        headerCategories={headerCategories}
        headerGroups={headerGroups}
        headerOrdered={headerOrdered}
        hamburgerCategories={hamburgerCategories}
        hamburgerGroups={hamburgerGroups}
        hamburgerOrdered={hamburgerOrdered}
      />
    </header>
  );
}
