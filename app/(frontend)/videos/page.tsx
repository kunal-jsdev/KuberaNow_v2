import { preconnect } from 'react-dom';

import type { Metadata } from 'next';

import VideoListingSection from '@/components/videos/VideoListingSection';
import { VIDEO_PAGE_SEO } from '@/constants/pageSeo';
import { buildListingPageJsonLd } from '@/lib/utils/jsonLd';
import { buildVideoPageMetadata } from '@/lib/utils/videoPageMetadata';
import { getVideoListing } from '@/Payload/lib/utilities/getVideoListing';

export const revalidate = 600;

export const metadata: Metadata = buildVideoPageMetadata(VIDEO_PAGE_SEO.videos);

const VIDEO_LIMIT = 30;
/** Two shorts rows: of 3 on desktop, 2 on phones, 4 on tablets (so 8). */
const SHORTS_LIMIT = 8;

export default async function VideosPage() {
  // Card previews stream from Cloudflare: open the connection (DNS + TLS)
  // while the page loads, not on the first hover.
  const streamDomain = process.env.CLOUDFLARE_STREAM_DOMAIN;
  if (streamDomain) {
    preconnect(`https://${streamDomain}`, { crossOrigin: 'anonymous' });
  }

  const [videos, shorts] = await Promise.all([
    getVideoListing('16:9', VIDEO_LIMIT),
    getVideoListing('9:16', SHORTS_LIMIT),
  ]);

  const jsonLd = buildListingPageJsonLd({
    path: VIDEO_PAGE_SEO.videos.schemaPath,
    title: VIDEO_PAGE_SEO.videos.title,
    description: VIDEO_PAGE_SEO.videos.description,
    breadcrumbName: VIDEO_PAGE_SEO.videos.breadcrumbName,
  });

  return (
    <>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <VideoListingSection
        videos={videos}
        shorts={shorts}
        previewPlayback
        mobileInterleave
      />
    </>
  );
}
