'use client';

import { usePathname } from 'next/navigation';

import { NO_FOOTER_PREFIXES } from '../constants/navigation';

/**
 * Leaves the footer out on routes whose designs have none (the shorts feed
 * fills the screen at every size). Everywhere else it renders as-is;
 * `contents` keeps this wrapper out of the layout.
 */
export default function FooterVisibility({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const hideFooter = NO_FOOTER_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (hideFooter) return null;

  return <div className='contents'>{children}</div>;
}
