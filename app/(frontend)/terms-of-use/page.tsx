import type { Metadata } from 'next';

import TermsOfUseSection from '../../../components/terms-of-use/TermsOfUseSection';
import { STATIC_PAGE_SEO } from '../../../constants/pageSeo';
import { buildStaticPageJsonLd } from '../../../lib/utils/jsonLd';
import { getTermsOfUseContent } from '../../../utils';

export const metadata: Metadata = {
  title: STATIC_PAGE_SEO.terms.title,
  description: STATIC_PAGE_SEO.terms.description,
};

export default async function TermsOfUsePage() {
  const content = await getTermsOfUseContent();

  const termsJsonLd = buildStaticPageJsonLd({
    path: '/terms-of-use',
    title: STATIC_PAGE_SEO.terms.title,
    description: STATIC_PAGE_SEO.terms.description!,
  });

  return (
    <>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(termsJsonLd) }}
      />
      <TermsOfUseSection content={content} />
    </>
  );
}
