'use client';

import { useRef } from 'react';

import { marketGapAudience, marketGapItems } from '../../constants/home';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useScrollReveal } from '../../hooks/useScrollReveal';

export function MarketGapSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  useScrollReveal(sectionRef, reduced);

  const demand = marketGapItems[0];
  const supply = marketGapItems[1];
  const literacy = marketGapItems[2];

  return (
    <section
      ref={sectionRef}
      className='bg-kn-deep relative overflow-hidden py-20 lg:py-24'
      id='market-gap'
    >
      <div className='relative mx-auto max-w-7xl px-0 sm:px-4'>
        <div className='max-w-2xl'>
          <p className='text-sm font-medium tracking-[0.2em] text-slate-500 uppercase'>
            The Market Gap
          </p>
          <h2
            data-reveal-heading
            className='mt-2 text-3xl font-bold text-slate-900 sm:text-4xl lg:text-5xl'
          >
            A massive audience.
            <span className='block text-slate-500'>A critical vacuum.</span>
          </h2>
          <p
            data-reveal-item
            className='mt-4 text-base leading-relaxed text-slate-600'
          >
            Millions of Gujarati investors are searching for credible business
            intelligence in their own language — and finding nothing built for
            them.
          </p>
        </div>

        {/* Hero comparison */}
        <div
          data-reveal-item
          className='relative mt-10 overflow-hidden rounded-3xl border border-slate-200 bg-white/70 p-4 shadow-sm backdrop-blur-sm sm:mx-0 sm:p-6 lg:mt-12 lg:p-8'
        >
          <div className='grid gap-6 lg:grid-cols-[1fr_auto_1fr] lg:items-center lg:gap-8'>
            {/* Demand */}
            <div className='rounded-2xl border border-amber-200 bg-linear-to-br from-amber-50 to-amber-50/10 p-4 shadow-xs sm:p-6 lg:p-8'>
              <span className='inline-flex rounded-full border border-amber-200 bg-amber-100 px-3 py-1 text-[11px] font-semibold tracking-widest text-amber-800 uppercase'>
                {demand.tag}
              </span>
              <p className='mt-5 bg-linear-to-br from-amber-600 to-amber-800 bg-clip-text text-4xl font-bold text-transparent sm:text-6xl lg:text-7xl'>
                {demand.stat}
              </p>
              <p className='mt-3 max-w-xs text-sm leading-relaxed text-slate-700'>
                {demand.label}
              </p>
            </div>

            {/* Gap divider */}
            <div className='flex flex-col items-center justify-center gap-3 px-2'>
              <div className='hidden h-px w-full bg-linear-to-r from-transparent via-slate-200 to-transparent lg:block' />
              <div className='flex h-14 w-14 items-center justify-center rounded-full border border-slate-200 bg-white shadow-md'>
                <svg
                  className='h-6 w-6 text-slate-600'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                  strokeWidth={1.5}
                  aria-hidden
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    d='M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3'
                  />
                </svg>
              </div>
              <p className='text-center text-[10px] font-semibold tracking-[0.2em] text-slate-600 uppercase'>
                The Gap
              </p>
              <div className='hidden h-px w-full bg-linear-to-r from-transparent via-slate-200 to-transparent lg:block' />
            </div>

            {/* Supply */}
            <div className='rounded-2xl border border-slate-200 bg-linear-to-br from-slate-50 to-white/30 p-4 shadow-xs sm:p-6 lg:p-8'>
              <span className='inline-flex rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-[11px] font-semibold tracking-widest text-slate-700 uppercase'>
                {supply.tag}
              </span>
              <p className='mt-5 text-4xl font-bold text-slate-800 sm:text-6xl lg:text-7xl'>
                {supply.stat}
              </p>
              <p className='mt-3 max-w-xs text-sm leading-relaxed text-slate-600'>
                {supply.label}
              </p>
            </div>
          </div>

          {/* Audience + literacy context */}
          <div className='mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 lg:grid-cols-4'>
            {marketGapAudience.map((item) => (
              <div
                key={item.label}
                className='bg-white px-3 py-3 text-center sm:px-5 sm:py-5'
              >
                <p className='text-lg font-bold text-slate-900 sm:text-xl lg:text-2xl'>
                  {item.value}
                </p>
                <p className='mt-1 text-xs text-slate-500'>{item.label}</p>
              </div>
            ))}
            <div className='bg-white px-3 py-3 text-center sm:px-5 sm:py-5'>
              <p className='bg-linear-to-br from-blue-700 to-cyan-600 bg-clip-text text-lg font-bold text-transparent sm:text-xl lg:text-2xl'>
                {literacy.stat}
              </p>
              <p className='mt-1 text-xs text-slate-500'>National literacy</p>
            </div>
          </div>
        </div>

        <p
          data-reveal-item
          className='mt-8 text-center text-sm leading-relaxed text-slate-600 lg:text-base'
        >
          <span className='font-medium text-slate-900'>
            The gap is not theoretical
          </span>{' '}
          — it is measurable, urgent, and exactly what KuberaNow is built to
          close.
        </p>
      </div>
    </section>
  );
}
