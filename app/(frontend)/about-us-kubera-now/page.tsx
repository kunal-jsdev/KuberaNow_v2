import type { Metadata } from 'next';

import { ABOUT_DESCRIPTION, ABOUT_TITLE } from '@/constants/about';
import { STATIC_PAGE_SEO } from '@/constants/pageSeo';
import { buildAboutPageJsonLd } from '@/lib/utils/jsonLd';

import AboutUsSection from '../../../components/about-us/AboutUsSection';

export const metadata: Metadata = {
  title: STATIC_PAGE_SEO.about.title,
  description: ABOUT_DESCRIPTION,
};

export default function AboutUsPage() {
  const aboutJsonLd = buildAboutPageJsonLd({
    title: ABOUT_TITLE,
    description: ABOUT_DESCRIPTION,
  });

  return (
    <>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutJsonLd) }}
      />
      <AboutUsSection />
    </>
  );
}
