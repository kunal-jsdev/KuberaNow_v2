'use client';

import { useEffect, useRef, useState } from 'react';
import { GoShareAndroid } from 'react-icons/go';

import Image from 'next/image';
import Link from 'next/link';

import { SHARE_TARGETS } from '@/constants/navigation';
import CopyFileSimple from '@/lib/Icons/CopyFileSimple';

type NewsShareLinksProps = {
  path: string;
  title: string;
  iconSize?: number;
  className?: string;
};

export default function NewsShareLinks({
  path,
  title,
  iconSize = 26,
  className = '',
}: NewsShareLinksProps) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const origin = (
    (typeof window !== 'undefined' ? window.location.origin : '') ||
    process.env.NEXT_PUBLIC_SERVER_URL ||
    ''
  ).replace(/\/+$/, '');

  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const slug = cleanPath.split('/').filter(Boolean).pop() ?? '';

  const buildUrl = (source: string, medium: string) =>
    `${origin}${cleanPath}?utm_source=${source}&utm_medium=${medium}&utm_campaign=article_share&utm_content=${slug}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(buildUrl('copy_link', 'share'));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  return (
    <div
      ref={containerRef}
      className={`relative size-8 shrink-0 ${className}`}
    >
      <div
        className={
          open
            ? 'bg-career-tint absolute -top-1.5 -right-1.5 z-10 flex w-max flex-col items-center rounded-2xl p-1.5 shadow-md ring-1 ring-gray-200 md:top-1/2 md:-translate-y-1/2 md:flex-row-reverse'
            : 'flex items-center justify-center'
        }
      >
        <button
          type='button'
          onClick={() => setOpen((prev) => !prev)}
          title='Share'
          aria-label='Share'
          aria-expanded={open}
          className='text-career-dark flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors'
        >
          <GoShareAndroid className='size-4 border-none stroke-1 md:size-4.5' />
        </button>

        {open && (
          <>
            <div className='bg-divider my-1.5 h-px w-full md:mx-2 md:my-0 md:h-5 md:w-px' />

            <div
              className='flex shrink-0 flex-col items-center gap-3 pb-1.5 md:flex-row md:pr-1 md:pb-0 md:pl-2'
              role='menu'
            >
              {SHARE_TARGETS.map(({ name, icon, href }) => (
                <Link
                  key={name}
                  href={href(buildUrl(name.toLowerCase(), 'social'))}
                  target='_blank'
                  rel='noopener noreferrer'
                  title={`Share on ${name}`}
                  aria-label={`Share on ${name}`}
                  onClick={() => setOpen(false)}
                  className='block shrink-0 duration-120 hover:scale-115'
                >
                  <Image
                    src={icon}
                    alt={name}
                    width={iconSize}
                    height={iconSize}
                  />
                </Link>
              ))}

              <button
                type='button'
                onClick={handleCopy}
                title={copied ? 'Link copied' : 'Copy link'}
                aria-label='Copy link'
                className='border-career-chip-border bg-career-chip-bg text-primary hover:bg-career-chip-border flex shrink-0 cursor-pointer items-center justify-center rounded-full border p-2 transition-colors'
              >
                <CopyFileSimple className='size-3.5' />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
