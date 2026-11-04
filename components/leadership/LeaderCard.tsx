import LeaderBadge from '@/components/leadership/LeaderBadge';
import LeaderPhoto from '@/components/leadership/LeaderPhoto';
import type { Leader } from '@/constants/leadership';

export default function LeaderCard({ leader }: { leader: Leader }) {
  return (
    <article className='leader-card border-career-stroke relative flex min-w-0 flex-1 flex-col items-center justify-start gap-2 rounded-[8px_8px_8px_0] border-[0.5px] bg-white p-2 lg:gap-4 lg:rounded-[16px_16px_16px_0] lg:border lg:p-4'>
      <div className='flex flex-col items-center gap-1 lg:gap-2'>
        {/* Two photo sizes: 85px circle on mobile, 180px from lg up. */}
        <LeaderPhoto
          name={leader.name}
          image={leader.image}
          className='size-23.75 lg:hidden'
          photoClassName='size-[85.77px]'
          borderWidth={1.43}
          ringWidth={2}
          accentWidth={1}
          sizes='86px'
          priority
        />
        <LeaderPhoto
          name={leader.name}
          image={leader.image}
          className='hidden size-50 lg:block'
          photoClassName='size-45'
          borderWidth={3}
          ringWidth={2}
          accentWidth={2}
          sizes='180px'
          priority
        />
        <div className='flex flex-col items-center gap-2 lg:gap-4'>
          <h2 className='text-career-dark text-lg leading-5.5 font-bold whitespace-nowrap lg:text-[32px] lg:leading-10'>
            {leader.name}
          </h2>
          <LeaderBadge label={leader.designation} />
        </div>
      </div>
      <p className='text-career-dark flex w-full items-center gap-1.5 lg:max-w-81.75 lg:gap-3'>
        <span className='w-8.25 shrink-0 text-lg leading-5.5 font-bold lg:w-17.25 lg:text-[40px] lg:leading-11'>
          {leader.experience}
        </span>
        <span className='min-w-0 flex-1 text-[10px] leading-3.5 lg:flex lg:min-h-13.5 lg:items-center lg:text-sm lg:leading-4.5'>
          {leader.description}
        </span>
      </p>
    </article>
  );
}
