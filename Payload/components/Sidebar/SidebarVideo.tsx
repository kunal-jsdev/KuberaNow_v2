import SidebarVideoCard from '@/components/sidebar/SidebarVideoCard';
import { getYouTubeId } from '@/Payload/components/Carousel/youtube';
import type { SidebarVideoBlock } from '@/payload-types';

export function SidebarVideo({ url, heading, autoplay }: SidebarVideoBlock) {
  if (!url) return null;

  const videoId = getYouTubeId(url);
  if (!videoId) return null;

  return (
    <SidebarVideoCard
      videoId={videoId}
      heading={heading}
      autoplay={autoplay}
      originalUrl={url}
    />
  );
}

export default SidebarVideo;
