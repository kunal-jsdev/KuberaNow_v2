'use client';

import { useEffect } from 'react';

import { ScrollTrigger } from '../../lib/utils/gsap';

export function GsapInit() {
  useEffect(() => {
    const t = setTimeout(() => ScrollTrigger.refresh(), 100);
    return () => {
      clearTimeout(t);
    };
  }, []);

  return null;
}
