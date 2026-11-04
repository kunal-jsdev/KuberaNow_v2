'use client';

import { useRef } from 'react';

import { pillars } from '../../constants/revolutionSection';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useScrollReveal } from '../../hooks/useScrollReveal';

export function RevolutionSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  useScrollReveal(sectionRef, reduced);

  return (
    <section
      ref={sectionRef}
      className='bg-kn-deep relative py-12 lg:py-28'
      id='revolution'
    >
      <div className='mx-auto max-w-7xl px-0 sm:px-4'>
        <div className='grid items-center gap-16 lg:grid-cols-2'>
          <div>
            <p className='text-sm font-medium tracking-[0.2em] text-blue-700 uppercase'>
              The Revolution
            </p>
            <h2
              data-reveal-heading
              className='mt-3 text-3xl font-bold text-slate-900 sm:text-4xl lg:text-5xl'
            >
              India is investing. Gujarat is leading.
            </h2>
            <p
              data-reveal-item
              className='mt-6 text-base leading-relaxed text-slate-600'
            >
              India&apos;s retail investing landscape has undergone a permanent,
              structural shift between 2020 and 2026 — adding over 13 crore new
              demat accounts nationally. At the absolute epicenter of this
              revolution is Gujarat.
            </p>
            <p
              data-reveal-item
              className='mt-4 text-base leading-relaxed text-slate-600'
            >
              Our vision is bold: to become Gujarat&apos;s most trusted and
              influential business media platform — bridging sophisticated
              financial intelligence with regional-language accessibility.
            </p>
          </div>

          <div
            data-zoom-on-scroll
            className='relative mx-2 overflow-hidden rounded-3xl border border-slate-200 shadow-sm md:mx-8 lg:mx-0'
          >
            <div className='bg-linear-to-br from-blue-50/80 via-white to-indigo-50/80 p-4 md:p-8'>
              <div className='flex h-full flex-col justify-between gap-20'>
                <div>
                  <p className='text-xs font-semibold tracking-widest text-blue-700 uppercase'>
                    Capital Culture
                  </p>
                  <p className='mt-2 text-4xl font-bold text-slate-900'>
                    ₹22L Cr
                  </p>
                  <p className='text-sm text-slate-600'>Gujarat GSDP</p>
                </div>
                <div className='grid grid-cols-2 gap-4'>
                  <div className='rounded-xl border border-slate-200 bg-white p-4 shadow-xs'>
                    <p className='text-2xl font-bold text-cyan-700'>5.3×</p>
                    <p className='text-xs text-slate-600'>
                      IPO subscriber growth
                    </p>
                  </div>
                  <div className='rounded-xl border border-slate-200 bg-white p-4 shadow-xs'>
                    <p className='text-2xl font-bold text-amber-700'>4.2×</p>
                    <p className='text-xs text-slate-600'>
                      Demat account growth
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className='mx-1 mt-20 grid gap-6 sm:mx-0 sm:grid-cols-3'>
          {pillars.map((p) => (
            <div
              key={p.id}
              data-reveal-item
              className='rounded-2xl border border-slate-200 bg-white/70 p-7 shadow-sm transition-colors hover:border-blue-500/40 hover:bg-white'
            >
              <span className='text-3xl'>
                <p.icon />
              </span>
              <h3 className='mt-4 text-lg font-semibold text-slate-900'>
                {p.title}
              </h3>
              <p className='mt-2 text-sm leading-relaxed text-slate-600'>
                {p.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
