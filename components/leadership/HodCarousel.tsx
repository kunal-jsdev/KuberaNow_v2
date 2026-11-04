'use client';

import { useState } from 'react';

import Image from 'next/image';

import type { HeadOfDepartment } from '@/constants/leadership';

type HodCardProps = {
  hod: HeadOfDepartment;
  isActive: boolean;
  isDuplicate: boolean;
  onHoldStart: () => void;
  onHoldEnd: () => void;
};

function HodCard({
  hod,
  isActive,
  isDuplicate,
  onHoldStart,
  onHoldEnd,
}: HodCardProps) {
  return (
    // Spacing lives in the item's right padding (not a flex gap) so the
    // doubled track is exactly two equal halves and loops without a jump.
    <li
      className='shrink-0 pr-4 lg:pr-5'
      aria-hidden={isDuplicate || undefined}
    >
      <article
        data-active={isActive}
        onTouchStart={onHoldStart}
        onTouchEnd={onHoldEnd}
        onTouchCancel={onHoldEnd}
        onContextMenu={(event) => event.preventDefault()}
        className='hod-card border-career-stroke relative flex h-50 w-35.5 touch-pan-y flex-col justify-end overflow-hidden rounded-[8px_8px_8px_0] border bg-white select-none [-webkit-touch-callout:none] lg:h-74.75 lg:w-53 lg:rounded-[16px_16px_16px_0]'
      >
        <Image
          src={hod.image}
          alt={isDuplicate ? '' : hod.name}
          fill
          sizes='(min-width: 1024px) 212px, 142px'
          draggable={false}
          className='object-cover'
        />
        <span
          aria-hidden
          className='absolute inset-0 bg-[linear-gradient(179.53deg,rgba(1,8,116,0)_46.709%,#010874_98.596%)]'
        />
        <div className='relative flex flex-col items-start px-1.5 py-1 text-[#e6e1f6] text-shadow-[0px_2px_4px_rgba(0,0,0,0.25)] lg:gap-1 lg:p-2'>
          <p className='text-[8px] leading-3 font-semibold lg:text-xs lg:leading-4'>
            {hod.designation}
          </p>
          <h3 className='text-base leading-5 font-bold lg:text-xl lg:leading-6'>
            {hod.name}
          </h3>
          <p className='text-[8px] leading-3 lg:text-xs lg:leading-4'>
            {hod.description}
          </p>
        </div>
      </article>
    </li>
  );
}

export default function HodCarousel({ hods }: { hods: HeadOfDepartment[] }) {
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const loop = [...hods, ...hods];

  return (
    <div className='w-full overflow-hidden motion-reduce:overflow-x-auto'>
      <ul
        aria-label='Heads of department'
        data-paused={activeKey !== null}
        className='hod-marquee flex w-max'
      >
        {loop.map((hod, index) => {
          const key = `${hod.id}-${index}`;
          return (
            <HodCard
              key={key}
              hod={hod}
              isActive={activeKey === key}
              isDuplicate={index >= hods.length}
              onHoldStart={() => setActiveKey(key)}
              onHoldEnd={() => setActiveKey(null)}
            />
          );
        })}
      </ul>
    </div>
  );
}
