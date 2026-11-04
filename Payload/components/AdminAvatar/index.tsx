'use client';

import { useAuth } from '@payloadcms/ui';

import DefaultAvatar from '@/lib/Icons/DefaultAvatar';
import type { Media, User } from '@/payload-types';

import '@/Payload/globals/NavConfig/nav-config.css';

const SIZE = 36;

const sharedStyle = {
  width: `${SIZE}px`,
  height: `${SIZE}px`,
  borderRadius: '50%',
  flexShrink: 0,
} as const;

export default function AdminAvatar() {
  const { user } = useAuth<User>();
  const avatar = user?.avatar;
  const url =
    avatar && typeof avatar === 'object' ? (avatar as Media).url : null;

  if (!url) return <DefaultAvatar sharedStyle={sharedStyle} />;

  return (
    // eslint-disable-next-line @next/next/no-img-element -- admin UI, outside the Next image pipeline
    <img
      src={url}
      alt={user?.name ?? 'Profile'}
      style={{ ...sharedStyle, objectFit: 'cover', display: 'block' }}
    />
  );
}
