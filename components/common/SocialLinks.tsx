'use client';

import { useCallback, useEffect, useState } from 'react';
import { MdOutlineFileUpload } from 'react-icons/md';

import clsx from 'clsx';
import Image from 'next/image';
import Link from 'next/link';

import { SOCIAL_LINKS } from '@/constants/navigation';
import { useOutsideClick } from '@/hooks/useOutsideClick';

function SocialIcon({
  social,
  iconSize,
  onClick,
}: {
  social: (typeof SOCIAL_LINKS)[number];
  iconSize: number;
  onClick?: () => void;
}) {
  return (
    <Link
      href={social.href}
      target='_blank'
      rel='noopener noreferrer'
      title={social.name}
      onClick={onClick}
      className='block shrink-0 transition-opacity hover:opacity-80'
    >
      <Image
        src={social.icon}
        alt={social.name}
        width={iconSize}
        height={iconSize}
        className='shrink-0'
        style={{ width: iconSize, height: iconSize }}
      />
    </Link>
  );
}

function SocialLinks({
  setSocialOpen,
  className,
  iconSize = 26,
  collapseBelowLg = false,
}: {
  setSocialOpen?: React.Dispatch<boolean>;
  className?: string;
  iconSize?: number;
  /**
   * Below lg, replace the icon strip with a single toggle. The strip costs
   * ~190px, which the navbar needs for its links on narrow screens.
   */
  collapseBelowLg?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const ref = useOutsideClick<HTMLDivElement>(close);

  // Closing on scroll keeps the popover from detaching from its trigger.
  useEffect(() => {
    if (!open) return;
    const handleScroll = () => setOpen(false);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [open]);

  // shrink-0 throughout: as a flex child next to the nav links these would
  // otherwise be squeezed instead of the links collapsing into "More".
  const strip = (
    <div
      className={clsx(
        'flex shrink-0 items-center gap-1',
        collapseBelowLg && 'hidden lg:flex',
        className
      )}
    >
      {SOCIAL_LINKS.map((social) => (
        <SocialIcon
          key={social.name}
          social={social}
          iconSize={iconSize}
          onClick={() => setSocialOpen?.(false)}
        />
      ))}
    </div>
  );

  if (!collapseBelowLg) return strip;

  return (
    <>
      {strip}
      <div
        ref={ref}
        className='relative flex shrink-0 items-stretch lg:hidden'
      >
        <button
          onClick={() => setOpen((v) => !v)}
          className='flex items-center px-2 transition-colors hover:text-[#00FFEE]'
          aria-label='Toggle social links'
          aria-expanded={open}
        >
          <MdOutlineFileUpload className='h-5 w-5' />
        </button>

        {open && (
          <div className='absolute top-full right-0 z-9999 flex flex-col gap-1 rounded-xl bg-white p-2 shadow-xl'>
            {SOCIAL_LINKS.map((social) => (
              <SocialIcon
                key={social.name}
                social={social}
                iconSize={iconSize}
                onClick={close}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
export default SocialLinks;
