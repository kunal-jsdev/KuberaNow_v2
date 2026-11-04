import type { Metadata } from 'next';
import { Noto_Sans, Noto_Sans_Gujarati } from 'next/font/google';
import NextTopLoader from 'nextjs-toploader';

import GoogleAnalytics from '@/components/analytics/GoogleAnalytics';
import LogRocketSetup from '@/components/analytics/LogRocketSetup';
import { GlobalLiveBlogSyncProvider } from '@/components/common/GlobalLiveBlogSyncProvider';
import GoogleTranslatePatch from '@/components/common/GoogleTranslatePatch';
import FloatingCtaLoader from '@/components/FloatingCtaLoader';
import PWAInstallBanner from '@/components/pwa/PWAInstallBanner';
import SWRegistration from '@/components/pwa/SWRegistration';
import {
  MAIN_NAV_LINKS,
  MARKET_DROPDOWN_LINKS,
  NAV_PREVIEW_ENABLED,
} from '@/constants/navigation';
import { getNavConfig } from '@/Payload/lib/utilities/getNavConfig';
import { getNavPreviewNews } from '@/Payload/lib/utilities/getNavPreviewNews';
import { getServerSideURL } from '@/Payload/lib/utilities/getURL';

import ContentWrapper from '../../components/ContentWrapper';
import Footer from '../../components/Footer';
import FooterVisibility from '../../components/FooterVisibility';
import Header from '../../components/Header';
import MobileInterleaveFallback from '../../components/layout/MobileInterleaveFallback';
import ScrollManager from '../../components/layout/ScrollManager';
import SidebarWrapper from '../../components/Sidebarwrapper';

import './globals.css';

const notoSans = Noto_Sans({
  variable: '--font-noto-sans',
  subsets: ['latin'],
});
const notoSansGuj = Noto_Sans_Gujarati({
  variable: '--font-noto-sans-guj',
  subsets: ['gujarati'],
});
const siteUrl = getServerSideURL().replace(/\/+$/, '');
const defaultDescription =
  'Business, Markets, Money & Opportunities — Made Simple. Stay updated with Gujarat, India and the world through trusted business news, market updates, financial insights and stories that matter to you.';

const defaultImage = `${siteUrl}/assets/openGraph.jpg`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'KuberaNow | ગુજરાતનું Trusted Business Platform',
  description: defaultDescription,
  openGraph: {
    type: 'website',
    title: 'KuberaNow | ગુજરાતનું Trusted Business Platform',
    description: defaultDescription,
    url: siteUrl,
    siteName: 'KuberaNow',
    images: [
      {
        url: defaultImage,
        alt: 'KuberaNow | ગુજરાતનું Trusted Business Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KuberaNow | ગુજરાતનું Trusted Business Platform',
    description: defaultDescription,
    images: [defaultImage],
  },
};
export default async function RootLayout({
  children,
  sidebar,
}: Readonly<{
  children: React.ReactNode;
  sidebar: React.ReactNode;
}>) {
  const navConfig = await getNavConfig();
  // Fall back to the static links only when the CMS nav has no previewable
  // links at all — a tags-only nav must not pull in the static categories.
  const hasCmsSlugs =
    navConfig.allSlugs.length > 0 || navConfig.tagSlugs.length > 0;
  const navPreviewSlugs = hasCmsSlugs
    ? navConfig.allSlugs
    : [...MAIN_NAV_LINKS, ...MARKET_DROPDOWN_LINKS].map((link) =>
        link.href.replace(/^\//, '')
      );

  const navPreviewNews = NAV_PREVIEW_ENABLED
    ? await getNavPreviewNews(navPreviewSlugs, navConfig.tagSlugs)
    : undefined;

  return (
    <html
      lang='gu-IN'
      className={`${notoSans.variable} ${notoSansGuj.variable}`}
    >
      <body
        className={`${notoSansGuj.className} bg-background-color flex min-h-screen flex-col antialiased`}
      >
        <GoogleTranslatePatch />
        <NextTopLoader
          color='var(--color-primary-navy)'
          showSpinner={false}
        />
        <ScrollManager />
        <Header
          navPreviewNews={navPreviewNews}
          staticHeaderDropdown={navConfig.staticHeaderDropdown}
          staticHamburgerDropdown={navConfig.staticHamburgerDropdown}
          headerCategories={navConfig.header.categories}
          headerGroups={navConfig.header.groups}
          headerOrdered={navConfig.header.ordered}
          hamburgerCategories={navConfig.hamburger.categories}
          hamburgerGroups={navConfig.hamburger.groups}
          hamburgerOrdered={navConfig.hamburger.ordered}
        />

        <GlobalLiveBlogSyncProvider>
          <main className='bg-background-color flex w-full flex-1 justify-center overflow-x-clip px-4 py-4 md:py-6'>
            <div className='layout-shell flex w-full max-w-full min-w-0 flex-col items-start gap-5 md:max-w-318.5 md:flex-row'>
              <ContentWrapper>{children}</ContentWrapper>
              <SidebarWrapper>{sidebar}</SidebarWrapper>
            </div>
          </main>
          <MobileInterleaveFallback />

          <FooterVisibility>
            <Footer />
          </FooterVisibility>

          <FloatingCtaLoader />

          <PWAInstallBanner />
          <SWRegistration />

          <GoogleAnalytics />
          <LogRocketSetup />
        </GlobalLiveBlogSyncProvider>
      </body>
    </html>
  );
}
