'use client';

import { useId, useRef } from 'react';

import { useGSAP } from '@gsap/react';

import { heroStats } from '../../../constants/home';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import GujaratIcon, { GANDHINAGAR } from '../../../lib/Icons/GujaratIcon';
import { gsap } from '../../../lib/utils/gsap';

const GUJARAT_MAP_OFFSET_X = 144;
const GUJARAT_MAP_VIEWBOX_WIDTH = 512;

export function HeroAnimation() {
  const containerRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const uid = useId().replace(/:/g, '');
  const jPathId = `hero-j-path-${uid}`;
  const lineGradId = `lineGrad-${uid}`;
  const arrowGradId = `arrowGrad-${uid}`;
  const arrowGlowId = `arrowGlow-${uid}`;

  useGSAP(
    () => {
      if (!containerRef.current) return;

      if (reduced) {
        const map = containerRef.current.querySelector('[data-hero-map]');
        const pulse = containerRef.current.querySelector('[data-hero-pulse]');
        const gandhinagarLabel = containerRef.current.querySelector(
          '[data-hero-gandhinagar-label]'
        );
        const bars = containerRef.current.querySelectorAll('[data-hero-bar]');
        const card = containerRef.current.querySelector('[data-hero-card]');
        const lineChart =
          containerRef.current.querySelector('[data-hero-line]');
        gsap.set(map, { x: 0, scale: 2, opacity: 1 });
        gsap.set(pulse, { scale: 1, opacity: 1 });
        if (gandhinagarLabel) gsap.set(gandhinagarLabel, { opacity: 1 });
        gsap.set(bars, { scaleY: 1 });
        gsap.set(card, { x: 0, opacity: 1 });
        if (lineChart) gsap.set(lineChart, { strokeDashoffset: 0 });
        return;
      }

      const map = containerRef.current.querySelector('[data-hero-map]');
      const pulse = containerRef.current.querySelector('[data-hero-pulse]');
      const gandhinagarLabel = containerRef.current.querySelector(
        '[data-hero-gandhinagar-label]'
      );
      const bars = containerRef.current.querySelectorAll('[data-hero-bar]');
      const card = containerRef.current.querySelector('[data-hero-card]');
      const arrow = containerRef.current.querySelector('[data-hero-arrow]');
      const tail = containerRef.current.querySelector('[data-hero-tail]');
      const lineChart = containerRef.current.querySelector('[data-hero-line]');
      const glow = containerRef.current.querySelector('[data-hero-glow]');

      gsap.set(map, { transformOrigin: '30% 60%' });

      const reset = () => {
        gsap.set(map, { x: -120, scale: 1.3, opacity: 0 });
        gsap.set(pulse, { scale: 0, opacity: 0 });
        if (gandhinagarLabel) gsap.set(gandhinagarLabel, { opacity: 0 });
        gsap.set(bars, { scaleY: 0, transformOrigin: 'bottom center' });
        gsap.set(card, { x: 140, opacity: 0 });
        gsap.set(arrow, {
          opacity: 0,
          motionPath: {
            path: `#${jPathId}`,
            align: `#${jPathId}`,
            alignOrigin: [0.5, 0.5],
            start: 0,
            end: 0,
          },
        });
        gsap.set(tail, { opacity: 0 });
        if (lineChart) gsap.set(lineChart, { strokeDashoffset: 400 });
        gsap.set(glow, { opacity: 0 });
      };

      reset();

      const tl = gsap.timeline({
        repeat: -1,
        repeatDelay: 1.2,
        defaults: { ease: 'power3.out' },
        onRepeat: reset,
      });

      tl.to(map, {
        x: 0,
        scale: 2,
        opacity: 1,
        duration: 1.1,
        ease: 'back.out(1.4)',
      }).to(pulse, { scale: 1, opacity: 1, duration: 0.5 }, '-=0.3');
      if (gandhinagarLabel) {
        tl.to(gandhinagarLabel, { opacity: 1, duration: 0.5 }, '-=0.5');
      }
      tl.to(
        pulse,
        {
          scale: 1.35,
          opacity: 0,
          duration: 1.2,
          repeat: 2,
          yoyo: true,
          ease: 'sine.inOut',
        },
        '-=0.2'
      )
        .to(
          bars,
          { scaleY: 1, duration: 0.7, stagger: 0.12, ease: 'back.out(1.6)' },
          '-=1.4'
        )
        .to(glow, { opacity: 1, duration: 0.5 }, '-=0.6')
        .to(
          card,
          { x: 0, opacity: 1, duration: 0.9, ease: 'power4.out' },
          '-=0.5'
        )
        .to(
          lineChart,
          { strokeDashoffset: 0, duration: 1.4, ease: 'power2.inOut' },
          '-=0.8'
        )
        .set(arrow, { opacity: 1 })
        .set(tail, { opacity: 0.35 })
        .to(arrow, {
          motionPath: {
            path: `#${jPathId}`,
            align: `#${jPathId}`,
            alignOrigin: [0.5, 0.5],
            autoRotate: true,
            start: 0,
            end: 1,
          },
          duration: 1.8,
          ease: 'power1.inOut',
        })
        .to(
          tail,
          {
            motionPath: {
              path: `#${jPathId}`,
              align: `#${jPathId}`,
              alignOrigin: [0.5, 0.5],
              start: 0,
              end: 0.85,
            },
            duration: 1.8,
            ease: 'power1.inOut',
          },
          '<'
        )
        .to([arrow, tail], { opacity: 0, duration: 0.35, ease: 'power2.in' });
    },
    { scope: containerRef, dependencies: [reduced] }
  );

  return (
    <div
      ref={containerRef}
      className={`relative mx-auto aspect-4/3 w-full max-w-2xl overflow-hidden ${reduced ? '[&_[data-hero-card]]:!opacity-100 [&_[data-hero-map]]:!opacity-100' : ''}`}
      aria-hidden
    >
      {/* Background line chart */}
      <svg
        className='absolute inset-0 h-full w-full opacity-30'
        viewBox='0 0 400 300'
      >
        <path
          data-hero-line
          d='M20 220 C80 200, 120 180, 160 190 S240 120, 320 80 L380 60'
          fill='none'
          stroke={`url(#${lineGradId})`}
          strokeWidth='2'
          strokeDasharray='400'
          strokeDashoffset='400'
        />
        <defs>
          <linearGradient
            id={lineGradId}
            x1='0%'
            y1='0%'
            x2='100%'
            y2='0%'
          >
            <stop
              offset='0%'
              stopColor='#3b82f6'
              stopOpacity='0.2'
            />
            <stop
              offset='100%'
              stopColor='#60a5fa'
              stopOpacity='0.8'
            />
          </linearGradient>
        </defs>
      </svg>

      {/* City skyline */}
      <svg
        className='absolute bottom-0 left-0 w-full opacity-20'
        viewBox='0 0 400 80'
        preserveAspectRatio='none'
      >
        <path
          d='M0 80 L0 55 L20 55 L20 40 L35 40 L35 50 L50 50 L50 25 L65 25 L65 45 L80 45 L80 30 L100 30 L100 50 L115 50 L115 20 L130 20 L130 55 L150 55 L150 35 L170 35 L170 50 L190 50 L190 15 L210 15 L210 45 L230 45 L230 30 L250 30 L250 55 L270 55 L270 40 L290 40 L290 55 L310 55 L310 25 L330 25 L330 50 L350 50 L350 35 L370 35 L370 55 L400 55 L400 80 Z'
          fill='#cbd5e1'
        />
      </svg>

      {/* Floor glow */}
      <div
        data-hero-glow
        className='absolute bottom-[18%] left-1/2 h-8 w-[70%] -translate-x-1/2 rounded-full bg-blue-400/20 blur-2xl'
      />

      {/* Gujarat map — Gandhinagar marker */}
      <div
        data-hero-map
        className='absolute top-[18%] left-[10%] w-[30%] max-w-36'
      >
        <GujaratIcon
          className='w-full drop-shadow-[0_0_15px_rgba(96,165,250,0.25)]'
          showGandhinagar
        />
        <div
          data-hero-pulse
          className='pointer-events-none absolute h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full border border-blue-500/70 bg-blue-500/20'
          style={{
            left: `${((GANDHINAGAR.x - GUJARAT_MAP_OFFSET_X) / GUJARAT_MAP_VIEWBOX_WIDTH) * 100}%`,
            top: `${((GANDHINAGAR.y - GUJARAT_MAP_OFFSET_X) / GUJARAT_MAP_VIEWBOX_WIDTH) * 100}%`,
          }}
        />
      </div>

      {/* Bar chart */}
      <div className='absolute bottom-[22%] left-[48%] flex h-[38%] items-end gap-2'>
        {heroStats.map((bar, i) => (
          <div
            key={bar.label}
            className='flex flex-col items-center gap-1'
          >
            <div
              data-hero-bar
              className='w-7 rounded-t-sm bg-linear-to-t from-blue-600 to-cyan-400 shadow-[0_0_16px_rgba(59,130,246,0.15)]'
              style={{ height: `${bar.height}px` }}
            />
            <span className='text-[7px] text-slate-500'>{i + 1}</span>
          </div>
        ))}
      </div>

      {/* Glass stat card */}
      <div
        data-hero-card
        className='absolute top-[28%] right-[2%] w-[54%] rounded-2xl border border-slate-200 bg-white/80 p-2.5 shadow-[0_8px_32px_rgba(9,30,66,0.08)] backdrop-blur-xl sm:p-4'
      >
        <p className='text-[9px] leading-tight font-medium tracking-widest text-nowrap text-blue-700 uppercase sm:text-xs'>
          New Demat Accounts
        </p>
        <p className='mt-1 bg-linear-to-r from-blue-700 to-indigo-900 bg-clip-text text-2xl font-bold text-transparent sm:text-4xl'>
          13+ Cr
        </p>
        <p className='mt-1 text-[10px] leading-snug text-slate-600 sm:text-xs'>
          Added nationally since 2020
        </p>
        <div className='mt-2 h-px w-full bg-linear-to-r from-transparent via-blue-200 to-transparent' />
        <p className='mt-2 text-[9px] text-amber-800 sm:text-[11px]'>
          Gujarat · 15% share
        </p>
      </div>

      {/* J-curve arrow path */}
      <svg className='pointer-events-none absolute h-full w-full overflow-visible'>
        <defs>
          <linearGradient
            id={arrowGradId}
            x1='0%'
            y1='100%'
            x2='100%'
            y2='0%'
          >
            <stop
              offset='0%'
              stopColor='#3b82f6'
            />
            <stop
              offset='100%'
              stopColor='#22d3ee'
            />
          </linearGradient>
          <filter id={arrowGlowId}>
            <feGaussianBlur
              stdDeviation='2'
              result='blur'
            />
            <feMerge>
              <feMergeNode in='blur' />
              <feMergeNode in='SourceGraphic' />
            </feMerge>
          </filter>
        </defs>
        <path
          id={jPathId}
          d='M 108 118 C 150 210, 230 230, 310 72'
          fill='none'
          stroke='rgba(59,130,246,0.08)'
          strokeWidth='1.5'
          strokeDasharray='4 6'
        />
        <g
          data-hero-tail
          filter={`url(#${arrowGlowId})`}
        >
          <line
            x1='-12'
            y1='0'
            x2='0'
            y2='0'
            stroke={`url(#${arrowGradId})`}
            strokeWidth='3'
            strokeLinecap='round'
            opacity='0.5'
          />
        </g>
        <g
          data-hero-arrow
          filter={`url(#${arrowGlowId})`}
        >
          <polygon
            points='0,-6 14,0 0,6'
            fill={`url(#${arrowGradId})`}
          />
        </g>
      </svg>

      {/* Bar reflections */}
      <div className='absolute bottom-[16%] left-[48%] flex gap-2 opacity-20 blur-sm'>
        {heroStats.map((bar) => (
          <div
            key={`ref-${bar.label}`}
            className='w-7 rounded-t-sm bg-blue-400'
            style={{ height: `${bar.height * 0.25}px` }}
          />
        ))}
      </div>
    </div>
  );
}
