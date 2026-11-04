'use client';

import { useCallback, useLayoutEffect, useRef, useState } from 'react';

export function useCollapsingNav(itemCount: number) {
  const containerRef = useRef<HTMLDivElement>(null);

  const triggerRef = useRef<HTMLDivElement>(null);
  const lastTriggerWidth = useRef(0);

  const [visibleCount, setVisibleCount] = useState(0);

  const measure = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const items = Array.from(
      container.querySelectorAll<HTMLElement>('[data-nav-item]')
    );
    if (items.length === 0) return;

    const liveTriggerWidth = triggerRef.current?.offsetWidth ?? 0;
    if (liveTriggerWidth > 0) lastTriggerWidth.current = liveTriggerWidth;
    const triggerWidth = liveTriggerWidth || lastTriggerWidth.current;

    let available = container.parentElement?.offsetWidth ?? 0;

    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      available = Math.max(0, available - 160);
    }

    if (available === 0) {
      setVisibleCount(0);
      return;
    }

    let used = 0;
    let count = 0;
    for (const item of items) {
      used += item.offsetWidth;
      const needed = used + triggerWidth;
      if (needed > available) break;
      count++;
    }

    setVisibleCount(count);
  }, []);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    measure();
    if (typeof ResizeObserver === 'undefined') return;

    const observer = new ResizeObserver(measure);
    observer.observe(container.parentElement ?? container);
    return () => observer.disconnect();
  }, [measure, itemCount]);

  return { containerRef, triggerRef, visibleCount };
}
