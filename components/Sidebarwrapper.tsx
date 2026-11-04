'use client';
import { usePathname } from 'next/navigation';

import {
  COMING_SOON_ROUTES,
  DESKTOP_ONLY_SIDEBAR_PREFIXES,
  EXCLUDE_SIDEBAR_ROUTES,
  staticRoutes,
} from '../constants/navigation';

import RightSidebar from './RightSidebar';

export default function SidebarWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentRoute = usePathname();
  if (COMING_SOON_ROUTES.indexOf(currentRoute) !== -1) return null;
  if (EXCLUDE_SIDEBAR_ROUTES.indexOf(currentRoute) !== -1) return null;
  const isStaticPage = staticRoutes.includes(currentRoute);
  // On these pages the sidebar sits beside the content only on desktop;
  // tablets have none (phones get it under the content from the page itself).
  const isDesktopOnly = DESKTOP_ONLY_SIDEBAR_PREFIXES.some((prefix) =>
    currentRoute.startsWith(prefix)
  );
  const isMobileInterleaved =
    !isDesktopOnly ||
    currentRoute === '/short-videos' ||
    currentRoute.startsWith('/videos');
  return (
    <div
      className={`order-1 hidden flex-col items-center lg:order-2 lg:w-76 lg:shrink-0 ${
        isDesktopOnly ? 'lg:flex' : 'md:flex'
      } ${isMobileInterleaved ? 'layout-aside' : ''}`}
    >
      <div
        key={currentRoute}
        className='layout-aside-items flex w-full flex-col items-center gap-4'
      >
        {children}
      </div>
      {isStaticPage && <RightSidebar />}
    </div>
  );
}
