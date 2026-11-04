import type { CSSProperties } from 'react';

type DefaultAvatarProps = {
  sharedStyle?: CSSProperties;
};

function DefaultAvatar({ sharedStyle }: DefaultAvatarProps) {
  return (
    <svg
      viewBox='0 0 36 36'
      role='img'
      aria-label='Default profile picture'
      style={{ ...sharedStyle, display: 'block' }}
    >
      <circle
        cx='18'
        cy='18'
        r='18'
        fill='#d4d4d8'
      />
      <circle
        cx='18'
        cy='14'
        r='6'
        fill='#a1a1aa'
      />
      <path
        d='M18 22c-6.2 0-11.2 4.1-12 9.4A18 18 0 0 0 30 31.4C29.2 26.1 24.2 22 18 22Z'
        fill='#a1a1aa'
      />
    </svg>
  );
}

export default DefaultAvatar;
