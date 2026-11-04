import type { ReactNode } from 'react';

type PageSectionHeaderProps = {
  title: ReactNode;
  className?: string;
  titleClassName?: string;
  as?: 'h1' | 'h3';
};

export default function PageSectionHeader({
  title,
  className = '',
  titleClassName = 'text-career-heading',
  as = 'h3',
}: PageSectionHeaderProps) {
  const Heading = as;
  return (
    <div className={`border-career-stroke border-b-2 pb-2 ${className}`}>
      <div className='relative flex h-auto min-h-8.25 shrink-0 items-center py-1 md:h-8.25 md:min-h-0 md:py-0'>
        <span
          className='bg-primary absolute left-0 h-5.5 w-1 rounded-xs shadow-[2px_0px_0px_0px_var(--color-career-accent)]'
          aria-hidden
        />
        <Heading
          className={`text-heading-small text-text-disclaimer pl-3 leading-6 font-bold md:text-2xl md:leading-7 ${titleClassName}`}
        >
          {title}
        </Heading>
      </div>
    </div>
  );
}
