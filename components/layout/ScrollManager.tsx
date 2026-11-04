'use client';

import { Suspense, useEffect } from 'react';

import { usePathname } from 'next/navigation';

function ScrollManagerContent() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  useEffect(() => {
    if (window.location.hash) {
      const targetId = window.location.hash.slice(1);
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView();
        return;
      }
    }

    const scrollToTop = () => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      if (document.documentElement) {
        document.documentElement.scrollTop = 0;
      }
      if (document.body) {
        document.body.scrollTop = 0;
      }
    };

    scrollToTop();

    const rafId = requestAnimationFrame(() => {
      scrollToTop();
    });

    const timerId = setTimeout(() => {
      scrollToTop();
    }, 60);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timerId);
    };
  }, [pathname]);

  return null;
}

export default function ScrollManager() {
  return (
    <Suspense fallback={null}>
      <ScrollManagerContent />
    </Suspense>
  );
}
