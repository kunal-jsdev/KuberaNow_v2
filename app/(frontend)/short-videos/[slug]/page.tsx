import type { Metadata } from 'next';
import { draftMode } from 'next/headers';
import { notFound, permanentRedirect, redirect } from 'next/navigation';

import ShortsFeed, {
  type ShortsFeedItem,
} from '@/components/videos/ShortsFeed';
import { buildShortsHref, buildVideoHref } from '@/components/videos/utils';
import VideoSection from '@/components/videos/VideoSection';
import {
  formatShareDescription,
  getVideoDimensions,
  getVideoShareImageUrl,
} from '@/lib/utils/jsonLd';
import LivePreviewListener from '@/Payload/components/LivePreviewListener';
import { getMediaUrl } from '@/Payload/lib/utilities/getMediaUrl';
import { getServerSideURL } from '@/Payload/lib/utilities/getURL';
import { getVideoBySlug } from '@/Payload/lib/utilities/getVideoBySlug';
import { getVideoListing } from '@/Payload/lib/utilities/getVideoListing';
import { buildVideoSegment } from '@/Payload/lib/utilities/videoId';

export const revalidate = 600;

export const dynamicParams = true;

/** Shorts loaded into the feed: the listing's order, pinned first. */
const FEED_SIZE = 200;

const siteUrl = getServerSideURL().replace(/\/+$/, '');

type Args = {
  params: Promise<{ slug: string }>;
};

export default async function ShortDetailPage({ params }: Args) {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);
  const { isEnabled: draft } = await draftMode();

  const video = await getVideoBySlug(slug, draft);
  if (!video) notFound();

  // Horizontal videos live under /videos.
  if (video.ratio !== '9:16') {
    redirect(buildVideoHref(video.slug, video.video_id));
  }

  const canonicalPath = buildShortsHref(video.slug, video.video_id);
  const currentPath = `/short-videos/${encodeURIComponent(slug)}`;
  if (!draft && canonicalPath !== currentPath) {
    permanentRedirect(canonicalPath);
  }

  // `/short-videos/{videoId}` -> the canonical slug URL.
  if (buildVideoSegment(video.slug, video.video_id) !== slug) {
    permanentRedirect(canonicalPath);
  }

  // The feed runs in the listing's order (pinned first, then newest). A draft
  // opened in CMS preview isn't in it yet, so it leads the feed.
  const listed = await getVideoListing('9:16', FEED_SIZE);
  const ordered = listed.some((short) => short.id === video.id)
    ? listed
    : [video, ...listed];
  const items: ShortsFeedItem[] = ordered.map((short) => ({
    id: short.id,
    slug: short.slug,
    videoId: short.video_id,
    title: short.title,
    description: short.description,
    categoryTitle:
      typeof short.category === 'object'
        ? (short.category?.title ?? null)
        : null,
    poster: getMediaUrl(short.videoThumbnail) || short.thumbnailUrl || null,
    // YouTube sources are "upcoming" in the CMS; the HLS player can't play them.
    src: short.videoSource === 'upload' ? (short.hlsUrl ?? null) : null,
  }));
  const startIndex = items.findIndex((item) => item.id === video.id);

  return (
    <>
      {draft && <LivePreviewListener />}
      {/* No footer on this page at any size (see NO_FOOTER_PREFIXES).
          Phone: edge-to-edge card (cancels the page's 16px gutter), square
          corners, 16px padding. Tablet: card wraps the player (16px padding),
          centred. Desktop: full-width panel with the player centred (20px). */}
      <VideoSection layoutClassName='-mx-4 w-[calc(100%+2rem)] max-w-none rounded-none p-4 md:mx-auto md:w-fit md:max-w-237.5 md:rounded-lg lg:w-full lg:p-5'>
        <ShortsFeed
          items={items}
          startIndex={startIndex}
          siteUrl={siteUrl}
        />
      </VideoSection>
    </>
  );
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug: rawSlug } = await params;
  const { isEnabled: draft } = await draftMode();
  const video = await getVideoBySlug(decodeURIComponent(rawSlug), draft);

  if (!video) return { title: 'Short not found | KuberaNow' };

  const title = `${video.meta?.title || video.title} | KuberaNow`;
  const rawDescription = video.meta?.description || video.description || '';
  const description = formatShareDescription(
    rawDescription,
    'Watch short video on KuberaNow'
  );
  const url = `${siteUrl}${buildShortsHref(video.slug, video.video_id)}`;
  const dimensions = getVideoDimensions(video.videoThumbnail, true);
  const imageUrl = getVideoShareImageUrl(
    video.videoThumbnail,
    video.thumbnailUrl,
    true
  );

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'video.other',
      title,
      description,
      url,
      siteName: 'KuberaNow',
      ...(imageUrl && {
        images: [
          {
            url: imageUrl,
            width: dimensions.width,
            height: dimensions.height,
            type: 'image/jpeg',
            alt: video.title,
          },
        ],
      }),
    },
    twitter: {
      card: 'summary',
      title,
      description,
      ...(imageUrl && { images: [imageUrl] }),
    },
  };
}
