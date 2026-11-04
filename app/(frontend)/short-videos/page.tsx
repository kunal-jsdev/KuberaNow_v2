import type { Metadata } from 'next';

import ShortsListingSection from '@/components/videos/ShortsListingSection';
import { VIDEO_PAGE_SEO } from '@/constants/pageSeo';
import { buildListingPageJsonLd } from '@/lib/utils/jsonLd';
import { buildVideoPageMetadata } from '@/lib/utils/videoPageMetadata';
import { getVideoListing } from '@/Payload/lib/utilities/getVideoListing';

export const revalidate = 600;

export const metadata: Metadata = buildVideoPageMetadata(VIDEO_PAGE_SEO.shorts);

/** Figma: four sections of six on first load; the rest load on scroll. */
const INITIAL_SHORTS = 24;

export default async function ShortsPage() {
  // One extra tells us whether infinite scroll has anything to load.
  const shorts = await getVideoListing('9:16', INITIAL_SHORTS + 1);

  const jsonLd = buildListingPageJsonLd({
    path: VIDEO_PAGE_SEO.shorts.schemaPath,
    title: VIDEO_PAGE_SEO.shorts.title,
    description: VIDEO_PAGE_SEO.shorts.description,
    breadcrumbName: VIDEO_PAGE_SEO.shorts.breadcrumbName,
  });

  return (
    <>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ShortsListingSection
        initialShorts={shorts.slice(0, INITIAL_SHORTS)}
        initialHasMore={shorts.length > INITIAL_SHORTS}
        mobileInterleave
      />
    </>
  );
}
