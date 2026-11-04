import Link from 'next/link';

import type { CategoryBadgeProps } from './types';

export function CategoryBadge({
  category,
  categorySlug,
  children,
  className = '',
}: CategoryBadgeProps) {
  if (!children && !category) return null;
  return (
    <span
      className={`inline-flex w-fit items-center rounded-full border border-main-page-badge-border bg-career-chip-bg px-2 py-0.5 text-xs leading-none text-primary ${className}`.trim()}
    >
      {' '}
      <Link href={categorySlug ? `/${categorySlug}` : '/'}>
        {children ?? category}
      </Link>
    </span>
  );
}
