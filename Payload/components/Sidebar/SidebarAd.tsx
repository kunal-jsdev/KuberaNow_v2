import { SingleAdCard } from '@/components/AdvertisementCard';
import { getMediaUrl } from '@/Payload/lib/utilities/getMediaUrl';
import type { SidebarAdBlock } from '@/payload-types';

export function SidebarAd({
  adType,
  image,
  lottieFile,
  label,
  href,
}: SidebarAdBlock) {
  const caption = label ?? undefined;

  if (adType === 'lottie') {
    // depth: 2 populates the upload, but a deleted file comes back as a bare id.
    if (!lottieFile || typeof lottieFile !== 'object') return null;

    const lottieSrc = getMediaUrl(lottieFile);

    if (!lottieSrc) return null;

    return (
      <SingleAdCard
        lottieSrc={lottieSrc}
        alt={lottieFile.alt || 'Advertisement'}
        caption={caption}
        link={href}
      />
    );
  }

  if (!image || typeof image !== 'object') return null;

  const src = getMediaUrl(image);

  if (!src) return null;

  return (
    <SingleAdCard
      image={src}
      alt={image.alt || 'Advertisement'}
      caption={caption}
      width={image.width ?? undefined}
      height={image.height ?? undefined}
      // "Link URL" is optional in the CMS: blank means not clickable.
      link={href}
    />
  );
}

export default SidebarAd;
