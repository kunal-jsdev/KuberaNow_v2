import Link from 'next/link';

export type SidebarNewsItem = {
  id: string | number;
  headline: string;
  href?: string;
};

type SidebarNewsCardProps = {
  title: string;
  items: SidebarNewsItem[];
  seeMoreHref?: string;
  seeMoreLabel?: string;
  className?: string;
};

export default function SidebarNewsCard({
  title,
  items,
  seeMoreHref,
  seeMoreLabel = 'See more',
  className = '',
}: SidebarNewsCardProps) {
  if (items.length === 0) return null;

  return (
    <section
      aria-label={`${title} News`}
      className={`border-divider bg-surface w-85.75 max-w-full overflow-hidden rounded-[5px] border p-4 md:w-76`}
    >
      <header className='border-dark-blue flex h-7.5 items-center justify-between border-b px-2.5 py-2'>
        <h2 className='text-career-dark text-heading-small min-w-0 truncate leading-5.5 font-bold'>
          {title.split(' ').slice(0, 4).join(' ')}
        </h2>
        {seeMoreHref && (
          <Link
            href={seeMoreHref}
            className='text-dark-blue hover:text-primary-navy focus-visible:outline-dark-blue text-content-small leading-4 font-semibold underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2'
          >
            {seeMoreLabel}
          </Link>
        )}
      </header>

      <ol>
        {items.map((item, index) => (
          <li
            key={item.id}
            className='border-divider flex min-h-14 items-start gap-2 border-b py-2 last:border-b-0'
          >
            <span
              className='text-light-navy4 text-heading-big shrink-0 leading-7 font-semibold'
              aria-hidden='true'
            >
              {String(index + 1).padStart(2, '0')}
            </span>
            {item.href ? (
              <Link
                href={item.href}
                scroll
                className='text-career-dark hover:text-dark-blue focus-visible:outline-dark-blue line-clamp-2 text-[16px] leading-snug font-bold focus-visible:outline-2 focus-visible:outline-offset-2'
              >
                {item.headline}
              </Link>
            ) : (
              <p className='text-career-dark line-clamp-2 min-h-10 text-[16px] leading-normal font-bold'>
                {item.headline}
              </p>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
