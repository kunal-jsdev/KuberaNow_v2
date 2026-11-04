'use client';

import { Suspense, useEffect, useRef } from 'react';

import { usePathname, useSearchParams } from 'next/navigation';
import Script from 'next/script';

import { getPlatformType } from '@/utils/platform';

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

function PageViewTracker({ gaId }: { gaId: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isInitialLoad = useRef(true);

  useEffect(() => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return;
    }

    if (typeof window.gtag !== 'function') return;

    const query = searchParams.toString();
    const url = query ? `${pathname}?${query}` : pathname;
    const platformType = getPlatformType();

    /* eslint-disable camelcase */
    window.gtag('event', 'page_view', {
      page_path: url,
      page_location: window.location.href,
      page_title: document.title,
      platform_type: platformType,
      send_to: gaId,
    });
    /* eslint-enable camelcase */
  }, [pathname, searchParams, gaId]);

  return null;
}

export default function GoogleAnalytics() {
  if (!GA_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy='afterInteractive'
      />
      <Script
        id='google-analytics'
        strategy='afterInteractive'
      >
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          var isPwa = (window.matchMedia && (
            window.matchMedia('(display-mode: standalone)').matches ||
            window.matchMedia('(display-mode: fullscreen)').matches ||
            window.matchMedia('(display-mode: minimal-ui)').matches
          )) || window.navigator.standalone === true || (document.referrer && document.referrer.indexOf('android-app://') === 0);
          var platformType = isPwa ? 'pwa' : 'web';

          gtag('set', {
            platform_type: platformType
          });

          gtag('config', '${GA_ID}', {
            platform_type: platformType,
            user_properties: {
              platform_type: platformType
            }
          });
        `}
      </Script>

      <Suspense fallback={null}>
        <PageViewTracker gaId={GA_ID} />
      </Suspense>
    </>
  );
}
