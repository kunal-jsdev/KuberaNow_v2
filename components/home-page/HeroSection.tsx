'use client';

import { useRef } from 'react';

import { useGSAP } from '@gsap/react';

import { STATIC_PAGE_SEO } from '../../constants/pageSeo';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { gsap } from '../../lib/utils/gsap';

import { HeroAnimation } from './animations/HeroAnimation';

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (!sectionRef.current || reduced) return;

      const inner = sectionRef.current.querySelector('[data-hero-inner]');
      gsap.to(inner, {
        scale: 1.08,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.5,
        },
      });
    },
    { scope: sectionRef, dependencies: [reduced] }
  );

  return (
    <section
      ref={sectionRef}
      className='bg-kn-deep relative overflow-hidden lg:min-h-svh'
      id='hero'
    >
      <div
        data-hero-inner
        className='relative mx-auto flex max-w-7xl flex-col px-0 py-10 pt-0! sm:px-4 md:py-20 lg:min-h-svh lg:justify-center lg:px-8 lg:py-12 lg:pt-20'
      >
        <div className='mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-xs font-medium tracking-widest text-blue-800'>
          <span className='h-1.5 w-1.5 animate-pulse rounded-full bg-blue-600' />
          KuberaNow
        </div>

        <p className='text-sm font-medium tracking-[0.2em] text-amber-800 uppercase'>
          New Era of Wealth Creation
        </p>

        <h1 className='mt-4 max-w-3xl text-4xl leading-[1.1] font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl'>
          {STATIC_PAGE_SEO.whyKubera.h1}
        </h1>

        <p className='mt-6 max-w-xl text-base leading-relaxed text-slate-600 lg:text-lg'>
          Look at the data, and the story is undeniable: India’s retail
          investing landscape has undergone a permanent, structural shift.
          Between 2020 and 2026, a post-COVID surge added over 13 crore new
          demat accounts nationally, transforming financial market participation
          from a niche pursuit into a mainstream cultural phenomenon.
        </p>

        <div className='mt-12 grid items-center gap-10 lg:grid-cols-2'>
          <HeroAnimation />
          <div className='space-y-6 px-4 lg:px-0'>
            <div className='rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-sm backdrop-blur-sm'>
              <p className='text-xs font-semibold tracking-widest text-slate-500 uppercase'>
                The numbers speak
              </p>
              <p className='mt-2 text-2xl font-semibold text-slate-900'>
                4.2× growth in demat accounts
              </p>
              <p className='mt-1 text-sm text-slate-600'>
                From ~4.1 Cr nationally to ~17.1 Cr by 2026
              </p>
            </div>
            <div className='rounded-2xl border border-amber-200 bg-amber-50/50 p-6 shadow-sm'>
              <p className='text-xs font-semibold tracking-widest text-amber-800 uppercase'>
                Gujarat leads
              </p>
              <p className='mt-2 text-2xl font-semibold text-slate-900'>
                2.6 Cr demat accounts
              </p>
              <p className='mt-1 text-sm text-slate-600'>
                Up from ~62 Lakh pre-2020 — outpacing the national curve
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
