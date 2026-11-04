import { getMediaUrl } from '@/Payload/lib/utilities/getMediaUrl';
import { buildVideoSegment } from '@/Payload/lib/utilities/videoId';

import type { VideoCardData } from './types';

/** The uploaded custom thumbnail wins; otherwise fall back to Cloudflare's. */
export function getVideoThumbnail(video: VideoCardData): string | null {
  return getMediaUrl(video.videoThumbnail) || video.thumbnailUrl || null;
}

export function getVideoCategoryTitle(video: VideoCardData): string | null {
  return typeof video.category === 'object'
    ? (video.category?.title ?? null)
    : null;
}

export function getVideoCategorySlug(video: VideoCardData): string | null {
  return typeof video.category === 'object'
    ? (video.category?.slug ?? null)
    : null;
}

export function buildVideoHref(slug: string, videoId?: string | null): string {
  return `/videos/${encodeURIComponent(buildVideoSegment(slug, videoId))}`;
}

export function buildShortsHref(slug: string, videoId?: string | null): string {
  return `/short-videos/${encodeURIComponent(buildVideoSegment(slug, videoId))}`;
}
