'use client';

import Link from 'next/link';

import { CategoryOption } from '@/Payload/lib/utilities/getCategories';

type CategoryBarProps = {
  categories: readonly CategoryOption[];
  activeSlug?: string;
  className?: string;
};

export default function CategoryBar({
  categories,
  activeSlug,
  className = '',
}: CategoryBarProps) {
  const tabs: readonly CategoryOption[] = [...categories];

  return (
    <nav
      aria-label='News categories'
      className={`flex flex-wrap items-center gap-2 pb-1 ${className}`}
    >
      {tabs.map(({ title, slug }) => {
        const isActive = activeSlug === slug;

        return (
          <Link
            key={slug}
            href={`/category/${slug}`}
            aria-current={isActive ? 'page' : undefined}
            className={`shrink-0 rounded-md border px-4 py-1.5 text-sm font-semibold whitespace-nowrap transition-colors ${
              isActive
                ? 'bg-primary border-primary text-white'
                : 'bg-career-tint border-career-chip-border text-career-dark hover:border-primary hover:text-primary'
            }`}
          >
            {title}
          </Link>
        );
      })}
    </nav>
  );
}
