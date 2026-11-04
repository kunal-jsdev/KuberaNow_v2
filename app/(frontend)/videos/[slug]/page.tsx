import type { Metadata } from 'next';
import { draftMode } from 'next/headers';
import { notFound, permanentRedirect, redirect } from 'next/navigation';

import { buildShortsHref, buildVideoHref } from '@/components/videos/utils';
import VideoListingSection from '@/components/videos/VideoListingSection';
import VideoPlayerPanel from '@/components/videos/VideoPlayerPanel';
import {
  formatShareDescription,
  getVideoShareImageUrl,
} from '@/lib/utils/jsonLd';
import LivePreviewListener from '@/Payload/components/LivePreviewListener';
import { getServerSideURL } from '@/Payload/lib/utilities/getURL';
import { getVideoBySlug } from '@/Payload/lib/utilities/getVideoBySlug';
import { getRelatedVideos } from '@/Payload/lib/utilities/getVideoListing';
import { buildVideoSegment } from '@/Payload/lib/utilities/videoId';

export const revalidate = 600;

export const dynamicParams = true;

/**
 * Below the player, like the /videos page: "You May Like This" (6), a Shorts
 * row (3), then two more grids of 6. Same category as the video being watched
 * first (an IPO video gets IPO videos), topped up with the latest of the rest.
 */
const RELATED_VIDEO_LIMIT = 18;
// One Shorts row: 3 on desktop, 2 on phones, 4 on tablets.
const RELATED_SHORTS_LIMIT = 4;

const siteUrl = getServerSideURL().replace(/\/+$/, '');

type Args = {
  params: Promise<{ slug: string }>;
};

export default async function VideoDetailPage({ params }: Args) {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);
  const { isEnabled: draft } = await draftMode();

  const video = await getVideoBySlug(slug, draft);
  if (!video) notFound();

  // Vertical videos live under /short-videos.
  if (video.ratio === '9:16') {
    redirect(buildShortsHref(video.slug, video.video_id));
  }

  const canonicalPath = buildVideoHref(video.slug, video.video_id);
  const currentPath = `/videos/${encodeURIComponent(slug)}`;
  if (!draft && canonicalPath !== currentPath) {
    permanentRedirect(canonicalPath);
  }

  // `/videos/{videoId}` short link -> the canonical slug URL.
  if (buildVideoSegment(video.slug, video.video_id) !== slug) {
    permanentRedirect(canonicalPath);
  }

  const categoryId =
    typeof video.category === 'object' ? video.category?.id : video.category;

  const [related, shorts] = await Promise.all([
    getRelatedVideos('16:9', categoryId, RELATED_VIDEO_LIMIT, [video.id]),
    getRelatedVideos('9:16', categoryId, RELATED_SHORTS_LIMIT),
  ]);

  return (
    <>
      {draft && <LivePreviewListener />}
      <div
        data-source='video-detail'
        className='flex w-full flex-col gap-6 max-md:contents'
      >
        <VideoPlayerPanel
          video={video}
          url={`${siteUrl}${buildVideoHref(video.slug, video.video_id)}`}
        />
        <VideoListingSection
          videos={related}
          shorts={shorts}
          heading='You May Like This'
          headingAs='h2'
          maxShortsSections={1}
          // Hover previews (muted), but none on load: the main video is playing.
          previewPlayback
          autoplayFirst={false}
          mobileInterleave
        />
      </div>
    </>
  );
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug: rawSlug } = await params;
  const { isEnabled: draft } = await draftMode();
  const video = await getVideoBySlug(decodeURIComponent(rawSlug), draft);

  if (!video) return { title: 'Video not found | KuberaNow' };

  const title = `${video.meta?.title || video.title} | KuberaNow`;
  const rawDescription = video.meta?.description || video.description || '';
  const description = formatShareDescription(
    rawDescription,
    'Watch full video on KuberaNow'
  );
  const url = `${siteUrl}${buildVideoHref(video.slug, video.video_id)}`;
  const imageUrl = getVideoShareImageUrl(
    video.videoThumbnail,
    video.thumbnailUrl
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
            width: 1200,
            height: 630,
            type: 'image/jpeg',
            alt: video.title,
          },
        ],
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(imageUrl && { images: [imageUrl] }),
    },
  };
}
