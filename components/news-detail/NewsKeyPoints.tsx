import KeyPointsIcon from '@/lib/Icons/KeyPointsIcon';
import { cn } from '@/Payload/lib/utilities/ui';
import type { News } from '@/payload-types';

type NewsKeyPointsProps = {
  points: NonNullable<News['keyPoints']>;
  heading?: string;
  className?: string;
  maxPoints?: number;
};

export default function NewsKeyPoints({
  points,
  heading = 'મુખ્ય મુદ્દાઓ',
  className = '',
  maxPoints = 4,
}: NewsKeyPointsProps) {
  if (!points || points.length === 0) {
    return null;
  }

  const hasMax = typeof maxPoints === 'number' && maxPoints > 0;
  const displayPoints = hasMax ? points.slice(0, maxPoints) : points;
  const hasMore = hasMax && points.length > maxPoints;

  return (
    <aside
      className={cn(
        'bg-career-tint border-primary my-4 flex flex-col rounded-lg border-l-4 py-3.5 pr-5 pl-4 md:my-6',
        className
      )}
    >
      <div className='flex shrink-0 items-center gap-2'>
        <KeyPointsIcon className='text-primary size-3.5 shrink-0' />
        <h2 className='text-primary text-sm leading-4.5 font-semibold'>
          {heading}
        </h2>
      </div>

      <ul className='mt-3 flex list-disc flex-col gap-2.5 pl-4'>
        {displayPoints.map((kp, idx) => (
          <li
            key={kp.id ?? `${kp.point}-${idx}`}
            className='text-career-dark [font-family:var(--font-noto-sans),var(--font-noto-sans-guj),sans-serif] text-sm leading-5 font-normal tracking-normal md:text-base md:leading-[22px]'
          >
            {kp.point}
          </li>
        ))}
      </ul>

      {hasMore && (
        <div className='mt-auto flex shrink-0 justify-end pt-2 pr-1'>
          <span
            className='text-primary text-sm leading-none font-bold tracking-widest select-none'
            title='વધુ મુખ્ય મુદ્દાઓ'
            aria-label='વધુ મુદ્દાઓ'
          >
            ...
          </span>
        </div>
      )}
    </aside>
  );
}
