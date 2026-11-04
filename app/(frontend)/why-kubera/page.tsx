import type { Metadata } from 'next';

import { BottomLineSection } from '@/components/home-page/BottomLineSection';
import { EcoSystemSection } from '@/components/home-page/EcoSystemSection';
import { GsapInit } from '@/components/home-page/GsapInit';
import { HeroSection } from '@/components/home-page/HeroSection';
import { MarketGapSection } from '@/components/home-page/MarketGapSection';
import { RevolutionSection } from '@/components/home-page/RevolutionSection';
import { StatsSection } from '@/components/home-page/StatsSection';
import { STATIC_PAGE_SEO } from '@/constants/pageSeo';
import { buildStaticPageJsonLd } from '@/lib/utils/jsonLd';

const WHY_KUBERA_DESCRIPTION =
  "Gujarat holds 5% of India's population but 15% of its demat accounts — and not one dedicated Gujarati business media platform. Read why we built KuberaNow to close that gap.";

export const metadata: Metadata = {
  title: STATIC_PAGE_SEO.whyKubera.title,
  description: WHY_KUBERA_DESCRIPTION,
};

export default function OurStoryPage() {
  const whyKuberaJsonLd = buildStaticPageJsonLd({
    path: '/why-kubera',
    title: STATIC_PAGE_SEO.whyKubera.title,
    description: WHY_KUBERA_DESCRIPTION,
    pageType: 'AboutPage',
  });

  return (
    <main>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(whyKuberaJsonLd) }}
      />
      <GsapInit />
      <HeroSection />
      <StatsSection />
      <MarketGapSection />
      <EcoSystemSection />
      <RevolutionSection />
      <BottomLineSection />
    </main>
  );
}
