'use client';

import { usePathname } from 'next/navigation';

import { COMING_SOON_ROUTES } from '../constants/navigation';

import ComingSoon from './common/ComingSoon';

export default function ContentWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentRoute = usePathname();

  if (COMING_SOON_ROUTES.includes(currentRoute)) {
    return (
      <div className='flex w-full flex-1 items-center justify-center'>
        <ComingSoon />
      </div>
    );
  }

  return (
    <div className='layout-main w-full max-w-full min-w-0 flex-1 xl:max-w-237.5'>
      {children}
    </div>
  );
}
