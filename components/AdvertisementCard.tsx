import Image, { StaticImageData } from 'next/image';
import Link from 'next/link';

import LottieAd from '@/components/sidebar/LottieAd';
import SidebarIpoPoster from '@/public/assets/new-ipo-poster.png';
import SidebarAdPromotion2 from '@/public/assets/sidebar-ad-promotion2.png';

const EXTERNAL_LINK = /^(https?:\/\/|\/\/)|^[^/?#]+\.[^/?#]+/i;

function buildAdHref(link: string): { href: string; isExternal: boolean } {
  const raw = link.trim().replace(/^\/+/, '');
  const isExternal = EXTERNAL_LINK.test(raw);

  let base: string;
  if (!isExternal) {
    base = `/${raw}`;
  } else if (/^(https?:)?\/\//i.test(raw)) {
    base = raw.replace(/^\/\//, 'https://');
  } else {
    base = `https://${raw}`;
  }

  const separator = base.includes('?') ? '&' : '?';

  return { href: `${base}${separator}utm_source=adds_click`, isExternal };
}

export function SingleAdCard({
  image = SidebarIpoPoster,
  alt = 'Advertisement',
  className = '',
  caption,
  width,
  height,
  disableLink = false,
  link,
  lottieSrc,
}: {
  image?: StaticImageData | string;
  alt?: string;
  className?: string;
  caption?: string;
  width?: number;
  height?: number;
  disableLink?: boolean;
  link?: string | null;
  lottieSrc?: string | null;
}) {
  const hasIntrinsicSize = typeof image !== 'string';
  const hasExplicitSize = Boolean(width && height);
  const wrapperClassName = `flex w-76 max-w-full flex-col items-center justify-center gap-2 ${className}`;

  const renderMedia = () => {
    if (lottieSrc) {
      return (
        <div className='aspect-304/250 w-full'>
          <LottieAd
            src={lottieSrc}
            className='h-full w-full rounded-lg'
            ariaLabel={alt}
          />
        </div>
      );
    }

    if (hasIntrinsicSize || hasExplicitSize) {
      return (
        <Image
          src={image}
          alt={alt}
          width={width}
          height={height}
          className='h-auto w-full rounded-lg shadow-md'
        />
      );
    }

    return (
      <div className='relative aspect-304/250 w-full shadow-md'>
        <Image
          src={image}
          alt={alt}
          fill
          sizes='304px'
          className='rounded-lg object-cover'
        />
      </div>
    );
  };

  const content = (
    <>
      {renderMedia()}
      {caption && (
        <p className='text-content-small text-center leading-4 text-[#6E6E6E]'>
          {caption}
        </p>
      )}
    </>
  );

  if (disableLink || !link?.trim()) {
    return <div className={wrapperClassName}>{content}</div>;
  }

  const { href, isExternal } = buildAdHref(link);

  return (
    <Link
      href={href}
      className={wrapperClassName}
      {...(isExternal
        ? { target: '_blank', rel: 'noopener noreferrer sponsored' }
        : {})}
    >
      {content}
    </Link>
  );
}

export default function AdvertisementCard() {
  return (
    <div className='flex flex-col items-center gap-6'>
      <SingleAdCard
        image={SidebarIpoPoster}
        className='[&_img]:border [&_img]:border-[#E5E7EB] [&_img]:shadow-md'
      />
      <SingleAdCard image={SidebarAdPromotion2} />
    </div>
  );
}
