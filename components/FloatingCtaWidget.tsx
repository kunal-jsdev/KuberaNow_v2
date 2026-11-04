'use client';

import { useSyncExternalStore } from 'react';

import { DotLottieReact } from '@lottiefiles/dotlottie-react';

type Position = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';

type DeviceConfig = {
  enabled: boolean;
  lottieUrl: string | null;
  link: string | null;
  position: Position;
  horizontalSpacing: number;
  verticalSpacing: number;
  width: number;
  height: number;
};

export type FloatingCtaWidgetProps = {
  desktop: DeviceConfig;
  mobile: DeviceConfig;
};

const MOBILE_QUERY = '(max-width: 767px)';

function subscribe(callback: () => void) {
  const mql = window.matchMedia(MOBILE_QUERY);
  mql.addEventListener('change', callback);
  return () => mql.removeEventListener('change', callback);
}

function useIsMobile(): boolean | null {
  return useSyncExternalStore<boolean | null>(
    subscribe,
    () => window.matchMedia(MOBILE_QUERY).matches,
    () => null
  );
}

function positionToStyle(
  position: Position,
  hSpacing: number,
  vSpacing: number
): React.CSSProperties {
  const style: React.CSSProperties = { position: 'fixed', zIndex: 50 };

  if (position.includes('bottom')) {
    style.bottom = `${vSpacing}px`;
  } else {
    style.top = `${vSpacing}px`;
  }

  if (position.includes('right')) {
    style.right = `${hSpacing}px`;
  } else {
    style.left = `${hSpacing}px`;
  }

  return style;
}

export default function FloatingCtaWidget({
  desktop,
  mobile,
}: FloatingCtaWidgetProps) {
  const isMobile = useIsMobile();

  if (isMobile === null) return null;

  const config = isMobile ? mobile : desktop;

  if (!config.enabled || !config.lottieUrl) return null;

  const posStyle = positionToStyle(
    config.position,
    config.horizontalSpacing,
    config.verticalSpacing
  );

  const isExternal =
    config.link &&
    (config.link.startsWith('http') ||
      config.link.startsWith('whatsapp:') ||
      config.link.startsWith('mailto:') ||
      config.link.startsWith('tel:'));

  return (
    <div
      style={{
        ...posStyle,
        width: `${config.width}px`,
        height: `${config.height}px`,
        pointerEvents: 'auto',
      }}
    >
      <a
        href={config.link ?? '#'}
        target={isExternal ? '_blank' : undefined}
        rel={isExternal ? 'noopener noreferrer' : undefined}
        aria-label='Floating CTA'
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          cursor: 'pointer',
        }}
      >
        <DotLottieReact
          src={config.lottieUrl}
          loop
          autoplay
          style={{
            width: '100%',
            height: '100%',
          }}
        />
      </a>
    </div>
  );
}
