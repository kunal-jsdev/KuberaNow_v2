import type { ReactNode } from 'react';

import PageSectionHeader from '@/components/common/PageSectionHeader';

interface MarketCardSectionProps {
  title: string;
  children: ReactNode;
  className?: string;
  as?: 'h1' | 'h3';
}

export default function MarketCardSection({
  title,
  children,
  className = '',
  as = 'h3',
}: MarketCardSectionProps) {
  return (
    <section
      className={`border-career-stroke w-full rounded-xl border bg-white p-4 shadow-xs md:p-6 ${className}`}
    >
      <PageSectionHeader
        title={title}
        as={as}
        className='mb-4'
      />
      <div className='w-full overflow-hidden rounded-lg'>{children}</div>
    </section>
  );
}
