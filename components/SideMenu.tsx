'use client';

import { useState } from 'react';
import { IoMdArrowDropdown, IoMdArrowDropright } from 'react-icons/io';
import { IoClose } from 'react-icons/io5';

import clsx from 'clsx';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import type {
  NavCategoryLink,
  NavGroupLink,
  StaticHeaderDropdown,
} from '@/Payload/lib/utilities/getNavConfig';

import { CONTACT_DETAILS } from '../constants/constants';
import { SIDEBAR_MAIN_LINKS, SOCIAL_LINKS } from '../constants/navigation';
import { trackPWAInstallPrompt, usePWAInstall } from '../hooks/usePWAInstall';
import contactUsAdvertise from '../public/assets/contact-us-advertise.png';
import gmailIcon from '../public/assets/Gmail.svg';
import wpIcon from '../public/assets/wp.svg';

import IOSInstallModal from './pwa/IOSInstallModal';

type SideMenuProps = {
  isOpen: boolean;
  onClose: () => void;
  onOpenAdvertiseModal?: () => void;
  staticHamburgerDropdown?: StaticHeaderDropdown | null;
  /** All CMS nav items for the sidebar (no limit). Null = use hardcoded fallback. */
  dynamicNavItems?: (NavCategoryLink | NavGroupLink)[] | null;
};

/** Type-guard: true when the item has an `items` array (i.e. is a NavGroupLink). */
function isGroupLink(
  item: NavCategoryLink | NavGroupLink
): item is NavGroupLink {
  return 'items' in item && Array.isArray((item as NavGroupLink).items);
}

export default function SideMenu({
  isOpen,
  onClose,
  onOpenAdvertiseModal,
  staticHamburgerDropdown,
  dynamicNavItems,
}: SideMenuProps) {
  const pathname = usePathname();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const { isIOS, isInstalled, sessionCount, promptInstall } = usePWAInstall();

  const handleInstallClick = async () => {
    if (isInstalled) {
      alert('App is already installed!');
      return;
    }

    trackPWAInstallPrompt('add_to_home_screen', {
      prompt_session: sessionCount,
      pwa_status: isInstalled ? 'installed' : 'not_installed',
    });

    if (isIOS) {
      setShowIOSModal(true);
    } else {
      promptInstall();
    }
  };

  const email = CONTACT_DETAILS.find(
    (detail) => detail.label === 'Email'
  )?.value;
  const phone = CONTACT_DETAILS.find(
    (detail) => detail.label === 'Phone'
  )?.value;

  const toggleDropdown = (label: string) => {
    setOpenDropdown(openDropdown === label ? null : label);
  };

  const hamburgerStaticDropdown = staticHamburgerDropdown ?? {
    label: 'Kubera Now',
    enabled: true,
  };

  const renderDropdown = (
    label: string,
    items: { label: string; href: string }[],
    showNew?: boolean,
    key: string = label
  ) => {
    const isActive = openDropdown === label;
    return (
      <li
        key={key}
        className='flex flex-col'
      >
        <button
          onClick={() => toggleDropdown(label)}
          className={clsx(
            'flex cursor-pointer items-center justify-between px-6 py-3 text-sm font-semibold transition-colors hover:bg-[#00219A]',
            showNew && 'relative'
          )}
        >
          <span className='flex items-center'>
            {label}
            {showNew && <span className='new-badge-sparkle'>New</span>}
          </span>
          {isActive ? (
            <IoMdArrowDropdown className='h-5 w-5' />
          ) : (
            <IoMdArrowDropright className='h-5 w-5' />
          )}
        </button>
        {isActive && (
          <ul className='flex flex-col bg-[#000844] py-1'>
            {items.map((item) => {
              const isItemActive = pathname === item.href;
              return (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={clsx(
                      'block px-10 py-2.5 text-sm font-medium transition-colors hover:bg-[#00219A]',
                      isItemActive ? 'bg-[#00219A] text-white' : 'text-gray-200'
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </li>
    );
  };

  // Decide whether to use CMS dynamic items or hardcoded fallback
  const useDynamic = dynamicNavItems && dynamicNavItems.length > 0;

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className='fixed inset-0 z-100 bg-black/50 transition-opacity'
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={clsx(
          'fixed inset-y-0 left-0 z-110 w-75 max-w-[85vw] transform bg-[#000647] text-white shadow-2xl transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className='flex h-full flex-col'>
          {/* Header */}
          <div className='flex justify-end p-4'>
            <button
              onClick={onClose}
              aria-label='Close Menu'
              className='text-white transition-colors hover:text-[#00FFEE]'
            >
              <IoClose className='h-7 w-7' />
            </button>
          </div>

          {/* Links */}
          <div
            className='flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#4a5fc1] [&::-webkit-scrollbar-track]:bg-transparent'
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#4a5fc1 transparent',
            }}
          >
            <ul className='flex flex-col pb-4'>
              {/* Home link (always present) */}
              <li>
                <Link
                  href='/'
                  onClick={onClose}
                  className={clsx(
                    'block px-6 py-3 text-sm font-semibold transition-colors hover:bg-[#00219A]',
                    pathname === '/'
                      ? 'rounded-tr-sm rounded-br-sm border-r-4 border-[#00FFEE] bg-[#00219A] text-[#00FFEE]'
                      : 'border-r-4 border-transparent text-white'
                  )}
                >
                  Home
                </Link>
              </li>

              {useDynamic
                ? /* ── CMS dynamic items (all, no limit) ─────── */
                  dynamicNavItems!.map((item, index) => {
                    if (isGroupLink(item)) {
                      // Render group as a collapsible dropdown
                      const subItems = (item.items ?? []).map((sub) => ({
                        label: sub.label,
                        href: sub.href,
                      }));
                      return renderDropdown(
                        item.label,
                        subItems,
                        item.showNew,
                        `${item.label}-${index}`
                      );
                    }

                    // Regular category link
                    const isActive = pathname === item.href;
                    return (
                      // eslint-disable-next-line react/no-array-index-key
                      <li key={`${item.label}-${index}`}>
                        <Link
                          href={item.href}
                          onClick={onClose}
                          className={clsx(
                            'flex items-center px-6 py-3 text-sm font-semibold transition-colors hover:bg-[#00219A]',
                            item.showNew && 'relative',
                            isActive
                              ? 'rounded-tr-sm rounded-br-sm border-r-4 border-[#00FFEE] bg-[#00219A] text-[#00FFEE]'
                              : 'border-r-4 border-transparent text-white'
                          )}
                        >
                          {item.label}
                          {item.showNew && (
                            <span className='new-badge-sparkle'>New</span>
                          )}
                        </Link>
                      </li>
                    );
                  })
                : /* ── Fallback: hardcoded SIDEBAR_MAIN_LINKS ── */
                  SIDEBAR_MAIN_LINKS.filter((link) => link.href !== '/').map(
                    (link) => {
                      const isActive = pathname === link.href;
                      return (
                        <li key={link.label}>
                          <Link
                            href={link.href}
                            onClick={onClose}
                            className={clsx(
                              'block px-6 py-3 text-sm font-semibold transition-colors hover:bg-[#00219A]',
                              isActive
                                ? 'rounded-tr-sm rounded-br-sm border-r-4 border-[#00FFEE] bg-[#00219A] text-[#00FFEE]'
                                : 'border-r-4 border-transparent text-white'
                            )}
                          >
                            {link.label}
                          </Link>
                        </li>
                      );
                    }
                  )}

              {hamburgerStaticDropdown.enabled &&
                !!hamburgerStaticDropdown.items?.length &&
                renderDropdown(
                  hamburgerStaticDropdown.label,
                  hamburgerStaticDropdown.items
                )}

              {!isInstalled && (
                <li>
                  <button
                    onClick={() => {
                      handleInstallClick();
                      onClose();
                    }}
                    className='block w-full cursor-pointer border-r-4 border-transparent px-6 py-3 text-left text-sm font-semibold text-white transition-colors hover:bg-[#00219A]'
                  >
                    Add to Home Screen
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Socials & Advertisement */}
          <div className='mt-auto border-t border-[#00FFEE]'>
            <div className='flex flex-wrap justify-center gap-2.5 px-4 py-6'>
              {SOCIAL_LINKS.map((social) => (
                <Link
                  key={social.name}
                  href={social.href}
                  target='_blank'
                  rel='noopener noreferrer'
                  title={social.name}
                  className='transition-transform hover:scale-110'
                >
                  <Image
                    src={social.icon}
                    alt={social.name}
                    width={28}
                    height={28}
                    className='rounded-full'
                  />
                </Link>
              ))}
            </div>

            <div className='flex justify-center px-4 pb-6'>
              <div className='relative h-47.5 w-74 overflow-hidden rounded-xl p-4 text-center text-black shadow-lg'>
                <Image
                  src={contactUsAdvertise}
                  alt='Background'
                  fill
                  className='absolute inset-0 -z-10 object-cover'
                />

                <div className='relative z-10 flex h-full flex-col items-start justify-between'>
                  <div className='flex flex-col items-start justify-between'>
                    <h3 className='from-dark-navy2 bg-linear-to-r to-[#000EC0] bg-clip-text text-xl font-bold text-transparent'>
                      Advertise With Us
                    </h3>
                    <p className='mt-1 text-xs text-[#010874]'>
                      Reach Millions. Build Your Brand
                    </p>

                    <div className='mt-2'>
                      <button
                        type='button'
                        onClick={() => {
                          onClose();
                          onOpenAdvertiseModal?.();
                        }}
                        className='focus:ring-primary inline-flex cursor-pointer items-center gap-2 rounded-md bg-[linear-gradient(to_right,#000764,#000EC0)] px-2 py-1.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 focus:ring-2 focus:ring-offset-2 focus:outline-none'
                      >
                        Contact Us
                      </button>
                    </div>
                  </div>

                  <div className='mt-3 flex flex-col items-start gap-2 text-xs font-medium text-gray-700'>
                    <Link
                      href='https://whatsapp.com/channel/0029VbDPNhHISTkJEDTirJ16'
                      target='_blank'
                      rel='noopener noreferrer'
                      className='flex items-center gap-1 transition-opacity hover:opacity-80'
                    >
                      <Image
                        src={wpIcon}
                        alt='WhatsApp'
                        width={18}
                        height={18}
                      />
                      <p className='text-xs leading-4 font-semibold text-[#313131]'>
                        {phone}
                      </p>
                    </Link>
                    <div className='flex items-center gap-1'>
                      <Image
                        src={gmailIcon}
                        alt='Email'
                        width={18}
                        height={18}
                      />
                      <Link
                        href={`mailto:${email}`}
                        className='text-xs leading-4 font-semibold text-[#313131]'
                      >
                        {email}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <IOSInstallModal
        isOpen={showIOSModal}
        onClose={() => setShowIOSModal(false)}
      />
    </>
  );
}
