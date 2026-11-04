'use client';

import {
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
} from 'react';

import { buildEmbedFragment } from './embedSnippet';

type EmbedHtmlProps = {
  html: string;
  fallback?: ReactNode;
  className?: string;
  as?: 'div' | 'span';
};

const subscribe = () => () => {};

export default function EmbedHtml({
  html,
  fallback = null,
  className = '',
  as = 'div',
}: EmbedHtmlProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isClient = useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
  const fragment = useMemo(
    () => (isClient ? buildEmbedFragment(html) : null),
    [isClient, html]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !fragment) return;

    container.replaceChildren(fragment.cloneNode(true));
    return () => container.replaceChildren();
  }, [fragment]);

  const Wrapper = as;

  if (isClient && !fragment) {
    return <>{/<script/i.test(html) ? null : fallback}</>;
  }

  return (
    <Wrapper
      ref={containerRef as React.RefObject<never>}
      className={`block w-full overflow-hidden ${className}`}
    />
  );
}
