'use client';

type ShortsNavButtonsProps = {
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
  className?: string;
};

const buttonClassName =
  'flex size-13.5 cursor-pointer items-center justify-center rounded-full bg-white text-black shadow-[0px_0px_6px_0px_rgba(153,153,153,0.8)] transition-[background-color,color,box-shadow] hover:bg-career-tint hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-black';

function Chevron({ direction }: { direction: 'up' | 'down' }) {
  return (
    <svg
      viewBox='0 0 17.92 10.28'
      width={17.92}
      height={10.28}
      aria-hidden='true'
      className='fill-none stroke-current'
      strokeWidth={2.2}
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <path
        d={
          direction === 'up'
            ? 'M1.1 9.18 8.96 1.1l7.86 8.08'
            : 'M1.1 1.1l7.86 8.08 7.86-8.08'
        }
      />
    </svg>
  );
}

/** Up / down through the shorts feed. */
export default function ShortsNavButtons({
  onPrev,
  onNext,
  hasPrev,
  hasNext,
  className = '',
}: ShortsNavButtonsProps) {
  return (
    <nav
      aria-label='Shorts'
      className={`flex gap-6 ${className}`}
    >
      <button
        type='button'
        onClick={onPrev}
        disabled={!hasPrev}
        aria-label='Previous short'
        title='Previous short'
        className={buttonClassName}
      >
        <Chevron direction='up' />
      </button>
      <button
        type='button'
        onClick={onNext}
        disabled={!hasNext}
        aria-label='Next short'
        title='Next short'
        className={buttonClassName}
      >
        <Chevron direction='down' />
      </button>
    </nav>
  );
}
