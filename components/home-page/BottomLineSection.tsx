'use client';

import { useRef } from 'react';

import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useScrollReveal } from '../../hooks/useScrollReveal';

export function BottomLineSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  useScrollReveal(sectionRef, reduced);

  const currentYear = new Date().getFullYear();

  return (
    <section
      ref={sectionRef}
      className='bg-kn-deep relative overflow-hidden py-14 lg:py-26'
      id='bottom-line'
    >
      <div className='relative mx-auto max-w-4xl px-0 text-center sm:px-6 lg:px-12'>
        <h2
          data-reveal-heading
          className='mt-6 text-3xl leading-tight font-bold text-slate-900 sm:text-4xl lg:text-5xl'
        >
          The capital is there. The audience is searching. The timing is{' '}
          <span className='bg-linear-to-r from-amber-600 to-amber-800 bg-clip-text text-transparent'>
            mathematically absolute.
          </span>
        </h2>

        <p
          data-reveal-item
          className='text-md mx-auto mt-8 max-w-2xl leading-relaxed text-slate-600 lg:text-lg'
        >
          We are not simply launching a business digital TV — we are building
          the definitive home for Gujarati prosperity. KuberaNow arrives at the
          perfect inflection point.
        </p>

        <p
          data-reveal-item
          className='mt-8 w-full border-t border-slate-200 pt-8 text-xs leading-relaxed text-slate-600 italic lg:text-sm'
        >
          Source & methodology: Public data references from NSDL, CDSL, NSE,
          Government of Gujarat, Startup India/DPIIT and Udyam/MSME, combined
          with KuberaNow internal market research and estimates.
        </p>

        <footer className='mt-10 text-xs text-slate-500'>
          © <span suppressHydrationWarning>{currentYear}</span> KuberaNow
        </footer>
      </div>
    </section>
  );
}
