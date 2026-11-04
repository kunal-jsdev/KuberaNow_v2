'use client';

import { useEffect, useState } from 'react';

import { searchNews, type SearchNewsItem } from '@/Payload/actions/searchNews';
import { trackSearchClick } from '@/Payload/actions/trackSearchClick';

import RecentSearch from './RecentSearching';

const CATEGORIES = [
  { label: 'All', value: 'all' },
  { label: 'Market', value: 'market' },
  { label: 'Economy', value: 'economy' },
  { label: 'Companies', value: 'companies' },
  { label: 'Personal Finance', value: 'personal-finance' },
] as const;
type Category = (typeof CATEGORIES)[number]['value'];

export default function RecentSearchWrapper({
  query = '',
  onSelect,
}: {
  query?: string;
  onSelect?: () => void;
}) {
  const [selected, setSelected] = useState<Category>('all');
  const [items, setItems] = useState<SearchNewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const timer = setTimeout(async () => {
      setLoading(true);
      const results = await searchNews(query, selected);
      if (cancelled) return;
      setItems(results);
      setLoading(false);
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, selected]);

  const handleSelect = (id: string) => {
    onSelect?.();
    void trackSearchClick(id);
  };

  let message = '';
  if (loading) message = 'Loading…';
  else if (items.length === 0) message = 'No news found.';

  return (
    <div className='mb-2 flex w-full flex-col'>
      <div className='border-ad-leaderboard flex w-full items-center justify-around gap-2 overflow-x-auto border-b px-2 py-1.5'>
        {CATEGORIES.map((cat) => {
          const isActive = selected === cat.value;
          return (
            <button
              key={cat.value}
              type='button'
              onClick={() => setSelected(cat.value)}
              className={
                isActive
                  ? 'bg-primary text-content-small flex h-7 w-fit shrink-0 items-center justify-center rounded-[20px] px-3 py-1 text-center font-semibold text-white'
                  : 'hover:text-primary text-search-muted text-content-small h-7 w-fit shrink-0'
              }
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      <p className='mt-3 h-full w-full px-2 text-xs font-semibold text-gray-500'>
        {query.trim() ? 'Search Results' : 'Latest News'}
      </p>

      {message && <p className='px-2 py-3 text-xs text-gray-400'>{message}</p>}

      {!message &&
        items.map((item) => (
          <RecentSearch
            key={item.id}
            headline={item.title}
            category={item.categoryTitle}
            href={item.href}
            onSelect={() => handleSelect(item.id)}
          />
        ))}
    </div>
  );
}
