import type { Metadata } from 'next';

import ContactUsSection from '../../../components/contact-us/ContactUsSection';
import { STATIC_PAGE_SEO } from '../../../constants/pageSeo';
import { buildStaticPageJsonLd } from '../../../lib/utils/jsonLd';

const CONTACT_DESCRIPTION =
  'Get in touch with KuberaNow for news tips, press inquiries, technical support, advertising partnerships, and grievance matters.';

export const metadata: Metadata = {
  title: STATIC_PAGE_SEO.contact.title,
  description: CONTACT_DESCRIPTION,
};

export default function ContactUsPage() {
  const contactJsonLd = buildStaticPageJsonLd({
    path: '/contact-us',
    title: STATIC_PAGE_SEO.contact.title,
    description: CONTACT_DESCRIPTION,
    pageType: 'ContactPage',
  });

  return (
    <>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactJsonLd) }}
      />
      <ContactUsSection />
    </>
  );
}
