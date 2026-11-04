'use client';

import {
  type FC,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  useEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

import Image from 'next/image';

import CopyFileSimple from '@/lib/Icons/CopyFileSimple';
import facebook from '@/public/assets/fb.svg';
import instagram from '@/public/assets/insta.svg';
import linkedin from '@/public/assets/linkedin.svg';
import telegram from '@/public/assets/teli.svg';
import whatsapp from '@/public/assets/wp.svg';
import x from '@/public/assets/x.svg';

import { ControlIcon } from '../controlTile';
import { CONTROL_ICONS, getTileStyle } from '../controlTileStyles';
import { ShareButtonProps } from '../types';
import { useVideoPlayer } from '../useVideoPlayer';

type ShareTarget = {
  name: string;
  icon: typeof instagram;
  /** Share URL for the network; null when it has no web share link. */
  href: ((url: string) => string) | null;
};

// Same order and icons as the share panel design (and the article share row).
const SHARE_TARGETS: readonly ShareTarget[] = [
  // Instagram has no web share link: copy the URL, then open Instagram.
  { name: 'Instagram', icon: instagram, href: null },
  {
    name: 'Facebook',
    icon: facebook,
    href: (url) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    name: 'X',
    icon: x,
    href: (url) =>
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}`,
  },
  {
    name: 'LinkedIn',
    icon: linkedin,
    href: (url) =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  },
  {
    name: 'WhatsApp',
    icon: whatsapp,
    href: (url) =>
      `https://api.whatsapp.com/send?text=${encodeURIComponent(url)}`,
  },
  {
    name: 'Telegram',
    icon: telegram,
    href: (url) => `https://t.me/share/url?url=${encodeURIComponent(url)}`,
  },
];

const INSTAGRAM_URL = 'https://www.instagram.com/';

export const ShareButton: FC<ShareButtonProps> = ({
  className = '',
  style = {},
  url,
  shareTitle,
  shareDescription,
}) => {
  const {
    isVertical,
    activeMenu,
    openMenu,
    closeMenu,
    isPhoneControls,
    containerRef: playerRef,
    url: contextUrl,
    slug: contextSlug,
  } = useVideoPlayer();

  const isOpen = activeMenu === 'share';
  const [copied, setCopied] = useState(false);
  const [isMainHovered, setIsMainHovered] = useState(false);
  const [panelHost, setPanelHost] = useState<HTMLElement | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const copiedTimerRef = useRef<number | null>(null);

  // The panel is drawn over the whole player (not inside the small controls
  // capsule), so it's portalled into the player root — which is also the
  // fullscreen element, so it stays visible in fullscreen.
  useEffect(() => {
    setPanelHost(playerRef.current);
  }, [playerRef]);

  useEffect(
    () => () => {
      if (copiedTimerRef.current) window.clearTimeout(copiedTimerRef.current);
    },
    []
  );

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (
        containerRef.current?.contains(target) ||
        panelRef.current?.contains(target)
      ) {
        return;
      }
      closeMenu();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeMenu();
      }
    };

    document.addEventListener('click', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, closeMenu]);

  // Move focus into the panel when it opens so keyboard users land on it.
  useEffect(() => {
    if (isOpen) panelRef.current?.focus({ preventScroll: true });
  }, [isOpen]);

  const getTargetUrl = () => {
    if (url) return url;
    if (contextUrl) return contextUrl;
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://kuberanow.com';
    const activeSlug = contextSlug;
    if (activeSlug) {
      return isVertical
        ? `${baseUrl}/short-videos/${activeSlug}`
        : `${baseUrl}/videos/${activeSlug}`;
    }
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname;
      if (pathname.includes('/d36985ec/')) {
        return isVertical ? `${baseUrl}/short-videos` : `${baseUrl}/videos`;
      }
      return window.location.href;
    }
    return isVertical ? `${baseUrl}/short-videos` : `${baseUrl}/videos`;
  };

  // `navigator.clipboard` only exists on secure origins (https / localhost),
  // so on an http address fall back to the legacy copy command.
  const copyToClipboard = async (text: string): Promise<boolean> => {
    try {
      if (window.isSecureContext && navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch {}

    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    (panelRef.current ?? document.body).appendChild(textarea);
    textarea.select();
    let ok = false;
    try {
      ok = document.execCommand('copy');
    } catch {}
    textarea.remove();
    return ok;
  };

  const showCopied = () => {
    setCopied(true);
    if (copiedTimerRef.current) window.clearTimeout(copiedTimerRef.current);
    copiedTimerRef.current = window.setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyLink = async (e: ReactMouseEvent) => {
    e.stopPropagation();
    if (await copyToClipboard(getTargetUrl())) showCopied();
  };

  const handleTargetClick = (target: ShareTarget) => (e: ReactMouseEvent) => {
    e.stopPropagation();
    const targetUrl = getTargetUrl();

    if (!target.href) {
      // Open the tab first (still inside the click, so it isn't blocked as a
      // popup), then copy the link for the viewer to paste.
      window.open(INSTAGRAM_URL, '_blank', 'noopener,noreferrer');
      void copyToClipboard(targetUrl).then((ok) => ok && showCopied());
      return;
    }

    window.open(target.href(targetUrl), '_blank', 'noopener,noreferrer');
  };

  // The share icon opens the share modal; clicking it again closes it
  // (openMenu toggles). Using the player's menu state keeps the controls up
  // while it's open.
  const toggleOpen = (e: ReactMouseEvent) => {
    e.stopPropagation();
    openMenu('share');
  };

  const handleClose = (e: ReactMouseEvent) => {
    e.stopPropagation();
    closeMenu();
  };

  // The player root treats Space / arrows / letters as playback shortcuts;
  // keep those keys for the panel's buttons (Escape still closes it).
  const stopPlayerShortcuts = (e: ReactKeyboardEvent) => {
    if (e.key !== 'Escape') e.stopPropagation();
  };

  const panel = (
    <div
      className='pointer-events-none absolute inset-0 z-50 flex items-center justify-center p-3'
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '12px',
        pointerEvents: 'none',
      }}
      onClick={(e) => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
    >
      <div
        ref={panelRef}
        role='dialog'
        aria-modal='false'
        aria-label='Share video'
        tabIndex={-1}
        onKeyDown={stopPlayerShortcuts}
        className='animate-in fade-in zoom-in-95 pointer-events-auto flex w-full max-w-92.5 cursor-default flex-col gap-3 rounded-lg bg-white p-3 font-sans shadow-[0_8px_24px_rgba(0,0,0,0.25)] outline-none select-text'
        style={{
          pointerEvents: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          width: '100%',
          maxWidth: '370px',
          borderRadius: '8px',
          background: '#ffffff',
          padding: '14px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
          fontFamily: 'inherit',
          outline: 'none',
          boxSizing: 'border-box',
        }}
      >
        <div
          className='flex items-center justify-between'
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <h2
            className='text-career-dark text-base leading-5.5 font-bold'
            style={{
              margin: 0,
              fontSize: '16px',
              lineHeight: '22px',
              fontWeight: 700,
              color: '#010874',
            }}
          >
            Share
          </h2>
          <button
            type='button'
            onClick={handleClose}
            aria-label='Close share options'
            title='Close'
            className='text-career-dark flex size-6 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-black/5'
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: '#010874',
              padding: 0,
            }}
          >
            <svg
              width='14'
              height='14'
              viewBox='0 0 14 14'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              aria-hidden
            >
              <path d='M1 1l12 12M13 1L1 13' />
            </svg>
          </button>
        </div>

        <div
          className='flex flex-col gap-3'
          style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
        >
          <ul
            className='grid grid-cols-6 justify-items-center'
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(6, 1fr)',
              justifyItems: 'center',
              gap: '6px',
              listStyle: 'none',
              margin: 0,
              padding: 0,
            }}
          >
            {SHARE_TARGETS.map((target) => (
              <li
                key={target.name}
                className='flex w-full justify-center'
                style={{
                  display: 'flex',
                  width: '100%',
                  justifyContent: 'center',
                }}
              >
                <button
                  type='button'
                  onClick={handleTargetClick(target)}
                  title={`Share on ${target.name}`}
                  aria-label={`Share on ${target.name}`}
                  className='block w-full max-w-13 cursor-pointer transition-transform duration-120 hover:scale-110'
                  style={{
                    display: 'block',
                    width: '100%',
                    maxWidth: '48px',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    padding: 0,
                    transition: 'transform 0.12s ease',
                  }}
                >
                  <Image
                    src={target.icon}
                    alt=''
                    width={52}
                    height={52}
                    className='h-auto w-full'
                    style={{ width: '100%', height: 'auto', display: 'block' }}
                  />
                </button>
              </li>
            ))}
          </ul>

          <button
            type='button'
            onClick={handleCopyLink}
            aria-label={copied ? 'Link copied' : 'Copy video link'}
            className='border-career-chip-border bg-career-chip-bg text-primary hover:bg-career-chip-border flex cursor-pointer items-center gap-1.5 self-end rounded-full border px-3 py-1.5 text-base leading-5.5 font-normal transition-colors'
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              alignSelf: 'flex-end',
              borderRadius: '9999px',
              border: '1px solid #d1d5db',
              background: '#f3f4f6',
              color: '#010874',
              padding: '6px 14px',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'background 0.15s ease',
            }}
          >
            <span
              className='flex h-3.5 w-2.75 shrink-0 [&>svg]:h-full [&>svg]:w-full'
              style={{
                display: 'flex',
                width: '12px',
                height: '14px',
                flexShrink: 0,
              }}
            >
              <CopyFileSimple />
            </span>
            {copied ? 'Link Copied' : 'Copy Link'}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ position: 'relative', display: 'inline-flex', ...style }}
    >
      {/* Figma "Share" tile (Web 32 × 30 / Mobile 24 × 24) */}
      <button
        type='button'
        onClick={toggleOpen}
        onMouseEnter={() => setIsMainHovered(true)}
        onMouseLeave={() => setIsMainHovered(false)}
        aria-label={isOpen ? 'Close share options' : 'Share video'}
        aria-expanded={isOpen}
        aria-haspopup='dialog'
        title={isOpen ? 'Close share options' : 'Share video'}
        className='cursor-pointer'
        style={getTileStyle({
          isPhone: isPhoneControls,
          isActive: isOpen || isMainHovered,
          isVertical,
        })}
      >
        <ControlIcon
          icon={isOpen ? CONTROL_ICONS.shareOpen : CONTROL_ICONS.share}
          isPhone={isPhoneControls}
        />
      </button>

      {isOpen && panelHost && createPortal(panel, panelHost)}
    </div>
  );
};

export default ShareButton;
