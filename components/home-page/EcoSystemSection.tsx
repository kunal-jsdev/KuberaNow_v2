'use client';

import { useRef, useState } from 'react';

import { ecosystemCards, ecosystemIntro } from '../../constants/home';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useStackingCardsPin } from '../../hooks/useStackingCardsPin';

export function EcoSystemSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const stackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const reduced = useReducedMotion();

  useStackingCardsPin(sectionRef, stackRef, {
    cardCount: ecosystemCards.length,
    onActiveChange: setActiveIndex,
    scrub: 0.8,
    disabled: reduced,
  });

  return (
    <section
      ref={sectionRef}
      className='bg-kn-deep relative px-0! pt-6 sm:px-4! sm:pt-16'
      id='ecosystem'
    >
      <div className='mx-auto max-w-7xl'>
        <h2 className='max-w-3xl text-3xl leading-tight font-bold text-slate-900 sm:text-4xl lg:text-5xl'>
          {ecosystemIntro.title}
        </h2>
        <p className='mt-5 max-w-3xl text-base leading-relaxed text-slate-700 lg:text-lg'>
          {ecosystemIntro.lead}
        </p>
        <p className='mt-4 max-w-3xl text-base leading-relaxed text-slate-600 lg:text-lg'>
          {ecosystemIntro.vision}
        </p>
      </div>
      <div className='flex min-h-0 items-center py-10 lg:min-h-[60vh]'>
        <div className='mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-10 lg:grid-cols-[1fr_380px]'>
          {/* Stacking cards */}
          <div
            ref={stackRef}
            className='mx-auto grid w-full max-w-lg'
          >
            {ecosystemCards.map((card, i) => (
              <div
                key={card.id}
                data-stack-card
                className={`relative col-start-1 row-start-1 rounded-3xl border border-slate-200 bg-linear-to-br ${card.accent} p-5 shadow-lg shadow-indigo-900/5 backdrop-blur-xl will-change-transform sm:p-8`}
                style={{ zIndex: i + 1 }}
              >
                <div className='flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900/10 text-base font-bold text-slate-800 sm:h-14 sm:w-14 sm:text-lg'>
                  {card.icon}
                </div>
                <p className='mt-4 text-xs font-semibold tracking-widest text-slate-600 uppercase sm:mt-6'>
                  {card.subtitle}
                </p>
                <h3 className='mt-2 text-2xl font-bold text-slate-900 sm:text-3xl'>
                  {card.title}
                </h3>
                <p className='mt-3 text-sm leading-relaxed text-slate-700 sm:mt-4 sm:text-base'>
                  {card.description}
                </p>
                <div className='absolute right-4 bottom-4 text-4xl font-black text-slate-900/5 sm:right-6 sm:bottom-6 sm:text-6xl'>
                  {String(i + 1).padStart(2, '0')}
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar nav */}
          <aside className='hidden lg:block'>
            <ul className='space-y-3'>
              {ecosystemCards.map((card, i) => (
                <li
                  key={card.id}
                  className={`rounded-xl border px-4 py-3 transition-all duration-300 ${
                    activeIndex === i
                      ? 'border-blue-500 bg-blue-50 font-bold text-blue-900'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className='text-sm font-medium'>{card.title}</span>
                </li>
              ))}
            </ul>
            <div className='mt-8 rounded-2xl border border-amber-200 bg-amber-50/50 p-5 shadow-xs'>
              <p className='text-sm font-semibold text-amber-800'>
                Credible journalism · Technology-driven · Integrated
                communication
              </p>
              <p className='mt-2 text-xs leading-relaxed text-slate-600'>
                Empowering the entrepreneurs, investors, and wealth creators of
                the region.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
