import Link from 'next/link';

import { CategoryBadge } from './CategoryBadge';

export type RecentSearchProps = {
  headline: string;
  category: string;
  href?: string;
  onSelect?: () => void;
};

export default function RecentSearch({
  headline,
  category,
  href,
  onSelect,
}: RecentSearchProps) {
  const content = (
    <>
      {/* Headline */}
      <div className='line-clamp-2 min-w-0 flex-1 text-sm leading-relaxed font-medium text-gray-900 md:text-base'>
        {headline}
      </div>

      {/* Category Badge */}
      <div className='shrink-0 text-xs whitespace-nowrap'>
        <CategoryBadge category={category} />
      </div>
    </>
  );

  const className =
    'border-divider flex w-full items-center gap-1 border-b bg-white p-2 last:border-b-0 sm:px-4 sm:py-3';

  if (!href) {
    return <div className={className}>{content}</div>;
  }

  return (
    <Link
      href={href}
      scroll
      onClick={onSelect}
      className={`${className} hover:bg-gray-50`}
    >
      {content}
    </Link>
  );
}
