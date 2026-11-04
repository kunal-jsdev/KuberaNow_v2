import type { Video } from '@/payload-types';

export type VideoCardData = Pick<
  Video,
  | 'id'
  | 'slug'
  | 'title'
  | 'description'
  | 'category'
  | 'videoThumbnail'
  | 'thumbnailUrl'
  // The shorts feed plays its neighbours straight from listing data.
  | 'hlsUrl'
  | 'videoSource'
  | 'video_id'
>;
