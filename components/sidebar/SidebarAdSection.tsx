import Image from 'next/image';

import sidebarAdPromotion from '../../public/assets/sidebar-ad-promotion.png';

type SidebarAdSectionProps = {
  className?: string;
};

export default function SidebarAdSection({
  className = '',
}: SidebarAdSectionProps) {
  return (
    <section
      className={`flex w-full max-w-76 flex-col items-center gap-2 ${className}`}
      aria-label='Advertisement'
    >
      <div className='border-career-stroke relative h-62.5 w-full overflow-hidden rounded-lg border shadow-[0px_1px_2px_0px_rgba(74,32,38,0.06),0px_1px_1px_0px_rgba(74,32,38,0.04)]'>
        <Image
          src={sidebarAdPromotion}
          alt='KuberaNow — Business, technology, and innovation insights'
          fill
          className='object-fill lg:object-cover'
          sizes='304px'
          priority
        />
      </div>
    </section>
  );
}
