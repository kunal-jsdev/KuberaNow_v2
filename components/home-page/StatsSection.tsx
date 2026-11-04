'use client';

import { useRef, useState } from 'react';

import { useGSAP } from '@gsap/react';

import { statsNavItems } from '../../constants/home';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { gsap } from '../../lib/utils/gsap';

export function StatsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (
        !sectionRef.current ||
        !pinRef.current ||
        !trackRef.current ||
        reduced
      )
        return;

      const slides = gsap.utils.toArray<HTMLElement>(
        trackRef.current.querySelectorAll('[data-stat-slide]')
      );
      const maxIdx = slides.length - 1;
      if (maxIdx < 1) return;

      const getSlideStep = () => slides[0]?.offsetHeight ?? 420;

      const syncNav = (progress: number) => {
        const idx = Math.min(maxIdx, Math.round(progress * maxIdx));
        setActiveIndex(idx);
        if (progressRef.current) {
          progressRef.current.style.height = `${((idx + 1) / slides.length) * 100}%`;
        }
      };

      gsap.set(trackRef.current, { y: 0 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'center center',
          end: `+=${slides.length * 80}%`,
          pin: pinRef.current,
          pinSpacing: true,
          anticipatePin: 1,
          scrub: 0.6,
          invalidateOnRefresh: true,
          onUpdate: (self) => syncNav(self.progress),
        },
      });

      tl.to(trackRef.current, {
        y: () => -getSlideStep() * maxIdx,
        ease: 'none',
        duration: maxIdx,
      });
    },
    { scope: sectionRef, dependencies: [reduced] }
  );

  return (
    <section
      ref={sectionRef}
      className='bg-kn-deep relative mt-20 lg:mt-0'
      id='convergence'
    >
      <div
        ref={pinRef}
        className='flex h-svh flex-col py-16 md:justify-center md:gap-8 lg:gap-10 lg:py-20'
      >
        <div className='mx-auto mb-8 w-full max-w-7xl px-0 sm:px-4'>
          <p className='text-sm font-medium tracking-[0.2em] text-blue-700 uppercase'>
            The Great Convergence
          </p>
          <h2
            data-reveal-heading
            className='mt-2 max-w-2xl text-3xl font-bold text-slate-900 sm:text-4xl lg:text-5xl'
          >
            Capital Meets Culture
          </h2>
          <p className='mt-3 max-w-xl text-slate-600'>
            Gujarat is 5% of India&apos;s population but commands 15% of its
            demat accounts — a convergence of capital, culture, and
            unprecedented retail participation.
          </p>
        </div>
        <div className='mx-auto grid w-full max-w-7xl grid-cols-1 items-start gap-8 px-4 sm:px-6 lg:grid-cols-[240px_1fr] lg:gap-12 lg:px-12'>
          <nav className='relative hidden lg:block'>
            <div className='absolute top-0 left-0 h-full w-px bg-slate-300' />
            <div
              ref={progressRef}
              className='absolute top-0 left-0 w-px bg-linear-to-b from-blue-600 to-cyan-600 transition-all duration-300'
              style={{ height: `${(1 / statsNavItems.length) * 100}%` }}
            />
            <ul className='space-y-6 pl-6'>
              {statsNavItems.map((item, i) => (
                <li
                  key={item.id}
                  className={`transition-all duration-300 ${
                    activeIndex === i ? 'text-slate-900' : 'text-slate-400'
                  }`}
                >
                  <span className='text-xs font-medium tracking-wider uppercase'>
                    {item.label}
                  </span>
                  <p
                    className={`text-lg font-bold ${
                      activeIndex === i
                        ? 'font-bold text-blue-700'
                        : 'text-slate-500'
                    }`}
                  >
                    {item.value}
                  </p>
                </li>
              ))}
            </ul>
          </nav>
          <div>
            <div className='relative h-105 overflow-hidden'>
              <div
                ref={trackRef}
                className='will-change-transform'
              >
                {statsNavItems.map((item) => (
                  <div
                    key={item.id}
                    data-stat-slide
                    className='flex h-105 shrink-0 flex-col justify-start'
                  >
                    <div
                      data-stat-card
                      className='rounded-3xl border border-slate-200 bg-linear-to-br from-white/90 to-white/60 p-6 shadow-lg backdrop-blur-md lg:p-10'
                    >
                      <span className='inline-block rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-700'>
                        {item.metric}
                      </span>
                      <p className='mt-6 bg-linear-to-br from-blue-700 to-indigo-900 bg-clip-text text-5xl font-bold text-transparent lg:text-7xl'>
                        {item.value}
                      </p>
                      <h3 className='mt-4 text-xl font-semibold text-slate-900 lg:text-2xl'>
                        {item.title}
                      </h3>
                    </div>
                    <div
                      data-stat-detail
                      className='mt-6 max-w-lg'
                    >
                      <p className='text-base leading-relaxed text-slate-600'>
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className='mt-8 flex justify-center gap-2 lg:hidden'>
              {statsNavItems.map((item, i) => (
                <span
                  key={item.id}
                  className={`h-1.5 rounded-full transition-all ${
                    activeIndex === i ? 'w-8 bg-blue-600' : 'w-1.5 bg-slate-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
