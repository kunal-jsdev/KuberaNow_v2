'use client';

import { useRef } from 'react';

import { useArticleCopy } from '@/hooks/useArticleCopy';

type ArticleCopyWrapperProps = {
  /** URL path (e.g. /news/slug) used to build the full article URL. */
  sharePath: string;
  className?: string;
  children: React.ReactNode;
};

/**
 * A thin client-side boundary that wraps the article body. When the user
 * copies any text from within this wrapper, the clipboard receives only:
 *
 *   Read the full article:
 *   <articleUrl>
 *
 * The selected text is intentionally discarded so the clipboard stays clean.
 * Text copied outside this wrapper is completely unaffected.
 */
export default function ArticleCopyWrapper({
  sharePath,
  className,
  children,
}: ArticleCopyWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const origin = (
    (typeof window !== 'undefined' ? window.location.origin : '') ||
    process.env.NEXT_PUBLIC_SERVER_URL ||
    ''
  ).replace(/\/+$/, '');

  useArticleCopy(
    containerRef,
    `${origin}${sharePath.startsWith('/') ? sharePath : `/${sharePath}`}`
  );

  return (
    <div
      ref={containerRef}
      className={className}
    >
      {children}
    </div>
  );
}
