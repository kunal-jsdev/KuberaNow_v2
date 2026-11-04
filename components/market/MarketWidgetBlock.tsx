'use client';

import { useEffect, useRef } from 'react';

import MarketCardSection from '@/components/market/MarketCardSection';

export interface MarketWidgetBlockProps {
  title: string;
  contentScript: string;
  className?: string;
  as?: 'h1' | 'h3';
}

export default function MarketWidgetBlock({
  title,
  contentScript,
  className = '',
  as = 'h3',
}: MarketWidgetBlockProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !contentScript) return;

    container.innerHTML = contentScript;

    const scripts = Array.from(container.querySelectorAll('script'));
    scripts.forEach((oldScript) => {
      const newScript = document.createElement('script');
      Array.from(oldScript.attributes).forEach((attr) => {
        newScript.setAttribute(attr.name, attr.value);
      });
      newScript.text = oldScript.innerHTML || oldScript.textContent || '';
      oldScript.parentNode?.replaceChild(newScript, oldScript);
    });

    return () => {
      if (container) {
        container.innerHTML = '';
      }
    };
  }, [contentScript]);

  return (
    <MarketCardSection
      title={title}
      className={className}
      as={as}
    >
      <div
        ref={containerRef}
        className='w-full overflow-hidden'
      />
    </MarketCardSection>
  );
}
