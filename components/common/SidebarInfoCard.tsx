import type { ReactNode } from 'react';

type SidebarInfoCardProps = {
  title: string;
  children: ReactNode;
  className?: string;
};

export default function SidebarInfoCard({
  title,
  children,
  className = '',
}: SidebarInfoCardProps) {
  return (
    <section
      className={`border-career-stroke bg-surface overflow-hidden rounded-md border-[1.25px] lg:rounded-[5px] ${className}`}
    >
      <div className='bg-primary px-4 py-3'>
        <h2 className='text-sm leading-[18px] font-semibold text-white/85'>
          {title}
        </h2>
      </div>
      <div className='p-4'>{children}</div>
    </section>
  );
}
