'use client';

import { useState } from 'react';

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

export default function NewsShareLinksExpanded({
  path,
  title,
  iconSize = 26,
  className = '',
}: NewsShareLinksProps) {
  const [copied, setCopied] = useState(false);

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

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {SHARE_TARGETS.map(({ name, icon, href }) => (
        <Link
          key={name}
          href={href(buildUrl(name.toLowerCase(), 'social'))}
          target='_blank'
          rel='noopener noreferrer'
          title={`Share on ${name}`}
          aria-label={`Share on ${name}`}
          className='drop-shadow-share-icon block shrink-0 duration-120 hover:scale-115'
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
        className='border-career-chip-border bg-career-chip-bg text-primary hover:bg-career-chip-border ml-1 flex shrink-0 cursor-pointer items-center gap-1 rounded-xl border px-2 py-1 transition-colors'
      >
        <CopyFileSimple className='size-2.5' />
        <span className='text-[10px] leading-3.5 font-normal'>
          {copied ? 'Copied' : 'Link'}
        </span>
      </button>
    </div>
  );
}
