import clsx from 'clsx';
import Image from 'next/image';

import badgeError from '../../public/assets/badge-error.svg';
import badgeSuccess from '../../public/assets/badge-success.svg';

type AdvertiseStatusBadgeProps = {
  variant: 'success' | 'error';
  className?: string;
};

export default function AdvertiseStatusBadge({
  variant,
  className = '',
}: AdvertiseStatusBadgeProps) {
  const iconSrc = variant === 'success' ? badgeSuccess : badgeError;
  const altText = variant === 'success' ? 'Success badge' : 'Error badge';

  return (
    <div
      className={clsx(
        'relative inline-flex items-center justify-center',
        className
      )}
    >
      <Image
        src={iconSrc}
        alt={altText}
        width={100}
        height={100}
        className='object-contain'
      />
    </div>
  );
}
