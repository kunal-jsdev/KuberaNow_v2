'use client';

import { RefObject, useEffect, useRef } from 'react';

import { useGSAP } from '@gsap/react';

import { gsap } from '../lib/utils/gsap';

type Options = {
  cardCount: number;
  onActiveChange?: (index: number) => void;
  scrub?: number;
  disabled?: boolean;
};

export function useStackingCardsPin(
  sectionRef: RefObject<HTMLElement | null>,
  cardsRef: RefObject<HTMLElement | null>,
  { cardCount, onActiveChange, scrub = 0.8, disabled = false }: Options
) {
  const onActiveRef = useRef(onActiveChange);
  useEffect(() => {
    onActiveRef.current = onActiveChange;
  }, [onActiveChange]);

  useGSAP(
    () => {
      if (disabled || !sectionRef.current || !cardsRef.current) return;

      const cards = gsap.utils.toArray<HTMLElement>(
        cardsRef.current.querySelectorAll('[data-stack-card]')
      );
      if (!cards.length) return;

      gsap.set(cards, { transformOrigin: 'center top' });
      gsap.set(cards.slice(1), { yPercent: 105, opacity: 0 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: `+=${cardCount * 100}%`,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          scrub,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const idx = Math.min(
              cardCount - 1,
              Math.floor(self.progress * cardCount)
            );
            onActiveRef.current?.(idx);
          },
        },
      });

      cards.forEach((card, i) => {
        if (i === 0) return;
        const prev = cards[i - 1];
        tl.to(
          card,
          { yPercent: 0, opacity: 1, duration: 1, ease: 'power2.out' },
          i
        ).to(
          prev,
          {
            scale: 0.92 - i * 0.02,
            rotationX: 4 + i,
            opacity: 0.55,
            duration: 1,
            ease: 'power2.inOut',
          },
          i
        );
      });
    },
    { scope: sectionRef, dependencies: [cardCount, scrub, disabled] }
  );
}
