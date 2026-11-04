import type { Metadata } from 'next';

import AdvertiseSection from '../../../components/advertise/AdvertiseSection';
import { STATIC_PAGE_SEO } from '../../../constants/pageSeo';
import { buildStaticPageJsonLd } from '../../../lib/utils/jsonLd';

const ADVERTISE_DESCRIPTION =
  "Reach Gujarat's business audience with KuberaNow advertising across television, digital, newsletter, and social media channels.";

export const metadata: Metadata = {
  title: STATIC_PAGE_SEO.advertise.title,
  description: ADVERTISE_DESCRIPTION,
};

export default function AdvertisePage() {
  const advertiseJsonLd = buildStaticPageJsonLd({
    path: '/advertise-with-us',
    title: STATIC_PAGE_SEO.advertise.title,
    description: ADVERTISE_DESCRIPTION,
  });

  return (
    <>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(advertiseJsonLd) }}
      />
      <AdvertiseSection />
    </>
  );
}
