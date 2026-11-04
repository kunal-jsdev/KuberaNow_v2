import Image, { type StaticImageData } from 'next/image';
import Link from 'next/link';

import {
  LEADERBOARD_AD_IMAGE,
  LEADERBOARD_AD_REDIRECT_URL,
} from '@/constants/advertise';

type LeaderboardAdBannerProps = {
  className?: string;
  priority?: boolean;
  imageSrc?: StaticImageData | string;
  redirectUrl?: string;
  alt?: string;
};

export default function LeaderboardAdBanner({
  className = '',
  priority = true,
  imageSrc = LEADERBOARD_AD_IMAGE,
  redirectUrl = LEADERBOARD_AD_REDIRECT_URL,
  alt = 'Advertisement',
}: LeaderboardAdBannerProps) {
  return (
    <Link
      href={redirectUrl}
      target='_blank'
      rel='noopener noreferrer'
      aria-label={alt}
      className={`relative mx-auto flex aspect-728/90 w-full max-w-182 items-center justify-center overflow-hidden rounded ${className}`}
    >
      <Image
        src={imageSrc}
        alt={alt}
        fill
        sizes='(min-width: 1024px) 728px, 100vw'
        className='object-contain'
        priority={priority}
      />
    </Link>
  );
}
