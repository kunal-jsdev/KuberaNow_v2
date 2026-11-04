'use client';

import { RefObject } from 'react';

import { useGSAP } from '@gsap/react';

import { gsap } from '../lib/utils/gsap';

export function useScrollReveal(
  scopeRef: RefObject<HTMLElement | null>,
  disabled = false
) {
  useGSAP(
    () => {
      if (disabled || !scopeRef.current) return;

      const headings = scopeRef.current.querySelectorAll(
        '[data-reveal-heading]'
      );
      const items = scopeRef.current.querySelectorAll('[data-reveal-item]');
      const zoomEls = scopeRef.current.querySelectorAll(
        '[data-zoom-on-scroll]'
      );

      headings.forEach((el) => {
        gsap.fromTo(
          el,
          { yPercent: 110, opacity: 0 },
          {
            yPercent: 0,
            opacity: 1,
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
          }
        );
      });

      items.forEach((el, i) => {
        gsap.fromTo(
          el,
          { y: 32, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            delay: i * 0.08,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 88%',
              toggleActions: 'play none none none',
            },
          }
        );
      });

      zoomEls.forEach((el) => {
        gsap.fromTo(
          el,
          { scale: 1 },
          {
            scale: 1.06,
            ease: 'none',
            scrollTrigger: {
              trigger: el,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          }
        );
      });
    },
    { scope: scopeRef, dependencies: [disabled] }
  );
}
