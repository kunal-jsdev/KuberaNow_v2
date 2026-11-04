import type { Metadata } from 'next';

import { STATIC_PAGE_SEO } from '../../../constants/pageSeo';
import { buildStaticPageJsonLd } from '../../../lib/utils/jsonLd';

export const metadata: Metadata = {
  title: STATIC_PAGE_SEO.careers.title,
  description: STATIC_PAGE_SEO.careers.description,
};

export default function CareersLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const careersJsonLd = buildStaticPageJsonLd({
    path: '/careers',
    title: STATIC_PAGE_SEO.careers.title,
    description: STATIC_PAGE_SEO.careers.description,
  });

  return (
    <>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(careersJsonLd) }}
      />
      {children}
    </>
  );
}
