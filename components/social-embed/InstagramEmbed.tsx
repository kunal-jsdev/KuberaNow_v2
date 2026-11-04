'use client';

import { useEffect, useRef } from 'react';
import { FaInstagram } from 'react-icons/fa6';

type InstagramEmbedProps = {
  postType: 'p' | 'reel' | 'tv';
  code: string;
  originalUrl?: string;
  className?: string;
};

declare global {
  interface Window {
    instgrm?: {
      Embeds?: {
        process?: (element?: HTMLElement | null) => void;
      };
    };
  }
}

export default function InstagramEmbed({
  postType,
  code,
  originalUrl,
  className = '',
}: InstagramEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cleanType = postType === 'reel' ? 'reel' : 'p';
  const postUrl =
    originalUrl || `https://www.instagram.com/${cleanType}/${code}/`;

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const processEmbed = () => {
      if (window.instgrm?.Embeds?.process) {
        window.instgrm.Embeds.process(containerRef.current);
      }
    };

    if (!document.getElementById('instagram-embed-script')) {
      const script = document.createElement('script');
      script.id = 'instagram-embed-script';
      script.src = 'https://www.instagram.com/embed.js';
      script.async = true;
      script.onload = () => {
        processEmbed();
      };
      document.body.appendChild(script);
    } else {
      processEmbed();
    }
  }, [code, postType]);

  return (
    <div
      ref={containerRef}
      className={`mx-auto my-6 flex max-w-[540px] justify-center ${className}`}
    >
      <blockquote
        className='instagram-media'
        data-instgrm-permalink={postUrl}
        data-instgrm-version='14'
        style={{
          background: '#FFF',
          border: 0,
          borderRadius: '12px',
          boxShadow: '0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15)',
          margin: '1px auto',
          maxWidth: '540px',
          minWidth: '326px',
          padding: 0,
          width: '99.375%',
        }}
      >
        <div style={{ padding: '16px' }}>
          <a
            href={postUrl}
            target='_blank'
            rel='noopener noreferrer'
            className='flex items-center justify-center gap-2 py-3 text-xs font-semibold text-rose-600 hover:underline sm:text-sm'
          >
            <FaInstagram className='text-base text-rose-500' />
            <span>View post on Instagram</span>
          </a>
        </div>
      </blockquote>
    </div>
  );
}
