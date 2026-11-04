import type { Media } from '@/payload-types';

/**
 * Resolve a Payload Media relationship to a usable image URL.
 * Media is stored on Cloudinary, so prefer the transformed/cloudinary URL
 * and fall back to the default `url` field.
 */
export function getMediaUrl(media?: string | Media | null): string | null {
  if (!media || typeof media !== 'object') {
    return null;
  }

  return (
    media.transformedUrl ||
    media.cloudinaryUrl ||
    media.url ||
    media.originalUrl ||
    null
  );
}
