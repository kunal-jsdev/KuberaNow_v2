import { Metadata } from 'next';

import PageSectionHeader from '../../../components/common/PageSectionHeader';
import { DISCLAIMER_SECTIONS } from '../../../constants/disclaimerData';
import { STATIC_PAGE_SEO } from '../../../constants/pageSeo';
import { buildStaticPageJsonLd } from '../../../lib/utils/jsonLd';
import { ContentRenderer } from '../../../utils/descriptionHelper';

const DISCLAIMER_DESCRIPTION =
  'Read the KuberaNow disclaimer to understand the limitations of liability, content accuracy, third-party links, and the terms governing the use of our website.';

export const metadata: Metadata = {
  title: STATIC_PAGE_SEO.disclaimer.title,
  description: DISCLAIMER_DESCRIPTION,
};

export default function DisclaimerPage() {
  const disclaimerJsonLd = buildStaticPageJsonLd({
    path: '/disclaimer',
    title: STATIC_PAGE_SEO.disclaimer.title,
    description: DISCLAIMER_DESCRIPTION,
  });

  return (
    <>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(disclaimerJsonLd) }}
      />
      <div className='border-border-soft bg-surface rounded-lg border p-3 shadow-sm md:p-5'>
        <PageSectionHeader
          className='mb-6'
          title={STATIC_PAGE_SEO.disclaimer.h1}
          as='h1'
        />
        {DISCLAIMER_SECTIONS.length > 0 ? (
          <div className='flex flex-col gap-4 md:gap-8'>
            {DISCLAIMER_SECTIONS.map((section) => (
              <section
                key={section.id}
                id={section.id}
                className='flex flex-col gap-3 md:gap-4'
              >
                <h2 className='text-subheading-small md:text-subheading-big text-text-disclaimer flex items-baseline gap-3 leading-5 font-bold md:gap-4 md:leading-6.5'>
                  <span>{section.number}</span>
                  <span>{section.title}</span>
                </h2>

                <ContentRenderer blocks={section.content} />
              </section>
            ))}
          </div>
        ) : (
          <div className='text-content-small md:text-content-big rounded-md border border-yellow-300 bg-yellow-50 px-3 py-2 text-yellow-700'>
            No content available.
          </div>
        )}
      </div>
    </>
  );
}
